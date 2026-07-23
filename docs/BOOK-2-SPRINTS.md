# Book 2 — AI Manager (Enterprise) · Sprint Plan

Book 2 is delivered as 18 small sprints. Each sprint is **code → test → refactor
→ commit**, and the tree stays green at every commit. No sprint introduces a
cloud dependency, a hardcoded model name, or a hardcoded prompt.

Legend: ⬜ todo · 🟡 in progress · ✅ done

| Sprint | Name | Scope | Status |
|---|---|---|---|
| 2.1 | AI Runtime Kernel | AITask · AIJob · AISession · AIResponse · AIStream · AITokenUsage · AIError · AIEvent · AIRequest · AIExecution — **no inference** | ✅ |
| 2.2 | Model Registry | installed models · capabilities · quantization · memory/VRAM/CPU · priority · benchmark · health · availability | ⬜ |
| 2.3 | Resource Scheduler | CPU/GPU/VRAM · queue · concurrency · warmup · unload · resource lock | ⬜ |
| 2.4 | Prompt Runtime | prompt registry · variables · template engine · versioning · A/B · rendering | ⬜ |
| 2.5 | Context Runtime | Company Brain · Executive Memory · Decision Journal · Experience · Patterns · Prompt · Mission · Conversation → ContextBuilder | ⬜ |
| 2.6 | Inference Runtime | pipeline · streaming · batch · cancellation · retry · timeout · circuit breaker | ⬜ |
| 2.7 | Model Adapters | Ollama · vLLM · llama.cpp · LM Studio · SGLang (adapters only) | ⬜ |
| 2.8 | Validation Runtime | JSON schema · guard rails · parser · repair · retry · validator | ⬜ |
| 2.9 | Safety Runtime | PII · secrets · brand · policy · risk · injection | ⬜ |
| 2.10 | Tool Runtime | filesystem · browser · crawler · SQLite · OCR · markdown · git · CSV · Excel | ⬜ |
| 2.11 | Capability Runtime | execution · chain · planner · cache | ⬜ |
| 2.12 | Memory Runtime | session · working memory · cache · snapshots · persistence | ⬜ |
| 2.13 | Monitoring | metrics · tracing · logging · latency · GPU/VRAM · tokens · errors · retries | ⬜ |
| 2.14 | Learning Runtime | feedback · reward · ranking · prompt scores · pattern scores | ⬜ |
| 2.15 | Event Runtime | published · consumed · replay · dead-letter · retry | ⬜ |
| 2.16 | Workflow Runtime | queue · task graph · dependencies · execution · cancellation | ⬜ |
| 2.17 | AI Pipeline | Mission → Planning → Capability → Context → Prompt → Model → Validation → Constitution → Decision → Journal → EventBus → CompanyBrain.enrich() | ⬜ |
| 2.18 | Walking Skeleton | one real scenario end-to-end on a local model | ⬜ |

## Acceptance criteria (Book 2 complete when all pass)

**Functional:** offline · local LLM · multi-model · streaming · retry · validation ·
constitution · evidence · confidence · decision journal · company brain ·
executive memory · event bus · enrichment.

**Non-functional:**
- 100% offline · zero cloud dependency
- zero hardcoded model names · zero hardcoded prompts
- zero duplicated business logic · zero direct model calls
- every execution observable · every decision auditable
- every response reproducible · every AI output explainable (Constitution Rule #8)

## Walking skeleton (Sprint 2.18 target)
```
New client → Mission → CEO → Planning → Research → Company Brain →
Context Builder → AI Manager → Ollama → Validation → Constitution →
Decision Journal → Event → CompanyBrain.enrich() → Response
```
When this runs on a local model with a full execution trace, **Book 2 is done.**
