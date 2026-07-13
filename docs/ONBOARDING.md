# Day-1 onboarding

Get from clone to a completed mock run in about 15 minutes. Details: [CONTRIBUTING.md](./CONTRIBUTING.md).

## Checklist

### 1. Bootstrap (≈5 min)

```bash
npm install
cp .env.example .env
npm run doctor
```

Fix anything `doctor` marks failed. Common fixes:

- Install/start Docker, then `npm run infra:up`
- Copy `.env.example` → `.env` if missing
- Use Node 22+

### 2. Start the app (≈2 min)

```bash
npm run infra:up
npm run db:migrate
npm run dev:api    # terminal 1
npm run dev:web    # terminal 2
```

Open `http://127.0.0.1:5173`. Hero should show **API status: online**.

If offline: confirm API is listening on `:3000` and `WEB_ORIGIN` matches the Vite origin.

### 3. First mock run (≈5 min)

Defaults use `LLM_*=mock` — no provider keys required.

1. Scroll to **Draft first idea** (`#idea`).
2. Paste a short product idea (2–4 sentences).
3. Submit → wait for Human Review (Shield + triage).
4. Keep or adjust selected agents → **Execute**.
5. Watch stream status → open Executive Summary, PRD, Development Prompt.

### 4. Sanity checks (optional)

```bash
npm run quality:gate          # before a PR
npm run test:e2e:install      # once
npm run test:e2e              # Playwright happy path
```

What you do *not* need on day 1

- Real Anthropic/OpenAI keys (mock gateway is enough)
- `LLM_ALLOW_REAL_PROVIDERS=true` (leave false; required only for intentional live LLM calls)
- Temporal (`TEMPORAL_ENABLED=false` by default)
- Stripe (`STRIPE_ENABLED=false`)
- Rollout/admin panels (load only when debugging ops)

## Mental model

```text
Idea → Shield → Triage → Human Review → Agents → Moderator → Artifacts
```

This is a **planning engine**, not a chat thread. Human Review is the gate before expensive work.

## Next docs

| Goal | Doc |
| --- | --- |
| Flags, scripts, conventions | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Deploy / migrations / incidents | [OPERATOR.md](./OPERATOR.md) |
| Artifact schemas & billing | [ARTIFACTS_AND_BILLING.md](./ARTIFACTS_AND_BILLING.md) |
