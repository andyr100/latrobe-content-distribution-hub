# JMeter load testing

Install Java 17 or newer and Apache JMeter 5.6.3, then place `jmeter` on `PATH`. Start the API and confirm `http://localhost:4000/health` returns 200 before running the plan.

The parameterised plan and staged PowerShell runner are in `tests/jmeter/`. It sends `X-Client-Id: jmeter-${threadNum}` and `X-Client-Source: jmeter`, so every stage becomes visible in Hub Intelligence.

For each generated HTML report, record the actual sample count, average, median, 90th/95th percentile, throughput, error percentage, and maximum response time. Preserve failures and resource limits honestly. The repository does not contain invented performance numbers.

The plan was structurally validated with Apache JMeter 5.6.3 and Temurin Java 17, then exercised against the Docker API with 10 clients. That validation produced 10 samples, 0 errors, and visible `jmeter-*` client records in the dashboard. It proves the plan works; it does not replace the required final staged evidence. Run and retain all five stages on the demonstration environment before the video.
