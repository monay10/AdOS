# E010 — External Benchmarking Boundary (Sector & Global)

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 0. What this document is for

This is the one document in Book E whose entire purpose is to say **no** — clearly, on the
record, and without apology.

Every other Book E document describes something the product either does, could do, or should
do. This one draws a line and explains why the product will **not** cross it. It states the
honest boundary on **Sector benchmarking** ("you vs your industry") and **Global benchmarking**
("you vs everyone"), and it commits — in writing — to the constraints any future version would
have to honour if those capabilities were ever built.

The short version: **AdOS compares your creatives and your campaigns against your own data.
It does not, and will not, reach outside your workspace to fetch a sector average or a global
benchmark.** That boundary is not a gap we are embarrassed about. It is a promise we are proud
to make.

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

## 1. The desire — stated plainly

Let us name the thing users actually want, because it is a completely reasonable thing to want.

When an agency looks at its own numbers, the first two questions after "how am I doing?" are:

1. **"How do I compare to my sector?"** — *You vs Sector.* Is a 3.1× ROAS on a finance client
   good, average, or weak **for finance**? Is a 2.4% CTR strong **for e-commerce**?
2. **"How do I compare to everyone?"** — *You vs Global.* Where do my results sit against the
   whole market — the global average across all advertisers?

These are the benchmarks that show up in every pitch deck and every quarterly review. Clients
ask for them. Account leads want them to justify budgets. It is genuinely useful context, and
pretending otherwise would be dishonest.

So we will not pretend otherwise. **The desire is legitimate.** What follows is not a denial
that the desire matters — it is an explanation of why AdOS answers it differently from the
cloud tools that would happily sell you a "sector average" pulled from data you never agreed
to share.

---

## 2. The hard boundary — there is no external data source, by design

Here is the plain architectural truth.

**AdOS is 100% local.** It runs offline-first, over the agency's own workspace. There is:

- **NO external data ingestion.** Nothing enters the workspace from the outside.
- **NO vendor telemetry.** The product does not phone home; it collects nothing about you and
  sends nothing about you anywhere.
- **NO connectors, crawlers, or scrapers.** There is no component whose job is to reach out to
  the internet, a data vendor, or a peer agency and pull numbers in.

This is not aspirational language. It is verifiable in the code.

**There is no Sector or Global benchmark data source in the product.** The one component whose
name might suggest external ingestion — the *connector hub* — is **events-only**. Its module
re-exports event definitions and nothing else; the only artifact is an **event name**,
`CONNECTOR_METRIC_INGESTED_V1`, declared at
`domains/connector-hub/src/events.ts:11`, with **no implementation behind it**. It is a label
for a message shape, not a mechanism that fetches anything. No handler ingests, no client
connects, no metric flows.

Just as importantly: **there is no `fetch`, HTTP client, crawler, or scraper anywhere in the
product.** There is no code path — wired or unwired — that would carry a sector figure or a
global average across the local boundary and into the workspace. The data simply does not
exist inside AdOS, and there is no machinery to go get it.

### 2.1 The tier tag is unambiguous

| Capability | Tier | Why |
| --- | --- | --- |
| Sector benchmarking ("you vs your industry") | ❌ **ROADMAP** | No external data source; forbidden under the no-external-data boundary. |
| Global benchmarking ("you vs everyone") | ❌ **ROADMAP** | No external data source; forbidden under the no-external-data boundary. |
| Connector-based metric ingestion | ❌ **ROADMAP** | `connector-hub` is events-only; event name `events.ts:11`, no implementation. |
| External crawl / scrape / API fetch | ❌ **ROADMAP** | No such code exists; contradicts the offline-first boundary. |

Sector and Global benchmarking are **❌ ROADMAP — and effectively out-of-scope** under the
product's inviolable boundaries. They are not "coming in the next sprint." They are gated
behind a constraint that most competing products would have to abandon to deliver them, and
that AdOS will not abandon.

There is **no code citation** for any of these, because there is **no implementation** — and
under the honesty rules of this book, no citation means **❌ ROADMAP**. We will not dress a
boundary up as a shipped feature.

---

## 3. Why the boundary is correct — not a limitation to apologise for

It would be easy to file "no sector benchmarks" under *missing features*. That framing is
wrong. The boundary is a **deliberate design decision**, and it is the correct one.

