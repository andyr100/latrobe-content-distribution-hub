# Full staged validation

Date: 16 August 2026
Environment: local Docker API, Apache JMeter 5.6.3, Temurin Java 17.0.20

The parameterised plan ran with `loops=1` against `GET /rss/CLOUDDEVOPS`. Each thread supplied its own `jmeter-${threadNum}` client ID. Figures come from each generated JMeter `statistics.json` file.

| Clients | Samples |      Average |       Median |          P90 |          P95 | Throughput |         Errors |   Maximum |
| ------: | ------: | -----------: | -----------: | -----------: | -----------: | ---------: | -------------: | --------: |
|       1 |       1 |     79.00 ms |     79.00 ms |     79.00 ms |     79.00 ms |    12.66/s |      0 (0.00%) |     79 ms |
|      10 |      10 |     41.10 ms |     40.50 ms |     56.40 ms |     58.00 ms |     2.24/s |      0 (0.00%) |     58 ms |
|     100 |     100 |     40.32 ms |     39.00 ms |     51.90 ms |     61.75 ms |     3.37/s |      0 (0.00%) |     77 ms |
|   1,000 |   1,000 |     34.77 ms |     34.00 ms |     36.00 ms |     37.00 ms |     8.35/s |      0 (0.00%) |    217 ms |
|  10,000 |  10,000 | 29,959.97 ms | 30,003.00 ms | 30,004.00 ms | 30,009.00 ms |    15.88/s | 9,971 (99.71%) | 30,029 ms |

x1 through x1,000 completed without errors. The x10,000 stage saturated the local single-instance Next.js/SQLite path at roughly 501 active threads; almost every request reached the configured 30-second timeout. The API was unhealthy immediately after the run. Restarting only the API container restored a `200 OK` health response, database connectivity and all eight feeds in about six seconds. No volume was removed.

Because every thread performs one request and threads are gradually started, this is a distinct-client arrival-volume test rather than 10,000 simultaneous sustained connections. Different ramp periods also make raw throughput values unsuitable for direct stage-to-stage capacity comparison. The result is retained as an observed limitation and is not represented as a successful x10,000 service level.
