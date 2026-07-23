# Knowledge Engine

> **Layer:** Cognitive support · **Build:** BOOK 5 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Reusable memory + retrieval for every agent (via the AI Manager Memory/Context Managers). Vector DB (LanceDB/FAISS), knowledge graph, document ingestion (PDF/OCR/website), embedding pipeline, semantic search and context ranking, and typed brand/campaign/customer/competitor knowledge.

## Sub-modules
- Vector Database (LanceDB/FAISS)
- Knowledge Graph
- Document Parser
- OCR (Tesseract/PaddleOCR)
- Website Parser
- PDF Reader
- Embedding Pipeline (BGE-M3/Nomic)
- Semantic Search
- Context Ranking
- Memory Compression
- Long/Short Term Memory
- Document Versioning
- Brand / Campaign / Customer / Competitor Knowledge
- Context Builder

## Published events
- `knowledge.ingested.v1`
- `knowledge.indexed.v1`
- `knowledge.updated.v1`

## Consumed events
- `connector.*`
- `campaign.*`
- `creative.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