### 3.1 External benchmarks require breaking the local boundary

Think mechanically about what a real sector average would require:

- **Either** the product ingests external data — someone's aggregated numbers flow *into* your
  workspace across the local boundary,
- **Or** the product exports your data — your numbers flow *out* to a shared pool so that the
  pool can compute an average that includes you,
- **Or** both, continuously, via telemetry and connectors that keep the shared dataset fresh.

Every one of these breaks the guarantee that makes AdOS trustworthy: **offline-first,
own-data-only.** The moment a sector average lands in your workspace, you are trusting a
pipeline you cannot see. The moment your ROAS joins a "global average," your client's private
performance has left the building. There is no version of external benchmarking that keeps both
promises — data-in and data-out — intact.

### 3.2 Reality-first — *önce gerçek*

Book E's governing discipline is **reality-first — *önce gerçek*.** A judgement is only worth
making if it stands on evidence you can actually verify. An external benchmark fails this test
twice over:

1. You cannot verify **the sample** — whose campaigns, over what period, cleaned how, is a
   vendor's "finance sector average" built from? You are asked to trust a number whose
   provenance you cannot inspect.
2. You cannot verify **the class match** — a purchased "sector average" almost never means
   *your* sub-vertical, *your* market, *your* budget tier. It is an average of averages,
   presented as if it applied to you.

Reality-first says: **do not import a number you cannot stand behind.** A benchmark built from
your own verifiable history is worth more than a glossy external figure whose truth you can
neither audit nor reproduce. The boundary is not us withholding a capability — it is us
refusing to manufacture false confidence.

### 3.3 Book E never produces new data — and never ingests external data

Two facts sit at the centre of this book, and they resolve the benchmarking question together:

- **Book E produces no new data.** It is the judgement layer. It scores, ranks, compares, and
  interprets evidence that already exists; it never mints a new fact. A sector benchmark would
  be a **new fact** injected from outside — precisely the thing Book E does not do.
- **Book E ingests no external data.** The evidence it judges over comes from the agency's own
  Performance Memory, not from a connector, a vendor feed, or a crawl.

So Sector/Global benchmarking is out of scope on **two** independent grounds: it would require
producing a data point Book E does not create, *and* ingesting external data Book E does not
accept. Either alone is disqualifying.

---

## 4. The only honest path — if it were ever added

Suppose, some day, the roadmap genuinely demanded a "you vs sector" view. There is exactly one
way to build it without lying to the user about where the data came from. Every part of what
follows is **❌ ROADMAP** and tightly constrained.

### 4.1 User-supplied benchmark data — and nothing else

The only admissible source is **benchmark data the agency itself supplies and owns.** The
agency drops in a file, a table, or a set of figures it has legitimately obtained — from an
industry body it belongs to, a report it purchased, a client it shares data with by agreement —
and AdOS compares against *that*, treating it as just another piece of user-owned evidence.

What remains **permanently forbidden**, even in this hypothetical:

- ❌ **Connectors** that reach out to a vendor or peer network.
- ❌ **Telemetry** that quietly exports the agency's numbers to compute a shared pool.
- ❌ **Scraping or crawling** the open web for competitor or industry figures.
- ❌ **A cloud service** that holds the benchmark and hands it back over a network call.

The distinction is the whole point. **User-supplied** means the data crossed the boundary
because a human at the agency chose to bring it in, knowingly, with provenance they control.
Everything else means the product crossed the boundary on the user's behalf, silently. The
first is compatible with AdOS's promises. The second never will be.

### 4.2 Even then, Benchmark Integrity still governs

User-supplied data does not buy an exemption from the rules. If such a comparison were ever
built, it would still have to obey **Benchmark Integrity (§5): same-class only.** A finance
client's ROAS may only be compared to a finance benchmark; you may not hold e-commerce numbers
up against a B2B baseline just because both files happen to be loaded.

And it would have to carry, visibly, alongside every comparison:

- **Sample size** — how many campaigns, clients, or observations the supplied benchmark rests
  on. A "sector average" built from six campaigns is a rumour, not a benchmark, and the user
  must be able to see that.
- **Source provenance** — where the benchmark came from, who produced it, and over what period.
  If the user cannot tell you the source, the product should not present it as authority.

