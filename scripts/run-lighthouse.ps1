param(
  [string]$DashboardUrl = "http://localhost:3000",
  [string]$RssClientUrl = "http://localhost:5000",
  [ValidateSet("before", "after")]
  [string]$Label = "after"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent
$outputRoot = Join-Path $projectRoot "docs\testing\results"
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null

Push-Location $projectRoot
try {
  $targets = @(
    @{ Name = "dashboard"; Url = $DashboardUrl },
    @{ Name = "rss-client"; Url = $RssClientUrl }
  )
  foreach ($target in $targets) {
    $output = "docs/testing/results/lighthouse-$($target.Name)-$Label"
    npx lighthouse $target.Url --only-categories=accessibility --output=json --output=html --output-path=$output --chrome-flags="--headless --no-sandbox --disable-gpu" --quiet
    $jsonReport = Join-Path $projectRoot "$output.report.json"
    if ($LASTEXITCODE -ne 0 -and -not (Test-Path -LiteralPath $jsonReport)) {
      throw "Lighthouse failed before writing $jsonReport"
    }
  }
} finally {
  Pop-Location
}

exit 0
