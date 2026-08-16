# Assessment 3 video script — 5 minutes

Target length: 4:45 to 5:15. Speak naturally; do not claim anything not shown. Keep your face, voice and student ID visible during the opening.

## 0:00–0:20 — Introduction

“Hi, I’m [name], student ID [ID]. This is my CSE5006 Assessment 3 submission: the La Trobe Content Distribution Hub. It extends the RSS Server and mock LMS client with persistent reporting, observability, automated testing and a final EC2 deployment.”

Show the GitHub repository homepage, then the EC2 frontend at `http://EC2_MACHINE_IP`. Before recording, replace `EC2_MACHINE_IP` with the instance's current Public IPv4 address (or use its Elastic IP/DNS name if one is configured).

## 0:20–1:10 — Data-driven dashboard and persistence

“The dashboard is data-driven, not mock charts. The API persists posts, feeds, authors, RSS users, request logs, feed-status events and alerts in SQLite through Sequelize. These cards and charts aggregate those records into request totals, feed demand, client activity, latency, health and warnings.”

Show Dashboard KPI cards, rankings, health status, alert, recent requests and one chart. Open the RSS Client at `http://EC2_MACHINE_IP:5000`, choose a mock LMS user and a channel, then return to the dashboard after refresh.

“The RSS Client sends a stable technical client ID and selected RSS user. Its feed request is recorded, so this interaction changes the persisted monitoring data. The RSS client is a separate deployed service on port 5000; its API calls remain server-side to the RSS API.”

## 1:10–1:50 — Observability and resilience

Open Hub Intelligence and filter by time, RSS user, channel and result. Expand and collapse the request-log section.

“Hub Intelligence provides the detailed reporting view: filterable persisted evidence, pagination, request rate, latency, feed status and alerts. The API health endpoint reports application status, SQLite connectivity and feed count. JMeter load-generator traffic is deliberately stored for load evidence but excluded from Hub Intelligence, so synthetic test traffic does not distort normal operational reporting.”

Show `http://EC2_MACHINE_IP:4080/health`, then a warning/alert and its resolution if available.

## 1:50–2:35 — Playwright evidence

Open `docs/testing/ASSESSMENT_TEST_EVIDENCE.html`, then `playwright-report-ec2/index.html`.

“Playwright was rerun from EC2 against the deployed services. All three Chromium tests passed in 7.8 seconds. The server test performs real RSS post CRUD: create, read, update, publish through RSS, delete and verify deletion. The client test creates a post, selects a mock LMS user and channel, and proves the RSS item renders. The third test verifies Hub Intelligence filters, charts, pagination and collapsible evidence. Test posts are deleted in finally blocks, preserving the demonstration data.”

“For comparison, the original local isolated run also passed 3 out of 3, in 22.9 seconds. The two timings are not a benchmark because the local run used development services and an isolated database, while the final run used deployed EC2 services.”

## 2:35–3:35 — JMeter local versus EC2 evidence

Keep the comparison page open and scroll to the JMeter table. Open the EC2 x10,000 report in a second tab.

“The JMeter plan uses the required staged levels: 1, 10, 100, 1,000 and 10,000 virtual RSS clients. Every thread sends a unique client ID, requests a real RSS feed and asserts HTTP 200 plus RSS XML.”

“The local baseline passed through 1,000 clients but at 10,000 it recorded 9,971 timeouts, or 99.71 percent errors, and required an API-only restart. I preserved that limitation rather than hiding it.”

“I then ran exactly the staged plan on the final EC2 Linux deployment. All five EC2 stages completed with zero errors. At 10,000 staged clients the average was 18.99 milliseconds, median 17 milliseconds, P95 25 milliseconds, maximum 242 milliseconds and throughput 16.67 requests per second; the API health check remained healthy.”

“The comparison is intentionally qualified: JMeter was co-located on EC2 and each thread sends one gradually ramped request, so this proves staged distinct-client arrival volume, not 10,000 simultaneous sustained internet users. A future sustained-load profile with a hold period is the next engineering step.”

## 3:35–4:10 — Accessibility

