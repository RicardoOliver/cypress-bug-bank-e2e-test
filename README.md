# Plataforma de Automação Cypress Corporativa

Plataforma de automação de testes de nível de produção, projetada com padrões de engenharia de Big Techs:

- **Cypress v16.5.0** com TypeScript e arquitetura modular.
- **Node.js v26.x** (versão de produção de 2026).
- **Padrão Application Actions** (fluxos de trabalho do usuário em nível de negócio).
- **Padrão Fixture Data** + suporte a fábricas (factories) dinâmicas.
- **Reprodutibilidade via Docker** para execução local e em CI.
- **Quality Gates de CI/CD** (funcional + performance + cobertura crítica).
- **Stack de observabilidade com k6 + Grafana**.
- **Otimização para o Plano Starter do Cypress Cloud**.

## Arquitetura

```
/cypress
  /actions      -> fluxos de negócio (App Actions)
  /e2e          -> especificações de smoke/regressão/negativos/api-ui
  /fixtures     -> dados de teste estáticos centralizados
  /support      -> comandos customizados e hooks
  /utils        -> fábricas/utilitários
/config         -> estratégia de ambiente
/ci             -> scripts de quality gate e políticas
/docker         -> Dockerfiles
/k6             -> scripts de carga/estresse/pico (spike)
/grafana        -> provisionamento de datasources + dashboards
/app            -> aplicação local determinística (AUT) para confiança na pipeline
```

## Estratégia de Qualidade

### Pirâmide de Testes / Shift-left
- Unidade: testes leves de saúde da API (`node --test`).
- E2E: jornadas críticas do usuário + validações negativas e de limite (boundary).
- Especificações combinadas API+UI para validar a consistência de ponta a ponta.

### Modelo de Cobertura
- **Smoke (Fumaça)**: login e saúde básica do sistema.
- **Crítico**: fluxos principais de autenticação + checkout.
- **Regressão**: limites, acessos não autorizados, entradas inválidas, consistência API+UI.
- Inclui considerações de caminhos alternativos (falhas de autenticação, limites de saldo, estados sem dados).

## Execução Local

```bash
npm ci
node app/index.js
npm run cy:run
npm run k6:load
npm run quality:gates
```

## Tags e Seleção Inteligente

- `@smoke`: verificações rápidas em Pull Requests (PRs).
- `@critical`: fluxos que bloqueiam o lançamento (release blockers).
- `@regression`: verificações noturnas ou completas.
- A CI executa o smoke para PRs e execuções paralelas gravadas no Cloud para a branch principal (main).

## Controles do Plano Starter do Cypress Cloud

- Chave de gravação (Record key) injetada via segredo `CYPRESS_RECORD_KEY`.
- A pipeline de PR padrão executa apenas o smoke para reduzir a contagem mensal de execuções.
- Execução completa gravada apenas em main/noturno.
- Tentativas (retries) limitadas a `runMode: 1` para evitar mascaramento de testes instáveis (flaky).

## Observabilidade

- Screenshots/vídeos do Cypress em caso de falha na pasta `artifacts/`.
- JUnit XML para relatórios legíveis por máquinas.
- Resumos do k6 exportados como JSON para análise pelo quality gate.
- Dashboard do Grafana rastreia latência p95, taxa de erro e throughput.

## Execução via Docker

```bash
docker compose up --build --abort-on-container-exit cypress
```

Isso inicializa:
- Aplicação sob teste (`app`)
- Executor do Cypress (`cypress`)
- Executor do k6 (`k6`)
- Stack de telemetria Grafana + InfluxDB

## Quality Gates Corporativos (a pipeline falha se qualquer condição falhar)

1. Qualquer falha em teste do Cypress.
2. Limites de p95 ou falhas de requisição do k6 excedidos.
3. Ausência de cobertura em fluxos marcados como críticos (@critical).
4. Ausência de artefatos esperados.

## Notas sobre Segurança e Manutenibilidade

- Segredos gerenciados apenas no armazenamento de segredos da CI.
- Isolamento de seletores via App Actions para evitar fragilidade nos testes.
- Dados separados da lógica através de fixtures e factories.
- Aplicação local determinística permite resultados de testes repetíveis.

![Selo em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)
