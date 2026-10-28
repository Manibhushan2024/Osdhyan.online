# Export the laptop's OSDHYAN data for the cloud server.
#   powershell -ExecutionPolicy Bypass -File deploy\scripts\export-laptop-data.ps1
# Makes, in C:\dev\osdhyan-data\migration\:
#   osdhyan_db.dump      the whole database (pg_dump custom format)
#   storage_app.tar.gz   uploaded PDFs, images and notes (backend\storage\app)
# Copy both into deploy/restore/ on the server, e.g.
#   scp C:\dev\osdhyan-data\migration\* user@SERVER:~/test-series-platform/deploy/restore/
# then run deploy/scripts/restore-from-laptop.sh there.
param(
    [string]$PgBin = 'C:\Program Files\PostgreSQL\16\bin',
    [string]$Out   = 'C:\dev\osdhyan-data\migration'
)
$ErrorActionPreference = 'Stop'
$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$EnvFile = Join-Path $Root 'backend\.env'

function EnvValue([string]$key, [string]$default) {
    $line = Get-Content $EnvFile | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
    if ($line) { return ($line -replace "^$key=", '').Trim('"') } else { return $default }
}

$db   = EnvValue 'DB_DATABASE' 'test_series_db'
$user = EnvValue 'DB_USERNAME' 'postgres'
$port = EnvValue 'DB_PORT' '5433'
$env:PGPASSWORD = EnvValue 'DB_PASSWORD' ''

New-Item -ItemType Directory -Force $Out | Out-Null
$dump = Join-Path $Out 'osdhyan_db.dump'
$tarf = Join-Path $Out 'storage_app.tar.gz'

Write-Host "== Dumping database $db (port $port)"
& "$PgBin\pg_dump.exe" -h 127.0.0.1 -p $port -U $user -d $db -Fc --no-owner --no-privileges -f $dump
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed (is PostgreSQL running on port $port?)" }

Write-Host "== Packing uploaded files"
$storage = Join-Path $Root 'backend\storage\app'
& tar.exe -czf $tarf -C $storage .
if ($LASTEXITCODE -ne 0) { throw 'tar failed' }

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
Get-Item $dump, $tarf | Select-Object Name, @{n='MB'; e={[math]::Round($_.Length / 1MB, 1)}} | Format-Table -AutoSize
Write-Host "Copy both files to deploy/restore/ on the server, then run scripts/restore-from-laptop.sh there."