This mirrors how AdOS already treats internal evidence: sample size is a first-class citizen in
the internal machinery — evidence weighting scales confidence by sample count
(`domains/executive-memory/src/reasoning.ts:29-51`), and `confidenceFromSample`
(`reasoning.ts:101`) explicitly caps confidence as a function of `n`. A user-supplied external
benchmark that arrived without its sample size and source would fail the same standard that
internal evidence already meets today.

> In short: even the *only* honest version of external benchmarking is **user-owned,
> same-class, sample-sized, and sourced** — or it does not ship.

---

## 5. LAW — Benchmark Integrity (same-class only)

**Only same-class items are compared.** Finance↔Finance, E-commerce↔E-commerce, B2B↔B2B. A
score or a result is never held up directly against a different context.

This law is the reason a "global average" is problematic **even if the data magically existed.**
A global benchmark is, by construction, a blend of every vertical, every market, and every
budget tier mixed together. Comparing a finance client to a *mixed-vertical* global mean
violates Benchmark Integrity at the root: you are comparing one class against a soup of all
classes. The number would look authoritative and mean almost nothing.

So the objection to Global benchmarking is not only *"the data does not exist"* — it is also
*"the comparison would be invalid even if it did."* Two independent failures:

1. **No source** (§2) — there is no external data, and no forbidden machinery to fetch it.
2. **No valid class** (this law) — a mixed-vertical global average cannot satisfy same-class
   comparison.

A **Sector** benchmark at least *could* be same-class in principle — finance vs a finance
benchmark. That is why §4's honest path is framed around sector-level, user-supplied,
class-matched data, not a global mean. But a **Global** average, mixing verticals, cannot be
made class-clean by any amount of data collection. It is ruled out by the law itself, not just
by the boundary.

---

## 6. The contrast — what IS feasible: You vs Agency, over your own data

None of this leaves the user without a benchmark. It leaves them with an **honest** one.

**Internal benchmarking — You vs Agency, over the agency's own data — is feasible and partly
shipped today.** This is the productive direction, and it lives in its sibling document:
[`./INTERNAL_BENCHMARKING.md`](./INTERNAL_BENCHMARKING.md).

The distinction in one line:

| | Sector / Global (this doc) | You vs Agency (internal) |
| --- | --- | --- |
| Data source | External — does not exist, forbidden | The agency's **own** Performance Memory |
| Boundary crossing | Requires data-in or data-out | None — stays entirely local |
| Tier | ❌ ROADMAP / out-of-scope | ✅ / 🔶 — real baselines exist |
| Same-class (Law) | Global fails by construction | Enforced, own verticals |

The internal side already has a live baseline: **per-client mean ROAS** is computed today at
`apps/web/src/routes.ts:1461-1470` (`avgRoas = reduce(...)/roasValues.length`) — **✅ SHIPPED.**
A **per-vertical baseline** exists as reusable machinery via `brain.marketing(vertical)`
(ROAS / CTR / sample size), consumed by the evidence engine at
`domains/executive-memory/src/reasoning.ts:25-33` — **🔶 BUILT (UNWIRED)**, because the live
app never calls `.marketing(`.

That is the honest benchmark surface: a shipped per-client baseline and dormant per-vertical
machinery, both over data the agency already owns, both same-class, none of it fetched from
outside. The internal document covers it in full — this document exists only to mark where that
surface **ends**.

There is deliberately **no agency-aggregate, sector-average, or global-benchmark data source**
anywhere in the product. That absence is intentional, and it is the subject of this page.

---

## 7. Worked scenarios — how the boundary answers real requests

The boundary is easiest to understand through the requests it will actually receive. In each
case, the answer is the same shape: *AdOS gives you the honest, own-data version; it does not
fabricate the external one.*

**Scenario A — "Give me my sector's average CTR so I can put it in the client deck."**
AdOS has no sector CTR. There is no data source (§2) and no machinery to fetch one (no
`fetch` / HTTP / scraper exists). What AdOS *can* put in the deck is the client's own CTR
history and, where wired, a per-vertical baseline drawn from the agency's own campaigns
(🔶 `reasoning.ts:25-33`) — a benchmark the agency can defend line by line because it built it.

