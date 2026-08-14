# OpenTelemetry observability profile

Assessment 3 uses two complementary observability layers:

1. The assessed application layer persists RSS request logs, feed status events and alerts in SQLite and presents their aggregates in Dashboard and Reports.
2. This optional infrastructure profile sends Next.js API traces through OpenTelemetry Collector, displays traces in Jaeger, and converts span data into Prometheus metrics.

Start the profile:

```powershell
docker compose -f docker-compose.yml -f docker-compose.observability.yml --profile observability up --build -d
```

Generate a trace:

```powershell
Invoke-WebRequest http://localhost:4000/health
Invoke-WebRequest http://localhost:4000/rss/CLOUDDEVOPS -Headers @{ "X-Client-Id" = "otel-demo" }
```

Open:

- Jaeger: http://localhost:16686 — select `latrobe-content-api` and find traces.
- Prometheus: http://localhost:9090 — query `traces_span_metrics_calls_total` or inspect the `otel-span-metrics` target.

The profile was verified with live `/health` and `/rss/CLOUDDEVOPS` requests: Jaeger returned `latrobe-content-api` traces, the Prometheus target was up, and `traces_span_metrics_calls_total` contained API span series. This is implementation evidence, not a promise about a future deployment.

The normal `docker compose up --build -d` command does not enable telemetry or start these services. The profile therefore cannot interfere with Assessment 1/2 continuity or an EC2 deployment that only needs application-level metrics.
