# Book H · Part 3 — Trust & Isolation — Validation

> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Governing document:
> [`../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md`](../1-ecosystem-foundations/ECOSYSTEM_CONSTITUTION.md).
>
> **Laws:** *Core isolation — no package modifies the core · package independence — installable and
> removable standalone · trust boundary — nothing auto-trusted · no hidden execution — defined
> extension points only · the ecosystem never rewrites the core · implementation before documentation.*

Validation of Part 3 — the safety heart of Book H, which owns four of the six governing laws (1, 3,
4, 5). This part is validated **not** for shipping code — it has almost none — but for the far harder
property Book H must uphold here: that a design mandate is stated as a mandate, that the gap between
the mandate and today's code is named rather than dressed up, and that the single real primitive in
range (backup sha256) is quarantined from being read as content trust. On the axis that matters — is
this honest? — the result is **✅ PASS**.

---

## 1. Scope validated

| # | Document | Purpose | Tier focus |
|---|---|---|---|
| H005 | [`TRUST_BOUNDARY.md`](TRUST_BOUNDARY.md) | Owns Law 3 · nothing auto-trusted · the seven-field manifest (Publisher · Version · Signature · Compatibility · License · Hash · Validation Status) | ❌ |
| H006 | [`CORE_EXTENSION_MODEL.md`](CORE_EXTENSION_MODEL.md) | Owns Laws 1 / 4 / 5 · how the core is extended · isolation as the consequence | ❌ |

## 2. Checks

The honest posture of this table is that most rows validate a *specification's integrity*, not a
running feature. Where a row is ❌, the ❌ is the correct and intended result: the document claims no
code, so the check confirms it claims none.

