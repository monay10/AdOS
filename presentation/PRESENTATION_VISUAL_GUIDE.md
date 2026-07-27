# AdOS — Executive Presentation Visual Guide

**Companion to:** `PRESENTATION_CONSTITUTION.md`, `PRESENTATION_STORYBOARD.md`,
`PRESENTATION_CONTENT.md`. This guide describes **every illustration** the deck
needs, in enough detail to design without ambiguity. **No implementation** — this
is a specification. All visuals use the brand system (dark-first, one accent per
frame, single-weight line diagrams, the perimeter motif).

**Shared visual DNA (applies to every illustration):**
- **Palette:** ink `#0E1116` base; accent AdOS blue `#5B8CFF`; violet `#9D7BFF`
  (gradient/highlight only); green `#3FB950` (trust/approval); text `#E6EDF3`,
  muted `#8B98A9`; boundary lines `#2A3140`.
- **Line weight:** 1.5px strokes, rounded joins; nodes are rounded rectangles
  (radius 10–12px).
- **Type in visuals:** business labels only (e.g. "Your data," "Local model"),
  never internal component names.
- **The perimeter** (a rounded-rectangle boundary meaning "your network / your
  building") is the recurring signature element.
- **Every illustration has a one-line caption** stating the business takeaway.
- **16:9**, safe margins, high contrast for projection; each has a **flat static
  fallback** for PDF.

---

## 1. Hero illustrations

### H1 — Title mark (Slide 1)
- **Content:** AdOS gradient rounded-square mark (▲ glyph) + "AdOS" wordmark,
  centered on ink. A thin perimeter line draws once beneath the wordmark.
- **Mood:** premium, quiet, infrastructural.
- **Motion:** mark fades in (300ms); perimeter line draws left-to-right (500ms),
  then rests.
- **Caption:** "The Enterprise AI Operating System."

### H2 — The reversal (Slides 3 & 5, paired)
- **Content:** a building silhouette on the left, a distant cloud on the right.
  Slide 3: a data packet travels **out** of the building to the cloud (the
  problem). Slide 5: the same scene, but the flow **reverses** — a model node
  travels **in**, and the outbound arrow is struck through.
- **Mood:** slide 3 uneasy (red-tinted arrow, used once), slide 5 reassuring
  (blue inbound, green perimeter).
- **Motion:** the arrow literally reverses direction between the two slides — the
  pivot moment.
- **Caption (3):** "Cloud AI sends your data out." **(5):** "AdOS brings the AI
  in."

### H3 — The one big idea (Slide 9) — canonical perimeter
- **Content:** a bold perimeter labeled "Your network." Inside, three nodes
  left-to-right: **Your request → AI Manager (local) → Local model**, connected by
  arrows. Below, a dashed violet line labeled "Nothing crosses." A large figure
  overlay: **"0 data leaves your network."**
- **Mood:** definitive, calm, memorable.
- **Motion:** nodes and arrows build one per click; the boundary line "locks" with
  a subtle emphasis pulse (the deck's single signature animation).
- **Caption:** "Your data never leaves your building."

---

## 2. Architecture diagrams

### A1 — Simple architecture (Slide 7, main deck)
- **Content:** the perimeter with the three-node chain (request → AI Manager →
  local model). Deliberately minimal — the same canonical shape as H3 but without
  the big number.
- **Labels:** "Your request," "AI Manager (on your servers)," "Local model (your
  hardware)."
- **Motion:** progressive build.
- **Caption:** "One boundary. Everything inside."

### A2 — Enterprise architecture (Annex A1, technical)
- **Content:** a layered diagram inside the perimeter:
  - **Access layer:** web app + sign-in (users).
  - **Coordination layer:** the AI Manager + workflow engine.
  - **Knowledge layer:** the Company Brain (documents + graph).
  - **Data layer:** database + file storage.
  - **AI layer:** local inference engine(s).
  - **Operations:** backup, monitoring, workers — shown as a side rail.
- **Emphasis:** the entire stack sits inside one perimeter; a single external
  arrow (users' browsers) is the only thing touching the boundary, and it is
  inside the corporate network.
- **Motion:** layers stack bottom-up.
- **Caption:** "A complete platform — all on your infrastructure."

---

## 3. Workflow diagrams

### W1 — The five-stage pipeline (Slide 8 & product)
- **Content:** five rounded nodes left-to-right — **Brief → Creative → Campaign →
  Results → Executive** — with a **green approval gate (check-in-circle)** between
  each pair.
- **Detail:** each node has a small line icon (document, spark, megaphone, chart,
  star). Gates are visually dominant to stress human control.
- **Motion:** nodes build left-to-right; each gate check appears on click.
- **Caption:** "Five steps. You approve each one."

### W2 — Generic approval workflow (Annex / Workflow slide)
- **Content:** a swimlane-lite flow: **Request → AI-assisted review → Human
  approval → Action → Record**, with an "escalate to human" branch shown as a
  dashed path.
- **Emphasis:** the human approval node and the audit "Record" node are
  highlighted.
- **Motion:** left-to-right build; the escalation branch reveals last.
- **Caption:** "AI assists; a human decides; everything is recorded."

---

## 4. Knowledge graph

### K1 — Company Brain graph (Slide 10)
- **Content:** inside the perimeter, a network of nodes representing **documents,
  decisions, people, and outcomes**, connected by edges. It starts sparse and
  grows denser as the speaker talks. A central larger node labeled "Company
  Brain."
- **Node types (by shape/tint):** documents (rectangles), decisions (diamonds),
  outcomes (circles), people (small avatars) — one accent, varied shape not color
  overload.
- **Emphasis:** the whole graph is inside the perimeter and never crosses it.
- **Motion:** nodes appear and link progressively; a subtle "pulse" travels the
  graph to suggest a living memory.
- **Caption:** "Your knowledge, connected — and kept inside."

### K2 — Compounding value curve (Slide 10/11 inset)
- **Content:** a simple upward curve, x = time, y = "value of your knowledge,"
  clearly labeled **"illustrative."** No fake axis numbers.
- **Motion:** the curve draws once.
- **Caption:** "The longer you use it, the more valuable it becomes."

---

## 5. AI-assisted pipeline diagrams

### D1 — Department assistants (Slide 11)
- **Content:** a central "Company Brain" node with a ring of labeled assistant
  nodes around it — **HR, Finance, Quality, Maintenance, Operations, Legal,
  Executive** — each a rounded node with a line icon. Thin lines connect each
  assistant to the Brain (their shared knowledge source).
- **Detail:** each assistant shows a tiny "limits" tag and an "escalate to human"
  marker to reinforce governance.
- **Motion:** assistants appear around the Brain one per click.
- **Caption:** "Specialized assistants, one shared memory, clear limits."

### D2 — Single assistant anatomy (Annex)
- **Content:** one assistant node exploded into four labeled parts: **Knows**
  (its knowledge sources), **Does** (its capabilities), **Limits** (what it won't
  do), **Escalates** (to which human role).
- **Motion:** parts reveal one per click.
- **Caption:** "Every assistant has defined knowledge, limits, and a human
  fallback."

---

## 6. Local AI infrastructure

### L1 — Local engines (Slide 6 / Local AI)
- **Content:** inside the perimeter, the AI Manager connected to a rack of local
  **engine** tiles labeled **Ollama, vLLM, LM Studio, llama.cpp, SGLang**. A
  crossed-out cloud icon sits outside the perimeter with a small "no API key,
  no cloud" tag.
- **Emphasis:** all engines are inside; the cloud is explicitly excluded.
- **Motion:** engine tiles populate; the external cloud gets struck through.
- **Caption:** "Runs on the local engines you already use. No cloud."

### L2 — Hardware honesty inset (Local AI)
- **Content:** a small, honest note-graphic: a server + a dial labeled "speed
  depends on your hardware," positioned as a choice the customer controls.
- **Motion:** none (static).
- **Caption:** "Performance scales with your hardware — your choice, your control."

---

## 7. Deployment topology

### T1 — Deployment options (Slide 14 / Deployment)
- **Content:** three side-by-side environment cards — **Your data center**,
  **Private cloud**, **On-site servers** — each containing the same perimeter +
  stack glyph, showing AdOS runs identically in all three.
- **Emphasis:** identical perimeter in each option = portability, no lock-in.
- **Motion:** cards reveal; a "no lock-in / portable data" tag appears last.
- **Caption:** "It runs where you already run software."

### T2 — Production topology (Annex A3, technical)
- **Content:** inside the perimeter: an HTTPS gateway → web replicas (stateless)
  → database + object storage + local model; a separate workers replica draining
  a job queue; a backup/ops process to encrypted backup storage. All inside one
  boundary; the only external touchpoint is internal users' browsers.
- **Motion:** components stack; the backup path highlights last.
- **Caption:** "Scales horizontally; everything inside your walls."

---

## 8. Enterprise architecture (audience/tenancy)

### E1 — Multi-tenant isolation (Slide 15, OIZ emphasis)
- **Content:** one platform perimeter containing several **isolated tenant
  compartments** (e.g. "Member Company A/B/C" for an OIZ, or
  "Department A/B/C"), each visually sealed with its own inner boundary. A bold
  label: "One platform. Fully isolated."
- **Emphasis:** no line ever connects two tenant compartments.
- **Motion:** compartments appear; a brief attempt-to-cross animation is blocked
  at the wall (reinforcing isolation).
- **Caption:** "Serve many organizations — none can see another's data."

### E2 — Audience fit grid (Slide 15)
- **Content:** four cards with icons — **Enterprise, Public institution,
  Organized Industrial Zone, Agency** — each with a one-line fit statement.
- **Motion:** cards reveal; the OIZ card expands to E1.
- **Caption:** "Built for organizations that can't compromise on data."

---

## 9. Timeline

### TL1 — Roadmap / partnership (Slide 19)
- **Content:** a horizontal timeline with 4 milestones — **Now → Pilot (on your
  infrastructure) → Rollout → Compounding advantage** — each a node with a small
  icon (flag, gear, expand, growth). A subtle upward slope suggests growing value.
- **Motion:** milestones reveal left-to-right; the slope draws underneath.
- **Caption:** "A staged, low-risk path."

---

## 10. Icons

A single, coherent line-icon set (1.5px stroke, 24px grid, currentColor). Each is
paired with words; the deck is legible with icons removed.

| Icon | Meaning | Used on |
| --- | --- | --- |
| Perimeter (rounded boundary) | Sovereignty / your network | 1, 5, 7, 9, 20 |
| Node / chip | Local model | 6, 7, 9 |
| Shield | Security | 8, 13 |
| Lock | Encryption / protection | 4, 8, 13 |
| Walls | Separation / isolation | 8, 15 |
| Ledger / list | Audit / accountability | 8, 13 |
| Check-in-circle (green) | Human approval | 8, 9, 20 |
| Building | On-prem / your premises | 3, 5, 14 |
| Cloud (struck-through) | The excluded cloud | 3, 6, 16 |
| Coin | Cost / predictable pricing | 4, 10, 13 |
| Chain / chain-break | Dependency / independence | 4, 10 |
| Brain-graph | Company Brain / knowledge | 10, 11 |
| Assistant | AI-assisted stage | 11 |
| Target | Objective | 7, 12 |
| Chart / bars | Results / analytics | 8, 12, 13 |
| Flag / gear / growth | Roadmap milestones | 19 |
| TR/EN | Bilingual | 17 |

**Rules:** max 3–4 icons per slide; consistent metaphors; professional, never
playful; no icon carries meaning alone.

---

## 11. Comparison graphics

### C1 — Cloud AI vs. AdOS (Slide 16)
- **Content:** two columns. **Left "Cloud AI tools":** data leaves, per-use fees,
  vendor dependency, compliance exposure. **Right "AdOS":** data stays, fixed
  cost, you own it, compliant by design. Max 4 rows.
- **Emphasis:** the AdOS column highlights (accent border) on the final click; the
  "data leaves / data stays" row is visually strongest.
- **Motion:** rows reveal one per click; AdOS column highlights last.
- **Caption:** "The difference is where your data goes."

### C2 — Four risks grid (Slide 4)
- **Content:** a 2×2 of the four business risks (control, cost, compliance,
  dependency), one icon + one word each.
- **Motion:** quadrants reveal one per click.
- **Caption:** "Four risks you can't accept."

### C3 — Cost posture contrast (Slide 13/18, optional)
- **Content:** a simple two-bar or two-line contrast: cloud AI cost **rises with
  usage**; on-prem cost is **flat**. Clearly labeled "illustrative."
- **Motion:** bars/lines draw once.
- **Caption:** "Predictable cost, no per-use fees."

---

## 12. Animations (catalogue)

All motion obeys the constitution (§7): progressive disclosure, ≤300ms, fades and
short rises only, projector-safe, static fallback, one signature moment.

| Animation | Where | Behavior |
| --- | --- | --- |
| Logo + perimeter draw | 1 | Mark fades; perimeter line draws once |
| Trend-line rise | 2 | Illustrative line rises on click |
| Data leaves building | 3 | Packet animates out to the cloud (unease) |
| Quadrant reveal | 4 | 2×2 risks appear one per click |
| Arrow reversal | 5 | Outbound arrow reverses to inbound (the pivot) |
| Engine populate | 6 | Local engine tiles fill; cloud struck through |
| Objective → outputs | 7 | Objective morphs into campaign artifacts |
| Pipeline build + gates | 8 | Stages build L→R; approval checks appear |
| **Perimeter lock** | 9 | Nodes build; boundary "locks" with a pulse (signature) |
| Reason rows | 10 | Four local-AI reasons reveal one per click |
| Knowledge graph grow | 10/11 | Nodes appear and link; a pulse travels |
| Assistants ring | 11 | Department assistants appear around the Brain |
| Trust cards | 13 | Three security cards reveal one per click |
| (Demo) | 14 | No slide animation — the live product |
| Isolation blocked | 15 | A cross-tenant attempt is blocked at the wall |
| Comparison highlight | 16 | Rows reveal; AdOS column highlights last |
| Proof points | 17 | Facts reveal one per click |
| Timeline milestones | 19 | Milestones reveal L→R; slope draws |
| Closing perimeter | 20 | Perimeter redraws; the ask appears; stillness |

**Reduced-motion / PDF:** every animated slide has a final static state that fully
communicates the idea; the deck must read correctly with all motion removed.

---

## Production guardrails
- Reuse the **same perimeter shape** everywhere it appears (1, 5, 7, 9, 14, 15,
  20) — consistency is the point.
- **No stock photography, no 3D robots/brains, no clip-art AI.**
- **No external copyrighted assets** — all diagrams and icons are original,
  built from the brand's geometric system.
- Every visual has a **business-language caption** and a **static fallback**.
- Labels are bilingual-ready (TR/EN); verify Turkish glyphs in every label.