**Scenario B — "Connect AdOS to our data vendor so it pulls in industry benchmarks nightly."**
This is precisely the connector/telemetry pattern the boundary forbids. The `connector-hub` is
events-only — `CONNECTOR_METRIC_INGESTED_V1` at `domains/connector-hub/src/events.ts:11` is a
name with no implementation behind it — and wiring a nightly pull would mean building the exact
ingestion pipeline AdOS commits never to build. The answer is no, and the reason is the promise,
not a missing sprint.

**Scenario C — "We bought an industry report. Can we compare against its numbers?"**
This is the *only* honest path (§4). The data is **user-supplied and agency-owned**: a human
chose to bring it in, with provenance they control. Even so, it is **❌ ROADMAP** today — no
such import exists — and if it were built it would have to be same-class (finance report vs
finance client) and carry the report's sample size and source on the face of every comparison.

**Scenario D — "Just show me where I rank globally, across everyone."**
Ruled out twice (§5): there is no global data source, and a mixed-vertical global mean cannot
satisfy same-class comparison even if the data existed. AdOS will not print an authoritative-
looking number that means almost nothing.

The pattern is consistent: **the request is legitimate, the own-data answer is offered, and the
boundary-crossing version is declined — on principle, in writing, every time.**

---

## 8. Value contribution — the boundary is a selling point

Here is the part that turns a "no" into an asset.

A boundary you can prove is worth more than a feature you cannot trust. **"We never send your
data anywhere"** is not a caveat AdOS mutters in the fine print — it is a **competitive,
trust-based selling point** against every cloud tool that quietly pools client performance to
manufacture its benchmarks.

- **Revenue.** An agency can stand in front of a security-conscious client — finance, health,
  regulated B2B — and say, truthfully, that the client's performance data never leaves the
  agency's own environment, never joins a vendor's shared dataset, and never trains a model.
  That is a differentiator that wins accounts a "sector benchmark" feature would lose. The
  benchmark the competitor offers is built by taking exactly the data this client refuses to
  share.
- **Production time / trust.** No connectors means no data-sharing agreements to negotiate, no
  telemetry to audit, no "where does the benchmark come from?" review to survive procurement.
  The agency spends its time judging creatives, not defending a data pipeline it did not build.

The cloud tool sells you a number and takes your data to make it. AdOS keeps your data and is
honest that it therefore does not have that number. For the clients who matter most, that trade
is not a limitation — it is the reason to choose AdOS.

---

## 9. Summary — the boundary in one place

- **The desire is real.** Users legitimately want *You vs Sector* and *You vs Global*. We do
  not dismiss it.
- **The boundary is absolute.** AdOS is 100% local: no external ingestion, no vendor telemetry,
  no connectors / crawlers / scrapers. The `connector-hub` is events-only — an event name at
  `domains/connector-hub/src/events.ts:11` with no implementation — and no `fetch` / HTTP /
  scrape code exists anywhere.
- **Therefore Sector/Global benchmarking is ❌ ROADMAP / out-of-scope.** No source, no citation,
  no shipped claim.
- **The boundary is correct**, not a shortfall: external benchmarks require breaking the
  offline-first, own-data-only guarantee — data must cross the boundary in or out. Reality-first
  — *önce gerçek* — refuses numbers you cannot verify.
- **The only honest future path** is **user-supplied, agency-owned** benchmark data — never
  connectors, telemetry, scraping, or a cloud service — and even then it must respect
  **Benchmark Integrity (same-class only)** and carry **sample size + source provenance.**
- **A Global average is ruled out twice**: no data source, *and* a mixed-vertical mean violates
  same-class comparison even if the data existed.
- **What is feasible is internal**: *You vs Agency* over the agency's own data — per-client mean
  ROAS (✅ `routes.ts:1461-1470`) and the per-vertical baseline (🔶 `reasoning.ts:25-33`) —
  covered in [`./INTERNAL_BENCHMARKING.md`](./INTERNAL_BENCHMARKING.md).
- **Book E produces no new data and ingests no external data.** A sector benchmark would be
  both a new fact and an external ingest — disqualified on either ground alone.
- **The boundary is the product.** "We never send your data anywhere" is a trust-based
  competitive advantage that a data-pooling benchmark feature would forfeit.

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
