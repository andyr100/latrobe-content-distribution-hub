# JMeter load testing

Install Java 17 or newer and Apache JMeter 5.6.3, then place `jmeter` on `PATH`. Start the API and confirm `http://localhost:4000/health` returns 200 before running the plan.

The parameterised plan and staged PowerShell runner are in `tests/jmeter/`. It sends `X-Client-Id: jmeter-${threadNum}` and `X-Client-Source: jmeter`, so every stage becomes visible in Hub Intelligence.

The first run writes directly under `tests/jmeter/results/`. Preserve it and give later runs a label so evidence is never overwritten:

```powershell
powershell -ExecutionPolicy Bypass -File tests/jmeter/run-stages.ps1 -RunLabel "ec2-final"
```

For each generated HTML report, record the actual sample count, average, median, 90th/95th percentile, throughput, error percentage, and maximum response time. Preserve failures and resource limits honestly. The repository does not contain invented performance numbers.

On 16 August 2026, the complete x1/x10/x100/x1,000/x10,000 sequence was executed locally with Apache JMeter 5.6.3 and Temurin Java 17. x1 through x1,000 completed with 0% errors. At x10,000, 9,971 of 10,000 samples timed out (99.71%), the API became unhealthy, and an API-only restart restored `/health` in about six seconds without deleting the database volume. This is valid measured capacity evidence, not a successful x10,000 performance claim. See [VALIDATION.md](../../tests/jmeter/VALIDATION.md) and the video-ready [combined HTML evidence](ASSESSMENT_TEST_EVIDENCE.html).

The default plan uses one request per thread with gradual ramp-up. It demonstrates the required number of distinct virtual RSS clients and their arrival behavior, but does not hold 10,000 simultaneous connections. Use additional loops or a dedicated sustained-load plan for capacity engineering.