| Check | Result | Notes |
|---|---|---|
| Law 3 owned and correctly scoped | ✅ PASS | `TRUST_BOUNDARY.md` declares Law 3 verbatim, frames it as default-deny plus a crossable manifest, and places the obligation on the package ("every package MUST carry…"), not the platform. |
| Seven-field manifest complete and each field justified | ✅ PASS | Publisher · Version · Signature · Compatibility · License · Hash · Validation Status — all seven present, each with *what it asserts* + *why the boundary is unsafe without it*; §3.8 composes them into one admission gate. |
| Trust machinery honestly tiered ❌ | ❌ NOTED | Correct by design: no manifest type, no installer, no default-deny gate, no signing/license/compatibility/hash-validation code exists. The document tiers all of it ❌ ROADMAP and cites no code for it. This ❌ is the honest headline, not a defect. |
| Validation Status lifecycle stated as design | ✅ PASS | `pending · verified · certified · revoked` defined as the boundary's own verdict; `revoked` named as what makes trust revisable. All four states tiered ❌ (no lifecycle code) — stated, not implied shipped. |
| Backup sha256 quarantined from content trust | ✅ PASS | §4 cites the real primitive — `sha256` ([archive.ts:18-19](../../packages/backup/src/archive.ts#L18)), per-entry checksum ([archive.ts:38](../../packages/backup/src/archive.ts#L38)), verify-on-restore ([archive.ts:108](../../packages/backup/src/archive.ts#L108)) — then states plainly it is *backup* integrity, not signing, and "must never be cited as evidence that the Trust Boundary is anything other than ❌ ROADMAP." No over-read. |
| Law 1 owned and tied to the freeze | ✅ PASS | `CORE_EXTENSION_MODEL.md` declares Law 1 and grounds it in the core's own freeze declaration ([`../../ADOS_CORE_SPECIFICATION.md`](../../ADOS_CORE_SPECIFICATION.md)) — "consume, observe, or extend … without altering their contracts." Isolation framed as premise, not the subject. |
| Law 4 owned — defined extension point defined | ✅ PASS | A defined extension point is declared-not-discovered, accepts *data not hidden behaviour*, is one-directional and observable; the declaration-vs-module contrast makes "No Hidden Execution" concrete. |
| Law 5 owned — add-only, four untouchables | ✅ PASS | Five addable shapes (template · workflow · prompt · benchmark · playbook) vs the four untouchables (Pipeline · Memory · Analytics · Evidence) drawn as a bright line; §6 traces why Laws 1+4+5 *yield* isolation by construction. |
| No first-class extension point honestly tiered ❌ | ❌ NOTED | Correct by design. The composition root is closed — `App` takes only `bus`/`ai`/`repos` ([app.ts:69-72](../../apps/web/src/app.ts#L69)); the only live seam is read-only wildcard observation `subscribe('>')` ([app.ts:120](../../apps/web/src/app.ts#L120)); the registration *shape* exists but is unwired (`register()` [model-registry.ts:57](../../packages/ai-manager/src/model-registry.ts#L57), 🔶). The framework itself is ❌ ROADMAP. Stated as such. |
| Tier-tag discipline — ✅ / 🔶 / ❌ with citation rules | ✅ PASS | The one 🔶 anchor (`register()` [model-registry.ts:57](../../packages/ai-manager/src/model-registry.ts#L57)) and the one ✅ live-but-observe-only seam ([app.ts:120](../../apps/web/src/app.ts#L120)) carry citations; every ❌ claim carries none. No unbuilt capability is presented as shipped. |
| No ✅ ecosystem feature invented | ✅ PASS | The strongest real tier in this part is 🔶 (an unwired registration shape) and a ✅ that is observe-only. No ecosystem trust or extension feature is claimed live. Consistent with the book's honest headline. |
| Laws 1 / 3 / 4 / 5 ownership non-overlapping | ✅ PASS | H005 owns Law 3 exclusively; H006 owns Laws 1/4/5 exclusively; each names the neighbour law it does *not* own (H005→Law 4 in H006; H006→Law 3 in H005) and hands off cleanly. No double-ownership, no gap. |
| Matched-pair handoff coherent | ✅ PASS | Trust Boundary (may it be trusted) and No Hidden Execution (what may it do once trusted) are framed as a matched pair; the extension model explicitly assumes a *validated* declaration, closing the loop between the two docs. |
| Boundaries section present in both | ✅ PASS | Both docs carry a boundaries section: local / own-content-only / default-deny (H005) and local / own-data-only / no hidden execution (H006). Neither weakens the inherited guarantees; each shows the boundary *protecting* them. |
| Value contribution present in both | ✅ PASS | H005 — third-party content made safe to adopt (revenue) + protects the revenue the core already earns; H006 — extensible without fragile (revenue) + proven work added not rebuilt (production time). Both map to a value lever. |
| Invariant sentence | ✅ PASS | "The ecosystem extends the core; it never rewrites the core." present verbatim and prominent in both docs (H005 §1/§8; H006 §1/§6/§8). |
| Citation accuracy / cross-refs | ✅ PASS | Every cited `path:line` (`archive.ts:18-19/:38/:108`, `app.ts:69-72/:120`, `model-registry.ts:57`) resolves; cross-doc, governing-doc, and core-spec links resolve. |
| Documentation-only hygiene | ✅ PASS | Only `book-h/3-trust-and-isolation/` files added. No application code, packages, domains, or tests modified. |
| Forbidden legacy label | ✅ PASS | "Advertising Operating System" absent from both documents. |

## 3. Verdict

**✅ PASS.** Part 3 is the safety heart of Book H, and it passes on the only axis a mostly-❌ part can
honestly be judged: it states a mandate as a mandate. Law 3's seven-field manifest and the Law 1/4/5
extension model are specified completely and rigorously; every field and every seam is justified; and
the two places a reader could over-read the code — the backup sha256 primitive and the unwired
`register()` shape — are named precisely and fenced off from any claim they do not support. The
strongest real tier here is 🔶 (an unwired registration shape) beside a ✅ seam that can only observe;
there is no ✅ trust or extension feature, and the documents invent none. The pervasive ❌ is not a
failure of the validation — it is the validated truth: this is the work Book H commits to build, and
saying so plainly is exactly what keeps the part honest.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
