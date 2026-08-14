# RSS staged load test

`rss-load-test.jmx` targets `GET /rss/CLOUDDEVOPS` by default and sends one stable `X-Client-Id` per JMeter thread. The same plan supports all required stages through properties: `users`, `rampUp`, `loops`, `host`, `port`, and `feedCode`.

Run one stage:

```powershell
jmeter -n -t tests/jmeter/rss-load-test.jmx -Jusers=100 -JrampUp=30 -Jloops=1 -Jhost=localhost -Jport=4000 -JfeedCode=CLOUDDEVOPS -l tests/jmeter/results/100-users.jtl -e -o tests/jmeter/results/100-users-report
```

Run the prepared 1, 10, 100, 1,000 and 10,000-client sequence:

```powershell
powershell -ExecutionPolicy Bypass -File tests/jmeter/run-stages.ps1
```

The script stops if a stage fails. Keep the actual result; do not substitute or fabricate a successful run. Generated `.jtl` and HTML directories are ignored by Git.
