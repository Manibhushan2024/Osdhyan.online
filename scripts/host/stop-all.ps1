# Stops the OSDHYAN laptop host (keeps PostgreSQL and Redis data intact).
$Data  = 'C:\dev\osdhyan-data'
$PgBin = 'C:\Program Files\PostgreSQL\16\bin'

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process node -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -match 'standalone' } | Stop-Process -Force
Get-Process php -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -match 'queue:work|schedule:work' } | Stop-Process -Force
Get-Process httpd -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path "$Data\pgdata\postmaster.pid") { & "$PgBin\pg_ctl.exe" -D "$Data\pgdata" -m fast stop }
"Stopped. (Redis service left running.)"
