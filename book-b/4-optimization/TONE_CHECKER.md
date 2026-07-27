# Tone Checker — Verifying Generated Copy Sounds Like the Brand

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP (voice stored, never checked).** AdOS records
> a brand's tone of voice as a **static field** — `BrandProfile.voice`
> (`domains/agency-os/src/brand/brand.ts:24`, default `'professional'` at `:64`) and a
> CompanyDNA `tone` string — but **no code ever compares generated copy against that
> descriptor.** There is no tone analyzer, no tone-fit score, no tone flag anywhere in
> the codebase. The voice string is, at most, injected *into* a prompt by an unwired
> context builder (`domains/executive-memory/src/context-builder.ts:54`); it is never
> read back *out* of the model's output to confirm the copy actually sounds that way.
> Everything below the "Today" section is a design specification.

---

## 1. Why this document exists

A brand has a voice. One client is `playful`, another is `authoritative`, a third is
`warm and plain-spoken`. The agency's whole value proposition is that every asset it
ships *sounds like the client* — not like a generic language model, and not like the
last client's brand.

AdOS already **stores** that voice. When a brand is created, its profile carries a
`voice` descriptor (`domains/agency-os/src/brand/brand.ts:24`), and the Company Brain
carries a parallel CompanyDNA `tone`. When a **CreativeSet** is generated, a local model
returns six copy fields in one shot — `headline`, `adCopy`, `cta`, `socialPost`,
`landingPage`, `email` (`domains/creative-studio/src/creative/service.ts:42-55`).

The gap this document addresses: **nothing verifies that those six fields honor the
stored voice.** The model is *asked* to write in-brand (when the voice string reaches
the prompt at all), but the output is never *checked* against the descriptor. A
`playful` brand can receive stiff, corporate copy; an `authoritative` brand can receive
breezy filler — and AdOS today would pass both straight to a human reviewer with no
signal that the tone drifted.

The **Tone Checker** is the QA sub-check that closes that gap: it compares generated
copy against the brand's voice descriptor and emits a **tone-fit signal plus flags**,
which feed the parent Creative QA stage
([`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md)) and,
when tone drifts far enough, the Revision path.

**Relationship to its siblings.** The Tone Checker is one of three content-quality
sub-checks specified for Part 4. It is **not** the same as:

| Sub-check | Question it answers | Doc |
|---|---|---|
| **Tone Checker** (this doc) | Does the copy *sound like this brand's voice*? | this file |
| **Readability** | Is the copy *clear and easy to read* (length, sentence complexity)? | [`READABILITY.md`](READABILITY.md) |
| **Scoring** | What is the *aggregate quality number* per prompt/model over time? | [`SCORING.md`](SCORING.md) |

Tone is **brand-relative** (there is no universally "good" tone — only on-brand vs
off-brand), which is exactly what distinguishes it from readability's brand-neutral
clarity metric.

---

## 2. Target design

### 2.1 Position in the AI-agent pipeline

The Tone Checker is a stage inside the **Quality** band of the Book B pipeline
(`… → Generation → Quality → Brand Safety → Revision → Approval → …`). It runs **after**
generation produces copy and **before** a human sees it, as a sub-check owned by
Creative QA:

```
CreativeSet generated (6 fields)
        │
        ▼
  ┌─────────────── Creative QA ───────────────┐
  │  structural check (JSON shape)             │
  │  Readability  ──►  clarity signal          │
  │  Tone Checker ──►  tone-fit signal + flags │   ◄── this document
  │  Brand Safety ──►  bannedWords verdict     │
  └────────────────────┬───────────────────────┘
                       │
             tone-fit below policy floor?
                 │yes            │no
                 ▼               ▼
        Revision (rewrite)   Human approval
         request, per-field   (creative_assets gate)
```

The Tone Checker never blocks a mission on its own and never edits copy. It **advises**:
it produces a signal and flags, attaches them to the artifact's QA record, and lets the
QA policy and the human reviewer decide. This matches the AdOS principle that the
`creative_assets` approval gate — a human click — remains the authority
([`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md)).

### 2.2 Inputs

| Input | Source | Notes |
|---|---|---|
| The six copy fields | CreativeSet (`creative/service.ts:42-55`) | Each field checked independently *and* as a set |
| Brand voice descriptor | `BrandProfile.voice` (`brand/brand.ts:24`) | e.g. `playful`, `authoritative` |
| CompanyDNA tone | Company Brain DNA `tone` | Secondary descriptor; reconciled with `voice` |
| Output language | Language injection (`apps/web/src/ai-live.ts:139-141`) | Tone is judged **in-language** (TR or EN) |

