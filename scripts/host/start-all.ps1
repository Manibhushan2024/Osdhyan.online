# Starts everything OSDHYAN needs on this laptop:
#   PostgreSQL (5433) -> Redis (service) -> Apache+PHP API (8000) -> Portal (3000) -> Cloudflare tunnel
# Run:   powershell -ExecutionPolicy Bypass -File C:\dev\test-series-platform\scripts\host\start-all.ps1
# Logs:  C:\dev\osdhyan-data\logs\
param(
    [switch]$NoTunnel,      # skip cloudflared
    [switch]$Rebuild        # rebuild the portal (after code changes)
)

$ErrorActionPreference = 'Continue'
$Root    = 'C:\dev\test-series-platform'
$Data    = 'C:\dev\osdhyan-data'
$Logs    = "$Data\logs"
$PgBin   = 'C:\Program Files\PostgreSQL\16\bin'
$Portal  = "$Root\apps\portal"
New-Item -ItemType Directory -Force $Logs | Out-Null

function Listening($port) { (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0 }

# 1. PostgreSQL
if (-not (Listening 5433)) {
    # Started detached: piping pg_ctl's output made this script wait forever,
    # because the postgres child process keeps the pipe open.
    Start-Process -FilePath "$PgBin\pg_ctl.exe" -WindowStyle Hidden -ArgumentList @(
        '-D', "`"$Data\pgdata`"", '-o', '"-p 5433 -c listen_addresses=127.0.0.1 -c max_connections=300"',
        '-l', "`"$Logs\postgres.log`"", 'start')
    # After a crash or power cut PostgreSQL first replays its log; give it up to 2 minutes.
    for ($i = 0; $i -lt 60 -and -not (Listening 5433); $i++) { Start-Sleep 2 }
}
& "$PgBin\pg_isready.exe" -h 127.0.0.1 -p 5433

# 2. Redis (Windows service "Redis"; falls back to a plain process)
if (-not (Listening 6379)) {
    try { Start-Service Redis -ErrorAction Stop } catch { Start-Process 'C:\Redis\redis-server.exe' -ArgumentList '--save "" --stop-writes-on-bgsave-error no' -WindowStyle Hidden }
    Start-Sleep 2
}
& 'C:\Redis\redis-cli.exe' CONFIG SET stop-writes-on-bgsave-error no | Out-Null

# 3. Laravel: migrate + caches (idempotent), then Apache+mod_php on 8000
Push-Location "$Root\backend"
php artisan migrate --force --no-ansi | Select-Object -Last 1
php artisan config:cache --no-ansi | Out-Null
php artisan route:cache  --no-ansi | Out-Null
php artisan view:cache   --no-ansi | Out-Null
php artisan storage:link 2>$null   | Out-Null
Pop-Location
if (-not (Listening 8000)) {
    Start-Process -FilePath 'C:\xampp\apache\bin\httpd.exe' -WorkingDirectory 'C:\xampp\apache' -WindowStyle Hidden
    Start-Sleep 3
}
"API:    http://127.0.0.1:8000/api/health -> " + (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/health -TimeoutSec 15).StatusCode

# 4. Queue worker + scheduler (emails, AI jobs, auto-submit of expired attempts)
if (-not (Get-Process php -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -match 'queue:work' })) {
    Start-Process php -ArgumentList "artisan queue:work --queue=mail,default,ai --sleep=3 --tries=3 --max-time=3600" -WorkingDirectory "$Root\backend" -WindowStyle Hidden -RedirectStandardOutput "$Logs\queue.log" -RedirectStandardError "$Logs\queue.err.log"
}
if (-not (Get-Process php -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -match 'schedule:work' })) {
    Start-Process php -ArgumentList "artisan schedule:work" -WorkingDirectory "$Root\backend" -WindowStyle Hidden -RedirectStandardOutput "$Logs\scheduler.log" -RedirectStandardError "$Logs\scheduler.err.log"
}

