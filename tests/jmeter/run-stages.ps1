param(
  [string]$JMeter = "jmeter",
  [string]$HostName = "localhost",
  [int]$Port = 4000,
  [string]$FeedCode = "CLOUDDEVOPS",
  [int]$Loops = 1,
  [string]$RunLabel = ""
)

$ErrorActionPreference = "Stop"
$testRoot = $PSScriptRoot
$plan = Join-Path $testRoot "rss-load-test.jmx"
$resultsRoot = Join-Path $testRoot "results"
if ($RunLabel) {
  if ($RunLabel -notmatch "^[A-Za-z0-9._-]+$") {
    throw "RunLabel may contain only letters, numbers, dots, underscores and hyphens."
  }
  $resultsRoot = Join-Path $resultsRoot $RunLabel
}
$stages = @(
  @{ Users = 1; Ramp = 1 },
  @{ Users = 10; Ramp = 5 },
  @{ Users = 100; Ramp = 30 },
  @{ Users = 1000; Ramp = 120 },
  @{ Users = 10000; Ramp = 600 }
)

New-Item -ItemType Directory -Path $resultsRoot -Force | Out-Null
foreach ($stage in $stages) {
  $name = "$($stage.Users)-users"
  $result = Join-Path $resultsRoot "$name.jtl"
  $report = Join-Path $resultsRoot "$name-report"
  if ((Test-Path -LiteralPath $result) -or (Test-Path -LiteralPath $report)) {
    throw "JMeter output already exists for $name. Move or remove it before rerunning this stage."
  }
  $jmeterArgs = @(
    "-n",
    "-t", $plan,
    "-Jusers=$($stage.Users)",
    "-JrampUp=$($stage.Ramp)",
    "-Jloops=$Loops",
    "-Jhost=$HostName",
    "-Jport=$Port",
    "-JfeedCode=$FeedCode",
    "-l", $result,
    "-e",
    "-o", $report
  )
  Write-Host "Running $name with a $($stage.Ramp)-second ramp-up"
  & $JMeter @jmeterArgs
  if ($LASTEXITCODE -ne 0) { throw "JMeter stage $name failed with exit code $LASTEXITCODE" }
  if (-not (Test-Path -LiteralPath $result) -or -not (Test-Path -LiteralPath (Join-Path $report "index.html"))) {
    throw "JMeter stage $name did not create the expected JTL and HTML report."
  }
}
