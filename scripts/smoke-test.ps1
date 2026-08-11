$ErrorActionPreference = "Stop"

function Assert-Http {
  param([string]$Url, [string]$Expected)
  $response = Invoke-WebRequest -UseBasicParsing -Uri $Url
  if ($response.StatusCode -ne 200 -or ($Expected -and $response.Content -notmatch $Expected)) {
    throw "Smoke check failed for $Url"
  }
  Write-Host "PASS $Url"
}

Assert-Http "http://localhost:3000" "Content"
Assert-Http "http://localhost:4000/health" '"database":"connected"'
Assert-Http "http://localhost:4000/api/feeds" '"success":true'
Assert-Http "http://localhost:4000/rss" "<rss"
Assert-Http "http://localhost:5000" "RSS Client"

$before = (Invoke-RestMethod "http://localhost:4000/api/posts?pageSize=1").meta.total
docker compose restart api | Out-Null
$deadline = (Get-Date).AddSeconds(60)
do {
  Start-Sleep -Seconds 2
  try { $healthy = (Invoke-RestMethod "http://localhost:4000/health").data.database -eq "connected" } catch { $healthy = $false }
} until ($healthy -or (Get-Date) -gt $deadline)
if (-not $healthy) { throw "API did not become healthy after restart" }
$after = (Invoke-RestMethod "http://localhost:4000/api/posts?pageSize=1").meta.total
if ($before -ne $after) { throw "Post count changed across API restart" }
Write-Host "PASS SQLite data persisted across API restart ($after posts)"
