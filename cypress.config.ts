import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  screenshotsFolder: 'artifacts/cypress/screenshots',
  videosFolder: 'artifacts/cypress/videos',
  retries: {
    runMode: 1,
    openMode: 0
  },
  defaultCommandTimeout: 8000,
  requestTimeout: 10000,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'artifacts/cypress/results/junit-[hash].xml',
    toConsole: true
  },
  env: {
    grepFilterSpecs: true,
    grepOmitFiltered: true,
    failOnCoverageGap: true,
    criticalFlowCoverageThreshold: 1
  },
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      require('cypress-grep/src/plugin')(config);
      on('task', {
        log(message: string) {
          // observability-friendly structured log hook
          console.log(`[CYPRESS_TASK] ${message}`);
          return null;
        }
      });
      return config;
    }
  }
});
