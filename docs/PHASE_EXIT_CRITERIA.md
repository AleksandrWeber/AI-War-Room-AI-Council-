# Phase Exit Criteria Template

Use this checklist before starting and closing any large phase.

## 1) Scope Cap (hard stop)

- Define exact final milestone or batch (example: `v5.560`).
- Define what is explicitly out of scope for this phase.

## 2) Quality Cap

- Required command(s): `npm run build` for touched workspaces.
- Required test set: only tests that validate changed behavior.
- Flaky policy: require at least one clean full run after retries.

## 3) Performance Cap

- Define max test duration budget (example: `API_TEST_MAX_MS=90000`).
- Define acceptable flaky budget (example: `<= 1` flaky incident per full run).
- Define frontend bundle budget target and chunking plan.

## 4) Reliability Cap

- Ensure generators/patch scripts fail fast on missing anchors.
- Ensure rollout scripts validate input milestones before generation.

## 5) Release Cap

- Define push cadence (example: `1 push per 20 milestones`).
- Define stop-and-review point before extending scope.

## 6) Exit Decision

A phase is complete only when:

1. Scope cap is reached.
2. Quality and performance caps are met.
3. Release cap actions are completed.
4. A short post-stop audit is documented.
