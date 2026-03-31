# Cypress Cloud Starter Plan Optimization

- Trigger `npm run cy:cloud` only on protected branches and nightly schedules.
- For pull requests, run `cy:run:smoke` by default to minimize run consumption.
- Use tags (`@smoke`, `@critical`, `@regression`) and run-selection policy to stay under 500 runs/month.
- Keep `retries.runMode=1`; avoid blind retries >1 because they hide flaky tests.