The voice descriptor is deliberately drawn from the **same** stored fields that Brand
Injection uses to *write* the copy
([`../1-ai-foundations/BRAND_INJECTION.md`](../1-ai-foundations/BRAND_INJECTION.md)) —
so the Tone Checker holds generation accountable to the very instruction it was given.
Where injection is the "write it this way" step, the Tone Checker is the "did you?"
step.

### 2.3 The check itself — local-AI based

Because tone is qualitative and brand-relative, a deterministic string rule cannot judge
it. The Tone Checker is specified as a **local-AI sub-check**: a single, tightly-scoped
`ai.submit(...)` call routed through the same local-only stack the rest of AdOS uses —
Ollama or an OpenAI-compatible local server, no cloud, no API key
(`apps/web/src/ai-factory.ts:23-57`). When no live engine is configured, it degrades to
the deterministic offline stub, which returns a neutral, no-drift signal rather than a
false verdict (`apps/web/src/ai.ts:13`).

The call is a **judge task**, not a generation task: given the brand voice descriptor
and one copy field, return a structured tone-fit assessment. It writes nothing, launches
nothing, and touches no ad platform — consistent with the creative subsystem's rule that
it "produces copy ONLY" (`domains/creative-studio/src/creative/creative-set.ts:16-17`).

**Output contract (specified):**

| Field | Type | Meaning |
|---|---|---|
| `toneFit` | `0.0–1.0` | How closely the field matches the voice descriptor |
| `descriptorEcho` | `string` | The voice the checker judged against (audit echo) |
| `flags[]` | `string[]` | Named drifts, e.g. `too_formal`, `off_register`, `generic_voice` |
| `worstField` | `string` | Which of the six fields drifted most |
| `rationale` | `string` | One-line, human-readable justification |

Every assessment carries the standard AdOS
`provenance{taskId,capability,model,engine,latencyMs}` block, so a reviewer can see which
local model judged the tone and how long it took — exactly as generation artifacts do.

**Flag taxonomy (specified).** Flags are a small, closed vocabulary so that downstream
Revision can act on them mechanically rather than parsing free text:

| Flag | Fires when copy is… | Typical against voice… |
|---|---|---|
| `too_formal` | Stiffer / more corporate than the descriptor | `playful`, `warm`, `casual` |
| `too_casual` | Looser / more flippant than the descriptor | `authoritative`, `professional` |
| `off_register` | Wrong emotional register (e.g. hype for a somber brand) | any |
| `generic_voice` | Sounds like a default model, no brand character | any |
| `inconsistent_set` | Fields disagree with each other in tone | any (set-level flag) |

The `inconsistent_set` flag is set-level rather than field-level: it fires when the six
fields individually pass but *diverge* from one another — a `headline` that is playful
next to an `email` that is buttoned-up. Catching intra-set drift is something a hurried
human reviewer routinely misses, and is a distinct value of judging the fields both
independently and as a set.

### 2.4 Policy — warn / flag, never silently block

The Tone Checker's policy is **advisory-first**, tiered to the tone-fit signal:

| `toneFit` band | Policy action | Effect on pipeline |
|---|---|---|
| `≥ 0.75` | **pass** | No flag; artifact proceeds to human review |
| `0.50 – 0.75` | **warn** | Flag attached; artifact still reaches human review, annotated |
| `< 0.50` | **flag** | Strong flag; QA policy MAY route to Revision before human review |

Two hard rules, both inherited from the AI Constitution
([`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)):

1. **The checker advises; the human decides.** Even a `flag` never auto-rejects an
   asset. It can *route* copy to the Revision path, but the `creative_assets` gate — a
   human approval click — is still the only thing that ships or kills an asset.
2. **A silent tone check is a broken tone check.** Every verdict is recorded on the
   artifact with its rationale and provenance. A reviewer must always be able to see
   *that* tone was checked and *why* it passed or flagged — never a hidden downgrade.

### 2.5 Feeding QA and Revision

The tone-fit signal and flags are consumed by two downstream stages:

- **Creative QA** ([`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md))
  aggregates the tone-fit signal alongside readability and brand-safety verdicts into
  the artifact's single QA record. Tone is one weighted input to the composite QA
  picture — never the sole gate.
- **Revision** consumes `worstField` + `flags` to request a **targeted, non-destructive**
  rewrite of only the drifting field(s), re-injecting the voice descriptor more forcibly.
  This is the AI-driven counterpart to today's human-only revision request and directly
  motivates Book A walkthrough gap **B-3** (non-destructive revision): tone drift is a
  concrete trigger for a scoped rewrite rather than a full regeneration.

