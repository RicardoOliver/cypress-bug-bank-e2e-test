# Migration Guide: Moving away from `Cypress.env()`

Starting with Cypress **15.10.0**, `Cypress.env()` is deprecated and will be removed in a future major version.

Use:
- `cy.env()` for **sensitive values** (secrets, tokens, credentials)
- `Cypress.expose()` for **public/non-sensitive values** (feature flags, public URLs, plugin config)

## Why this changed

`Cypress.env()` hydrates all configured env values into browser context, which can unintentionally expose data.

Key risks:
- **All-or-nothing exposure** of configured env vars
- **Cross-origin propagation** via `cy.origin()`
- **Browser-context visibility** to app/third-party scripts when available

## Decision matrix

### Use `cy.env()` when
- value is sensitive
- async Cypress command usage is acceptable
- you want conservative, request-only exposure

### Use `Cypress.expose()` when
- value is public/non-sensitive
- synchronous access is required
- browser visibility is acceptable

## Example migrations

### Sensitive values (`Cypress.env()` → `cy.env()`)

```ts
// before
const apiKey = Cypress.env('apiKey')

// after
cy.env(['apiKey']).then(({ apiKey }) => {
  // use apiKey
})
```

### Public config (`Cypress.env()` → `Cypress.expose()`)

```ts
// before
const pluginConfig = Cypress.env('PLUGIN_CONFIG')

// after
const pluginConfig = Cypress.expose('PLUGIN_CONFIG')
```

### CLI flags

```bash
# before
cypress run --env FEATURE_FLAG=true,API_VERSION=v2

# after
cypress run --expose FEATURE_FLAG=true,API_VERSION=v2
```

## Runtime writes

`cy.env()` is read-only.

If you previously wrote values with `Cypress.env()`, use `cy.task()` + Node-side process state in `setupNodeEvents` to store/retrieve runtime values.

## Plugin compatibility

When enabling strict mode (`allowCypressEnv: false`), update plugins that still call `Cypress.env()`.

Known migrations:
- `@cypress/code-coverage` → `4.0.0+`
- `@cypress/grep` → `6.0.0+`

## Lockdown step

After migration, set:

```ts
allowCypressEnv: false
```

This enforces migration by throwing on `Cypress.env()` usage.

## Repo checklist

- [x] Search codebase for `Cypress.env()`
- [x] Use `--expose` for tag-based CLI filtering
- [x] Configure `expose` for public values
- [x] Set `allowCypressEnv: false`
