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

## Final EC2 deployment validation

Date: 16 August 2026
Environment: final EC2 Linux deployment, Apache JMeter 5.6.3, Temurin Java 17.0.20. JMeter ran on the EC2 host and targeted the deployed Docker API through `127.0.0.1:4080`.

| Clients | Samples |  Average |   Median |      P90 |      P95 | Throughput |    Errors | Maximum |
| ------: | ------: | -------: | -------: | -------: | -------: | ---------: | --------: | ------: |
|       1 |       1 | 66.00 ms | 66.00 ms | 66.00 ms | 66.00 ms |    15.15/s | 0 (0.00%) |   66 ms |
|      10 |      10 | 26.30 ms | 23.50 ms | 50.50 ms | 53.00 ms |     2.25/s | 0 (0.00%) |   53 ms |
|     100 |     100 | 23.23 ms | 21.00 ms | 28.90 ms | 31.95 ms |     3.38/s | 0 (0.00%) |   72 ms |
|   1,000 |   1,000 | 19.63 ms | 18.00 ms | 23.00 ms | 26.95 ms |     8.35/s | 0 (0.00%) |  126 ms |
|  10,000 |  10,000 | 18.99 ms | 17.00 ms | 22.00 ms | 25.00 ms |    16.67/s | 0 (0.00%) |  242 ms |

All five EC2 stages completed and the API health endpoint remained healthy. The local and EC2 results must not be treated as identical Internet-latency benchmarks: the EC2 generator was co-located with the deployed service and the two environments have different host/runtime resources. They do, however, use the same staged plan, endpoint, assertions, client identity headers and ramp settings. Full generated EC2 HTML reports are retained locally in `tests/jmeter/results/ec2-final-20260816/` for the assessment video.
