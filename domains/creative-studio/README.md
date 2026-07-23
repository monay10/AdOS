# Creative Studio

> **Layer:** Domain · **Build:** BOOK 9 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Local generative production: images/video/banners/carousels/logos/brand kits (ComfyUI + FLUX/SD), voice/avatar (Piper/XTTS), and copy (headlines/CTA/blog/email/landing/scripts). Every asset is versioned and A/B-testable; a Creative Review agent scores output via the Evaluation Engine.

## Sub-modules
- Image Generation
- Video Generation
- Banner / Carousel Generator
- Logo / Brand Kit Generator
- Voice Generator
- Avatar Generator
- Copywriting
- Landing Page Generator
- Blog Generator
- Email Generator
- Script Generator
- Headline / CTA Generator
- Prompt Optimizer
- Creative Review Agent
- Asset Versioning
- A/B Variant Management

## Published events
- `creative.generated.v1`
- `creative.reviewed.v1`
- `creative.variant.created.v1`
- `creative.published.v1`

## Consumed events
- `intel.brief.generated.v1`
- `campaign.creative.requested.v1`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