---

## 3. Today — what actually exists

**Tier: ❌ ROADMAP (voice stored, never checked).** No part of the Tone Checker is
built. What exists today is only the *storage* of voice/tone, plus one *unwired*
injection of tone into a prompt. Nothing reads copy back and judges it.

### 3.1 Voice/tone is stored — and that is all

| Fact | Tier | Evidence |
|---|---|---|
| Brand carries a `voice` descriptor | ✅ SHIPPED (stored) | `domains/agency-os/src/brand/brand.ts:24` (`voice: string`) |
| Default voice is `'professional'` | ✅ SHIPPED (stored) | `domains/agency-os/src/brand/brand.ts:64` |
| CompanyDNA carries a `tone` string | ✅ SHIPPED (stored) | Company Brain DNA record |
| Tone injected into an (unwired) prompt | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/context-builder.ts:54` |
| Tone of **generated output** is analyzed | ❌ ROADMAP | **no such code exists** |
| Tone-fit score / signal | ❌ ROADMAP | no scoring code |
| Tone flags (`too_formal`, …) | ❌ ROADMAP | no flag code |
| Tone-driven Revision routing | ❌ ROADMAP | revision is human-only today |

### 3.2 The one place tone touches AI today — and why it is not a checker

The only code that puts tone anywhere near the model is the **unwired** Executive
Context Builder, which composes a `COMPANY DNA` system message:

```
messages.push(sys('COMPANY DNA',
  `Tone: ${dna.tone}. Values: … Writing style: … Risk appetite: …`));
