# Backs up the OSDHYAN PostgreSQL database (port 5433) and the uploaded files.
# Keeps the newest 14 backups. Run by hand, or nightly with Windows Task Scheduler:
#   schtasks /Create /SC DAILY /ST 02:30 /TN "OSDHYAN backup" /TR "powershell -ExecutionPolicy Bypass -File C:\dev\test-series-platform\scripts\host\backup-db.ps1"
# Copy C:\dev\osdhyan-data\backups to a USB drive or Google Drive now and then:
# a backup on the same disk does not survive a dead disk.
param([int]$Keep = 14)

$ErrorActionPreference = 'Stop'
$PgBin   = 'C:\Program Files\PostgreSQL\16\bin'
$Out     = 'C:\dev\osdhyan-data\backups'
$Storage = 'C:\dev\test-series-platform\backend\storage\app\public'
New-Item -ItemType Directory -Force $Out | Out-Null

# Database name and user from backend/.env
$envFile = Get-Content 'C:\dev\test-series-platform\backend\.env'
$db   = (($envFile | Where-Object { $_ -match '^DB_DATABASE=' }) -replace '^DB_DATABASE=', '').Trim('"')
$user = (($envFile | Where-Object { $_ -match '^DB_USERNAME=' }) -replace '^DB_USERNAME=', '').Trim('"')

$stamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$dump  = Join-Path $Out "osdhyan-db-$stamp.dump"
& "$PgBin\pg_dump.exe" -h 127.0.0.1 -p 5433 -U $user -d $db -Fc -f $dump
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed ($LASTEXITCODE)" }

$files = Join-Path $Out "osdhyan-files-$stamp.zip"
if (Test-Path $Storage) { Compress-Archive -Path "$Storage\*" -DestinationPath $files -CompressionLevel Fastest -Force }

# Keep only the newest $Keep of each kind
foreach ($pattern in 'osdhyan-db-*.dump', 'osdhyan-files-*.zip') {
    Get-ChildItem $Out -Filter $pattern | Sort-Object LastWriteTime -Descending | Select-Object -Skip $Keep | Remove-Item -Force
}

"Backup done: $dump ($([math]::Round((Get-Item $dump).Length / 1MB, 1)) MB)"
# Restore (into an empty database):  pg_restore -h 127.0.0.1 -p 5433 -U <user> -d <db> --clean --if-exists "<file>.dump"
