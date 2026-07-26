# AdOS — AI Guide

How AI works in AdOS, and how to run it 100% locally.

## The Constitution

One rule governs all AI: **no agent talks to an inference engine directly.**
Every AI task goes through the **AI Manager** (`AIManagerPort`), the only code
that reaches a model. This means models are fully replaceable without touching
any business logic.

```
domain service ──AITaskRequest──► AIManagerPort ──► inference engine (local)
   (capability + promptRef + variables + responseSchema)
```

## Two managers, one contract

| Manager | Engine | When |
| --- | --- | --- |
| `OfflineAIManager` | none — deterministic, schema-valid stub | **default**; tests, demos, no model server |
| `LiveAIManager` | a local inference engine | `AI_ENGINE` set |

Both implement the same `AIManagerPort`, so switching changes nothing downstream.

## Running a real model (all local, no cloud, no API key)

```bash
ollama pull qwen2.5:7b
AI_ENGINE=ollama AI_MODEL=qwen2.5:7b node apps/web/dist/main.js
```

Supported local engines (`AI_ENGINE`): `ollama` (default URL
`http://localhost:11434`), and OpenAI-compatible local servers `vllm`,
`lmstudio`, `llamacpp`, `sglang` (`AI_BASE_URL`, default
`http://localhost:8000`). None require an API key — they run on your machine.

Tuning: `AI_MODEL` (default `qwen2.5:7b`), `AI_TEMPERATURE` (default `0.2`).

## How LiveAIManager works

For each request it:
1. Builds a chat prompt from the service's role + `variables` + `responseSchema`,
   and instructs the model to answer in the visitor's language and return **only
   JSON**.
2. Calls the local engine.
3. Extracts the JSON object from the reply (strips fences/prose).
4. **Self-repairs once** if the first reply isn't valid JSON.
5. Returns a validated `AITaskResult` with real model/engine/tokens/latency.

If the model still returns no JSON, the calling service surfaces its normal
`UnavailableError` — behavior is unchanged from the offline manager's contract.

## Language

AI output follows the request locale (from the browser/OS `Accept-Language`):
Turkish or English. The system prompt carries the instruction; JSON keys stay in
English, text values are localized.

## Performance & limits

- A 7B model on CPU: ~40–50 s for a full brief→creative→campaign chain. Use a
  GPU or smaller model to speed up; the offline manager is sub-millisecond.
- Small models can mix languages in long prose; structured fields and ad copy are
  reliable. See `KNOWN_LIMITATIONS.md`.

## Capabilities

The `capability` on a request (`reasoning`, `chat`, `code`, `embedding`,
`vision`, `image_generation`, `transcription`, `speech`, `classification`,
`extraction`) drives model routing. AdOS's pipeline uses `reasoning` for
brief/creative/campaign/analytics/executive.
