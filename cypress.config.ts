import { defineConfig } from 'cypress';

/**
 * @file cypress.config.ts
 * @description Configuração central do Cypress otimizada para a versão 16.5.0 (2026).
 * Inclui padrões modernos de isolamento de testes, estabilidade e performance.
 */

export default defineConfig({
  video: false, 
  screenshotsFolder: 'artifacts/cypress/screenshots',
  videosFolder: 'artifacts/cypress/videos',
  
  // ⚡ Configurações de Resiliência (Padrão 2026)
  retries: {
    runMode: 2, 
    openMode: 0
  },
  
  // 🕒 Timeouts otimizados para Single Page Applications (SPAs)
  defaultCommandTimeout: 10000, 
  requestTimeout: 15000,
  pageLoadTimeout: 30000,
  
  // 📊 Relatórios Corporativos
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'artifacts/cypress/results/junit-[hash].xml',
    toConsole: true
  },

  // 🌐 Configurações de Exposição (Padrão 2026 - Público)
  expose: {
    grepFilterSpecs: true,
    grepOmitFiltered: true,
    // Padrão 2026: Habilita isolamento de rede por padrão se necessário
    networkIsolation: true 
  },

  // 🔒 Configurações de Ambiente (Sensível)
  env: {
    // Adicione chaves de API e segredos aqui, acessíveis via cy.env()
  },

  // 🔒 Segurança e Migração (Cypress 16+)
  allowCypressEnv: false, 

  e2e: {
    baseUrl: process.env.BASE_URL || 'https://bugbank.netlify.app',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // 🧪 Test Isolation (Padrão Cypress 12+ mantido em 2026 para limpeza total)
    testIsolation: true,

    /**
     * @function setupNodeEvents
     * @description Configuração de plugins e tarefas do Node.js v26.
     */
    setupNodeEvents(on, config) {
      // Suporte a tags de teste (grep)
      require('@cypress/grep/src/plugin')(config);

      // Definição de tarefas customizadas para o sistema operacional
      on('task', {
        log(mensagem: string) {
          console.log(`[CYPRESS_TASK] ${mensagem}`);
          return null;
        },
        tabela(dados: any) {
          console.table(dados);
          return null;
        }
      });

      return config;
    }
  }
});