```

— `domains/executive-memory/src/context-builder.ts:54`.

Two facts make this **not** a tone checker:

1. **It is unwired.** The context builder lives in the built-but-dormant stack
   (`domains/executive-memory/**`); no running app path instantiates it. The five live
   services call `ai.submit(...)` directly and none of them import a context builder.
   The generators take no such input (`domains/creative-studio/src/creative/service.ts:42-55`).
2. **It writes tone *in*, never reads tone *out*.** Even if it were wired, this line
   pushes the tone descriptor *into* the prompt as an instruction. It is a (would-be)
   generation input, the mirror image of Brand Injection — not an analysis of what the
   model returned. There is no counterpart that takes the six copy fields and asks "does
   this match `${dna.tone}`?"

### 3.3 What runs on the live creative path today

On the wired path, a CreativeSet is generated in one shot and passes to the human
reviewer with **no content judgment of any kind**:

- Generation returns the six fields (`domains/creative-studio/src/creative/service.ts:42-55`).
- The only automated check is **structural** — JSON extraction (`apps/web/src/ai-live.ts:179-198`)
  plus the service's manual shape re-check. It confirms the fields *exist*; it says
  nothing about how they *sound*.
- The **human** at the `creative_assets` gate is the sole judge of tone today
  (`apps/web/src/routes.ts:478-481`).

So a reviewer who wants to know whether copy is on-brand must read all six fields and
compare them against the brand voice **by hand**, every time. That manual pass is the
production-time cost this document's design removes.

---

## 4. To build

The Tone Checker is a clean ❌ → ✅ build: there is no existing tone-analysis code to
wire, so this is new construction, specified as a QA sub-check on the model of the parent
Creative QA stage. It reuses infrastructure that already ships.

### 4.1 Build ledger

| # | Work item | Tier today | Reuses (shipped) |
|---|---|---|---|
| T-1 | `TonePolicy` config (`pass`/`warn`/`flag` thresholds) | ❌ ROADMAP | config schema pattern (`packages/config`) |
| T-2 | Tone-judge capability + prompt (descriptor + field → assessment) | ❌ ROADMAP | prompt-registry (`domains/prompt-registry`, unwired) |
| T-3 | `ToneChecker` sub-check calling `ai.submit(...)` per field | ❌ ROADMAP | local-only stack (`ai-factory.ts:23-57`); JSON extraction (`ai-live.ts:179-198`) |
| T-4 | Reconcile `BrandProfile.voice` + CompanyDNA `tone` into one descriptor | ❌ ROADMAP | stored fields (`brand.ts:24`; DNA `tone`) |
| T-5 | Attach `toneFit`+`flags`+provenance to the QA record | ❌ ROADMAP | provenance block (already on every artifact) |
| T-6 | Wire tone-fit into Creative QA aggregation | ❌ ROADMAP | [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md) |
| T-7 | Route `flag` verdicts to targeted Revision (gap B-3) | ❌ ROADMAP | approval/revision workflow (`approval.ts`) |

### 4.2 Design constraints (binding)

- **Local-AI only.** The tone-judge task routes through the same local engines as all
  generation — Ollama / OpenAI-compatible, no cloud, no API key
  (`apps/web/src/ai-factory.ts:23-57`). No new inference path, no telemetry.
- **Offline-safe degrade.** With no live engine, the offline deterministic default
  (`apps/web/src/ai.ts:13`) returns a neutral `toneFit` and no flags — the checker must
  never fabricate a drift verdict it cannot substantiate.
- **Advisory, not authoritative.** Output is a signal + flags. The human `creative_assets`
  gate stays the decision authority; the checker only annotates and, at worst, routes to
  Revision.
- **Brand-relative, not absolute.** The checker judges only against *this brand's*
  descriptor. It never encodes a house tone; a `playful` brand and an `authoritative`
  brand are held to opposite standards, each correct for its own voice.
- **In-language.** Tone is judged in the output language (`apps/web/src/ai-live.ts:139-141`);
  a Turkish asset is judged for Turkish tone, never translated first.
- **Full separation from readability.** Tone-fit and clarity are distinct signals with
  distinct thresholds; a field can read perfectly and still be off-brand, and the two
  must never be collapsed into one number (see [`READABILITY.md`](READABILITY.md),
  [`SCORING.md`](SCORING.md)).

### 4.3 Worked example (illustrative, target behavior)

A brand with `voice: 'playful'` (`brand.ts:24`) generates a CreativeSet. The Tone
Checker judges each field against `playful` and returns:

| Field | `toneFit` | Flags |
|---|---|---|
| `headline` | `0.82` | — |
| `adCopy` | `0.44` | `too_formal`, `generic_voice` |
| `cta` | `0.79` | — |
| `socialPost` | `0.71` | `too_formal` |
| `landingPage` | `0.68` | — |
| `email` | `0.40` | `too_formal` |

Set result: `worstField = email`, one field in `flag` and two in `warn`. QA policy
attaches the flags to the artifact and routes `adCopy` and `email` to a **targeted**
Revision that re-injects the `playful` descriptor more forcibly, leaving the four
passing fields untouched (gap B-3). The human reviewer opens an asset already annotated
with exactly where and why tone drifted — instead of re-reading all six fields cold.

*This example is illustrative of the specified design; no such output is produced by AdOS
today.*

### 4.4 Out of scope

- Tone Checker does **not** enforce banned words — that is Brand Safety's job (a
  separate Part 4 sub-check); a banned word is a hard verdict, tone is a soft signal.
- It does **not** rewrite copy — it emits the signal that *routes to* Revision; the
  rewrite itself is the Revision engine's concern (gap B-3).
- It does **not** change the approval model — every gate remains a human click.

---

## 5. Value contribution

**Revenue ↑ — on-brand tone.** A brand's advertising only compounds when every asset
sounds like the same company. The Tone Checker turns the stored `voice` descriptor from
a dormant record into an enforced-at-QA standard, so first drafts leave AdOS already
sounding like the client instead of like a generic model. On-brand copy converts better
and protects the brand equity the agency is paid to build — a direct revenue lever.

**Production-time ↓ — fewer tone-driven revision loops.** Today a reviewer must read all
six fields and judge tone by hand on every CreativeSet, and off-brand copy is only caught
after a human notices, sends it back, and waits for a full regeneration. An automatic
tone-fit signal surfaces drift *before* the human opens the asset and routes only the
drifting field to a targeted rewrite — cutting the manual read, the back-and-forth, and
the wholesale regeneration that tone problems cause today.

---

## 6. Cross-references

- Source of truth: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) · Roadmap:
  [`../../ROADMAP.md`](../../ROADMAP.md) · Known limits:
  [`../../KNOWN_LIMITATIONS.md`](../../KNOWN_LIMITATIONS.md)
- Governing reference: [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)
- Brand voice into the prompt (Part 1): [`../1-ai-foundations/BRAND_INJECTION.md`](../1-ai-foundations/BRAND_INJECTION.md)
- Parent QA stage (Part 2): [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md)
- Sibling sub-checks (Part 4): [`READABILITY.md`](READABILITY.md) · [`SCORING.md`](SCORING.md)
- Brand voice field (Book A): [`../../book-a/BRAND_DOMAIN.md`](../../book-a/BRAND_DOMAIN.md)
- Human review gate (Book A): [`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md)

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
