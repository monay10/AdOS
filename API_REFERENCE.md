# AdOS — API Reference

The web app is server-rendered HTML over a small HTTP surface. All routes below
the auth gate require a session cookie and run inside a `TenantContext` — every
read/write is scoped to the caller's tenant. Forms are
`application/x-www-form-urlencoded`; mutations redirect (303) on success.

## Authentication

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/login` | — | Login page |
| POST | `/login` | `email`, `company` (dev) or `email`, `password` (`AUTH_MODE=password`) | Sets session cookie |
| POST | `/logout` | `_csrf` | Clears session |

In password mode: `POST /register`, `/reset`, `/change-password` are also served.

## Onboarding & entities

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/workspaces`, `/workspaces/new` | Workspaces |
| GET/POST | `/clients`, `/clients/new` | Clients |
| GET/POST | `/brands`, `/brands/new` | Brands |
| GET/POST | `/products`, `/products/new` | Products |
| GET/POST | `/projects`, `/projects/new` | Projects |
| POST | `/projects/:id/{status,goal,member,archive}` | Project mutations |

## Missions & the AI pipeline

| Method | Path | Stage |
| --- | --- | --- |
| GET/POST | `/missions`, `/missions/new` | List / create a Mission |
| GET | `/missions/:id` | Mission detail (all stages) |
| POST | `/missions/:id/brief` · `/approve` · `/reject` | Marketing Brief + review |
| POST | `/missions/:id/creative` · `/creative/approve` · `/creative/reject` | Creative + review |
| POST | `/missions/:id/campaign` · `/campaign/approve` · `/campaign/reject` | Campaign + review |
| POST | `/missions/:id/analytics` | Analytics report (metrics in body) |
| POST | `/missions/:id/executive` | CEO dashboard |
| POST | `/missions/:id/learn` | Record learning to Company Brain |
| POST | `/missions/:id/cancel` | Cancel (`reason` optional) |

## Workflow, assets, reports

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/approvals`, `/approvals/new` | Approval workflow |
| POST | `/approvals/:id/{submit,approve,reject,revise}` | Transitions |
| GET/POST | `/assets`, `/assets/new` | Asset library (versioned) |
| POST | `/assets/:id/{tag,version}` | Tag / new version |
| GET | `/brief` `/creative` `/campaigns` `/analytics` `/executive` | Pipeline output lists |
| GET/POST | `/reports`, `/reports/new` | Client performance reports |
| GET | `/settings` · POST `/settings` | Workspace settings |
| GET | `/metrics` | Prometheus metrics |

## Internal port — `AIManagerPort`

The only interface any agent uses to request AI work (Product Constitution rule).
Implementations: `OfflineAIManager` (default, deterministic) and `LiveAIManager`
(local engine). Contract in `@ados/contracts`:

```ts
interface AIManagerPort {
  submit<T>(request: AITaskRequest): Promise<AITaskResult<T>>;
  stream(request: AITaskRequest): AsyncIterable<AIStreamChunk>;
}
```

`AITaskRequest` carries a `capability`, a versioned `promptRef`, `variables`, and
a `responseSchema` the output must satisfy. No agent ever talks to an inference
engine directly.