# 5. Portal (production build, standalone server)
$standalone = "$Portal\.next\standalone\apps\portal\server.js"
if ($Rebuild -or -not (Test-Path $standalone)) {
    # Windows locks files of the running server -> `next build` fails with EBUSY. Stop it first.
    Get-Process node -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -match 'standalone' } | Stop-Process -Force
    Start-Sleep 2
    Push-Location $Portal
    $env:NODE_OPTIONS = '--max-old-space-size=3072'
    # Google Fonts are fetched at build time; bypass any local TLS-intercepting proxy
    $env:NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS = '1'
    $savedProxy = @{ HTTP_PROXY = $env:HTTP_PROXY; HTTPS_PROXY = $env:HTTPS_PROXY }
    Remove-Item Env:HTTP_PROXY, Env:HTTPS_PROXY -ErrorAction SilentlyContinue
    npx next build 2>&1 | Tee-Object "$Logs\portal-build.log" | Select-Object -Last 3
    Remove-Item Env:NODE_OPTIONS
    if ($savedProxy.HTTP_PROXY)  { $env:HTTP_PROXY  = $savedProxy.HTTP_PROXY }
    if ($savedProxy.HTTPS_PROXY) { $env:HTTPS_PROXY = $savedProxy.HTTPS_PROXY }
    Pop-Location
}
# standalone needs the static assets and public folder next to server.js (every start)
New-Item -ItemType Directory -Force "$Portal\.next\standalone\apps\portal\.next" | Out-Null
Copy-Item -Recurse -Force "$Portal\public"       "$Portal\.next\standalone\apps\portal\"
Copy-Item -Recurse -Force "$Portal\.next\static" "$Portal\.next\standalone\apps\portal\.next\"
if (-not (Listening 3000)) {
    $env:PORT = '3000'; $env:HOSTNAME = '127.0.0.1'; $env:BACKEND_ORIGIN = 'http://127.0.0.1:8000'
    Start-Process node -ArgumentList $standalone -WorkingDirectory "$Portal\.next\standalone\apps\portal" -WindowStyle Hidden -RedirectStandardOutput "$Logs\portal.log" -RedirectStandardError "$Logs\portal.err.log"
    Start-Sleep 4
}
try { "Portal: http://localhost:3000 -> " + (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/api/health -TimeoutSec 20).StatusCode } catch { "Portal: starting (see $Logs\portal.err.log)" }

# 6. Cloudflare tunnel
if (-not $NoTunnel) {
    $named = Test-Path "$Data\cloudflared\config.yml"
    if ($named) {
        Start-Process cloudflared -ArgumentList "--config `"$Data\cloudflared\config.yml`" tunnel run" -WindowStyle Hidden -RedirectStandardOutput "$Logs\tunnel.log" -RedirectStandardError "$Logs\tunnel.err.log"
        "Tunnel: permanent (see $Data\cloudflared\config.yml for the hostname)"
    } else {
        # http2 transport is more reliable than QUIC on home/mobile networks
        Start-Process cloudflared -ArgumentList "tunnel --url http://127.0.0.1:3000 --no-autoupdate --protocol http2" -WindowStyle Hidden -RedirectStandardOutput "$Logs\tunnel.log" -RedirectStandardError "$Logs\tunnel.err.log"
        # The link appears in the log after a few seconds (longer on slow internet).
        $url = $null
        for ($i = 0; $i -lt 30 -and -not $url; $i++) {
            Start-Sleep 2
            $url = (Select-String -Path "$Logs\tunnel.err.log" -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1).Matches.Value
        }
        if (-not $url) { $url = '(no link yet: see ' + "$Logs\tunnel.err.log" + ')' }
        "Tunnel: TEMPORARY link (changes on every restart; run setup-permanent-link.ps1 for a fixed one):`n        $url"
        Set-Content "$Data\current-link.txt" $url
    }
}