Open the saved Lighthouse dashboard and RSS Client reports.

“I evaluated accessibility with Lighthouse. The dashboard improved from 96 to 100 after I corrected primary-link contrast. The RSS Client remained 100. This affected the final design through contrast-safe interactive elements, labels for selectors, visible focus and accessible chart/table alternatives.”

## 4:10–4:45 — Deployment, code quality and conclusion

Show EC2 URLs, `docker compose ps` in the EC2 VS Code terminal, GitHub commits, then `git status`.

“The final system is deployed in Docker on EC2: frontend on port 80, API on 4080 and the standalone RSS Client on 5000. SQLite is a private named Docker volume. The code is modular across frontend, API, RSS client and shared contracts, and the commit history records the EC2 deployment, RSS-client HTTP fix and EC2 test paths.”

“In summary, this submission demonstrates persistent RSS data, observable server behaviour, realistic warning states, server and client end-to-end workflows, staged load evidence in local and EC2 environments, and accessibility improvements. It is ready to extend into the Assessment 4 live presentation.”

## Optional 20-second OpenTelemetry segment (use only if the profile is running)

Use this in place of the final part of the **1:10-1:50 Observability and resilience** section. Show Jaeger at `http://localhost:16686` and Prometheus at `http://localhost:9090` through the SSH tunnel.

“Hub Intelligence is the assessed, database-backed operational view. OpenTelemetry is the optional infrastructure layer. The API creates trace spans for requests; the OpenTelemetry Collector receives them, Jaeger shows the end-to-end request trace and timing, and Prometheus exposes aggregated span metrics such as request-call counts.”

“On EC2 I start the optional observability profile, make a health or RSS request, then select `latrobe-content-api` in Jaeger. That shows the request trace. In Prometheus I query `traces_span_metrics_calls_total`, which shows the aggregated calls captured from those spans. I access both safely through SSH port forwarding rather than opening additional public EC2 ports.”

Show one API request in Jaeger, then the Prometheus query result. State that this complements, rather than replaces, the persisted Hub Intelligence metrics.

## Commands beside the recording

```powershell
# Local evidence pages
Start-Process .\docs\testing\ASSESSMENT_TEST_EVIDENCE.html
Start-Process .\playwright-report-ec2\index.html
Start-Process .\tests\jmeter\results\ec2-final-20260816\10000-users-report\index.html
Start-Process .\docs\testing\results\lighthouse-dashboard-after.report.html
```

```bash
# EC2 status
cd ~/latrobe-content-distribution-hub
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml ps
curl http://127.0.0.1:4080/health
```

```bash
# EC2: start optional OpenTelemetry, Jaeger and Prometheus profile
cd ~/latrobe-content-distribution-hub
sudo docker compose --env-file ec2.env \
  -f docker-compose.yml \
  -f docker-compose.ec2.override.yml \
  -f docker-compose.observability.yml \
  --profile observability up --build -d
curl http://127.0.0.1:4080/health
curl http://127.0.0.1:4080/rss/CLOUDDEVOPS -H "X-Client-Id: otel-demo"
```

```powershell
# Local PowerShell: private access to the EC2 observability UIs
ssh -N -L 16686:127.0.0.1:16686 -L 9090:127.0.0.1:9090 latrobe-content-hub
# Then open http://localhost:16686 and http://localhost:9090
# Prometheus query: traces_span_metrics_calls_total
```

## Final recording checklist

- Face, voice and student ID visible in the opening.
- GitHub homepage and meaningful commits visible.
- EC2 Dashboard, RSS Client, Hub Intelligence, health endpoint and Docker status shown.
- If the optional profile is running: Jaeger trace and Prometheus span-metric query shown.
- Playwright EC2 report, JMeter EC2 x10,000 report and Lighthouse reports shown.
- Explain the local/EC2 JMeter difference and its methodology qualification honestly.
- Do not expose AWS passwords, keys, PEM contents or unrelated personal data.
- Submit a source ZIP without `node_modules`, generated reports, `.next`, SQLite data or PEM files.
