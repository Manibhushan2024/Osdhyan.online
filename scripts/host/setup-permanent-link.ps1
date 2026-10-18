# One-time setup of a PERMANENT public link via a named Cloudflare tunnel.
#
# Requirements (you do these once, in a browser):
#   1. Your domain (osdhyan.online) must be on Cloudflare DNS (free plan is fine).
#   2. Run:  cloudflared tunnel login   -> opens the browser, pick the domain.
# Then run this script:
#   powershell -ExecutionPolicy Bypass -File scripts\host\setup-permanent-link.ps1 -Hostname app.osdhyan.online
param(
    [Parameter(Mandatory = $true)][string]$Hostname,
    [string]$TunnelName = 'osdhyan'
)
$Data = 'C:\dev\osdhyan-data'
$cert = "$env:USERPROFILE\.cloudflared\cert.pem"
if (-not (Test-Path $cert)) {
    Write-Error "Not logged in to Cloudflare. Run:  cloudflared tunnel login   (then re-run this script)"; exit 1
}
New-Item -ItemType Directory -Force "$Data\cloudflared" | Out-Null

$existing = cloudflared tunnel list -o json 2>$null | ConvertFrom-Json | Where-Object { $_.name -eq $TunnelName }
if (-not $existing) { cloudflared tunnel create $TunnelName | Out-Null }
$tunnel = cloudflared tunnel list -o json | ConvertFrom-Json | Where-Object { $_.name -eq $TunnelName }
$id = $tunnel.id
$cred = Get-ChildItem "$env:USERPROFILE\.cloudflared\$id.json" | Select-Object -First 1

@"
tunnel: $id
credentials-file: $($cred.FullName)
ingress:
  - hostname: $Hostname
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
  - service: http_status:404
"@ | Set-Content "$Data\cloudflared\config.yml" -Encoding ascii

cloudflared tunnel route dns $TunnelName $Hostname
"Permanent link ready: https://$Hostname"
"Now set in backend\.env:  APP_URL=https://$Hostname  and FRONTEND_URL=https://$Hostname"
"and in apps\portal\.env.local:  NEXT_PUBLIC_SITE_URL=https://$Hostname"
"Then run start-all.ps1 (it picks up config.yml automatically)."
