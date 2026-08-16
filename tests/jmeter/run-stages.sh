#!/usr/bin/env bash
set -euo pipefail

# Linux/EC2 equivalent of run-stages.ps1. It retains each stage under a label
# so the local baseline and the EC2 measurement can be compared honestly.
JMETER="${JMETER:-jmeter}"
HOST_NAME="${HOST_NAME:-127.0.0.1}"
PORT="${PORT:-4080}"
FEED_CODE="${FEED_CODE:-CLOUDDEVOPS}"
LOOPS="${LOOPS:-1}"
RUN_LABEL="${RUN_LABEL:-ec2-final}"

if [[ ! "$RUN_LABEL" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "RUN_LABEL may contain only letters, numbers, dots, underscores and hyphens." >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAN="$ROOT/rss-load-test.jmx"
RESULTS_ROOT="$ROOT/results/$RUN_LABEL"
mkdir -p "$RESULTS_ROOT"

for stage in "1:1" "10:5" "100:30" "1000:120" "10000:600"; do
  IFS=: read -r users ramp <<<"$stage"
  name="${users}-users"
  result="$RESULTS_ROOT/${name}.jtl"
  report="$RESULTS_ROOT/${name}-report"
  if [[ -e "$result" || -e "$report" ]]; then
    echo "Output already exists for $name; choose another RUN_LABEL." >&2
    exit 2
  fi
  echo "Running $name with a ${ramp}-second ramp-up against ${HOST_NAME}:${PORT}"
  "$JMETER" -n -t "$PLAN" \
    -Jusers="$users" -JrampUp="$ramp" -Jloops="$LOOPS" \
    -Jhost="$HOST_NAME" -Jport="$PORT" -JfeedCode="$FEED_CODE" \
    -l "$result" -e -o "$report"
done
