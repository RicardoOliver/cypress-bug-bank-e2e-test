#!/usr/bin/env bash
set -euo pipefail

mkdir -p artifacts

echo "[Quality Gate] Validating Cypress junit output"
if ! compgen -G "artifacts/cypress/results/*.xml" > /dev/null; then
  echo "No Cypress junit files found. Failing gate."
  exit 1
fi

if rg -n "failures=\"[1-9]" artifacts/cypress/results/*.xml; then
  echo "Cypress failures detected. Failing gate."
  exit 1
fi

echo "[Quality Gate] Validating k6 thresholds"
for summary in artifacts/k6-*-summary.json; do
  [ -e "$summary" ] || continue
  p95=$(node -e "const s=require('./${summary}');console.log(s.metrics.http_req_duration.values['p(95)'] ?? 0)")
  fail_rate=$(node -e "const s=require('./${summary}');console.log((s.metrics.http_req_failed.values.rate ?? 0))")
  echo "${summary} => p95=${p95} failRate=${fail_rate}"
  awk -v p95="$p95" 'BEGIN{ if (p95 > 800) exit 1 }' || { echo "p95 threshold breached"; exit 1; }
  awk -v fr="$fail_rate" 'BEGIN{ if (fr > 0.01) exit 1 }' || { echo "error rate threshold breached"; exit 1; }
done

echo "[Quality Gate] Verifying critical path coverage"
critical_count=$(rg -n "@critical" cypress/e2e | wc -l | tr -d ' ')
if [ "$critical_count" -lt 1 ]; then
  echo "Critical flows not covered"
  exit 1
fi

echo "All quality gates passed"
