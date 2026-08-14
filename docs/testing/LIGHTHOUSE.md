# Lighthouse accessibility evidence

Run the dashboard and RSS client in Docker, then execute:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-lighthouse.ps1 -Label before
# Review and fix genuine findings.
powershell -ExecutionPolicy Bypass -File scripts/run-lighthouse.ps1 -Label after
```

Reports are written to `docs/testing/results/` as HTML and JSON and are ignored by Git so regenerated evidence does not bloat the submission.

## Actual implementation review

On 14 August 2026, Lighthouse 12.8.2 reported:

- Dashboard before: accessibility 96. The “Open reports” link inherited dark text on the violet primary background, producing a reported 2.71:1 contrast ratio.
- RSS Client before: accessibility 100, with no failed binary accessibility audit.
- Dashboard after: accessibility 100 with no failed binary accessibility audit.
- RSS Client after: accessibility 100 with no failed binary accessibility audit.

The dashboard link now sets an explicit white foreground, preserving its accessible name and visible keyboard focus while correcting the measured contrast problem. Scores are evidence from this workstation and must be rerun on the final demonstration deployment rather than treated as permanent guarantees.

On this Windows workstation, Chrome Launcher reported an `EPERM` warning while removing its temporary profile after the reports had been written. The runner accepts that cleanup-only condition when the JSON evidence exists, but still fails if Lighthouse exits before producing a report.
