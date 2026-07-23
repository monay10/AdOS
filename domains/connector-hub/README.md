# Connector Hub

> **Layer:** Integration (anti-corruption) · **Build:** BOOK 7 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Every external platform behind a port + adapter with retries, throttling, rate-limit handling and monitoring. No connector touches business logic; they translate external payloads into domain events. Cloud LLM connectors (OpenAI/Anthropic/Gemini/OpenRouter) are OPTIONAL adapters behind the AI Manager and disabled by default (offline-first).

## Sub-modules
- Google Ads
- Meta / Facebook / Instagram
- LinkedIn
- TikTok
- Google Analytics
- Search Console
- Google Tag Manager
- Shopify
- WooCommerce
- HubSpot
- Salesforce
- Mailchimp
- Brevo
- WhatsApp
- Slack
- Discord
- Stripe
- OpenAI / Anthropic / Gemini (optional, off by default)
- MCP
- Rate Limiter
- Retry + Circuit Breaker

## Published events
- `connector.synced.v1`
- `connector.metric.ingested.v1`
- `connector.error.v1`
- `connector.ratelimited.v1`

## Consumed events
- `campaign.publish.requested.v1`
- `creative.published.v1`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
