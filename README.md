# Enterprise Cypress Automation Platform

Production-grade test automation platform designed with Big Tech engineering standards:

- **Cypress v15.12.0** with TypeScript and modular architecture
- **Application Actions Pattern** (business-level user workflows)
- **Fixture Data Pattern** + dynamic factory support
- **Dockerized reproducibility** for local and CI execution
- **CI/CD quality gates** (functional + performance + critical coverage)
- **k6 + Grafana observability stack**
- **Cypress Cloud Starter Plan optimization**

## Architecture

```
/cypress
  /actions      -> business flows (App Actions)
  /e2e          -> smoke/regression/negative/api-ui specs
  /fixtures     -> centralized static test data
  /support      -> custom commands and hooks
  /utils        -> factories/utilities
/config         -> environment strategy
/ci             -> quality gate scripts and policy
/docker         -> Dockerfiles
/k6             -> load/stress/spike scripts
/grafana        -> datasource + dashboard provisioning
/app            -> deterministic local AUT for pipeline confidence
```

## Quality Strategy

### Test Pyramid / Shift-left
- Unit: lightweight API health tests (`node --test`).
- E2E: critical user journeys + negative and boundary validations.
- API+UI combined specs to validate end-to-end consistency.

### Coverage Model
- **Smoke**: login and basic health.
- **Critical**: auth + checkout core flows.
- **Regression**: boundary, unauthorized, invalid input, API+UI consistency.
- Includes edge-path considerations (auth failures, thresholds, no-data states).

## Run Locally

```bash
npm ci
node app/index.js
npm run cy:run
npm run k6:load
npm run quality:gates
```

## Tagging & Smart Selection

- `@smoke` fast PR checks.
- `@critical` release blocker flows.
- `@regression` nightly/full checks.
- CI runs smoke for PRs and Cloud-recorded parallel runs for main branch.

## Cypress Cloud Starter Plan Controls

- Record key injected via `CYPRESS_RECORD_KEY` secret.
- PR pipeline defaults to smoke-only to reduce monthly run count.
- Full recorded execution on main/nightly only.
- Retry capped to `runMode: 1` to avoid blind masking of flaky tests.

## Observability

- Cypress screenshots/videos on failure in `artifacts/`.
- JUnit XML for machine-readable reporting.
- k6 summaries exported as JSON for quality gate parsing.
- Grafana dashboard tracks p95 latency, error rate, throughput.

## Docker Execution

```bash
docker compose up --build --abort-on-container-exit cypress
```

This brings up:
- App under test (`app`)
- Cypress runner (`cypress`)
- k6 executor (`k6`)
- Grafana + InfluxDB telemetry stack

## Enterprise Gates (pipeline fails if any condition fails)

1. Any Cypress test failure.
2. k6 p95/failed-request thresholds breached.
3. Missing critical-tagged flow coverage.
4. Missing expected artifacts.

## Security & Maintainability Notes

- Secrets managed only in CI secret store.
- Selector isolation via App Actions to prevent test brittleness.
- Data separated from logic via fixtures and factories.
- Deterministic local AUT enables repeatable test outcomes.
