import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TenantContext, type RequestContext } from '@ados/tenancy';
import { ApprovalId } from '@ados/agency-os';
import { App } from './app.js';
import { buildServer } from './server.js';
import { slugifyTenant } from './session.js';

const SECRET = 'test-secret';

let app: App;
let base: string;
let close: () => Promise<void>;

beforeAll(async () => {
  app = new App();
  await app.start();
  const { server } = buildServer({ sessionSecret: SECRET, app });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
  close = () => new Promise<void>((r) => server.close(() => r()));
});

afterAll(async () => {
  await close();
});

function client() {
  let cookie = '';
  return {
    async req(method: string, path: string, body?: Record<string, string>) {
      const headers: Record<string, string> = {};
      if (cookie) headers['cookie'] = cookie;
      let payload: string | undefined;
      if (body) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        payload = new URLSearchParams(body).toString();
      }
      const res = await fetch(`${base}${path}`, { method, headers, ...(payload ? { body: payload } : {}), redirect: 'manual' });
      const sc = res.headers.get('set-cookie');
      if (sc) cookie = sc.split(';')[0]!;
      return res;
    },
  };
}

async function login(c: ReturnType<typeof client>, company: string) {
  const tenantId = slugifyTenant(company);
  const asT = <T>(fn: () => Promise<T>): Promise<T> =>
    TenantContext.run({ tenantId, correlationId: 't', actor: 'o@x.com', roles: [] } as RequestContext, fn);
  await c.req('POST', '/login', { email: 'o@x.com', company });
  return { tenantId, asT };
}

describe('Phase 8 — Approval Workflow (UI to persistence)', () => {
  it('walks Draft → In Review → Revision Requested → In Review → Approved with a timeline and events', async () => {
    const c = client();
    const { tenantId, asT } = await login(c, 'Approval Demo Co');

    // Create the approval (Draft).
    let r = await c.req('POST', '/approvals', { title: 'Q2 launch budget', description: 'Sign off 80k spend' });
    expect(r.status).toBe(303);
    const id = r.headers.get('location')!.replace('/approvals/', '');
    expect(id).toBeTruthy();

    let dash = await (await c.req('GET', `/approvals/${id}`)).text();
    expect(dash).toContain('Q2 launch budget');
    expect(dash).toContain('Draft');
    expect(dash).toContain('Submit for review');
    expect(dash).toContain('Timeline');

    // Submit → In Review.
    r = await c.req('POST', `/approvals/${id}/submit`);
    expect(r.status).toBe(303);
    dash = await (await c.req('GET', `/approvals/${id}`)).text();
    expect(dash).toContain('In Review');
    expect(dash).toContain('Approve');
    expect(dash).toContain('Request revision');

    // Request revision → Revision Requested (with a note).
    r = await c.req('POST', `/approvals/${id}/revise`, { note: 'trim the creative budget' });
    expect(r.status).toBe(303);
    dash = await (await c.req('GET', `/approvals/${id}`)).text();
    expect(dash).toContain('Revision Requested');
    expect(dash).toContain('trim the creative budget');
    expect(dash).toContain('Resubmit for review');

    // Resubmit → In Review, then Approve.
    await c.req('POST', `/approvals/${id}/submit`);
    r = await c.req('POST', `/approvals/${id}/approve`, { note: 'approved after revision' });
    expect(r.status).toBe(303);
    dash = await (await c.req('GET', `/approvals/${id}`)).text();
    expect(dash).toContain('Approved');
    expect(dash).toContain('this request is closed');
    expect(dash).toContain('approved after revision');

    // Persistence: the full timeline + final state are stored.
    await asT(async () => {
      const a = (await app.approvals.get(ApprovalId.of(id))).unwrap();
      expect(a.status).toBe('approved');
      expect(a.timeline.map((t) => t.action)).toEqual([
        'created',
        'submitted',
        'revision_requested',
        'submitted',
        'approved',
      ]);
      expect(a.timeline[2]!.note).toBe('trim the creative budget');
      expect(a.timeline[4]!.note).toBe('approved after revision');
    });

    // Events for every transition fired on the bus.
    const events = app.recentEvents(tenantId, 60).map((e) => e.eventName);
    for (const expected of [
      'approval.created.v1',
      'approval.submitted.v1',
      'approval.revision_requested.v1',
      'approval.approved.v1',
    ]) {
      expect(events).toContain(expected);
    }

    // The list screen shows it.
    const list = await (await c.req('GET', '/approvals')).text();
    expect(list).toContain('Q2 launch budget');
    expect(list).toContain('Approved');
  });

  it('rejects an in-review request and refuses out-of-order transitions', async () => {
    const c = client();
    await login(c, 'Approval Reject Co');

    const created = await c.req('POST', '/approvals', { title: 'Risky idea', description: '' });
    const id = created.headers.get('location')!.replace('/approvals/', '');

    // Cannot approve a draft — the state machine re-renders with an error.
    let r = await c.req('POST', `/approvals/${id}/approve`);
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('class="err"');

    await c.req('POST', `/approvals/${id}/submit`);
    r = await c.req('POST', `/approvals/${id}/reject`, { note: 'not viable' });
    expect(r.status).toBe(303);
    const dash = await (await c.req('GET', `/approvals/${id}`)).text();
    expect(dash).toContain('Rejected');
    expect(dash).toContain('not viable');
  });

  it('requires a title', async () => {
    const c = client();
    await login(c, 'Approval Validate Co');
    const r = await c.req('POST', '/approvals', { title: '', description: 'x' });
    expect(r.status).toBe(400);
    expect(await r.text()).toContain('class="err"');
  });

  it('isolates approvals by tenant', async () => {
    const c1 = client();
    await login(c1, 'Approval Tenant A');
    await c1.req('POST', '/approvals', { title: 'A-only approval', description: '' });

    const c2 = client();
    await login(c2, 'Approval Tenant B');
    const list = await (await c2.req('GET', '/approvals')).text();
    expect(list).toContain('No approvals yet');
  });
});
