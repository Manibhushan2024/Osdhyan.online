# Deploy the current commit from this laptop to the OSDHYAN Google Cloud server.
#   powershell -ExecutionPolicy Bypass -File deploy\scripts\push-to-gcp.ps1
# Commit first: only committed files are sent (git archive HEAD). The server's
# deploy/.env, backups and data are never touched. A backup runs before the
# rebuild, and the site stays up while the new images build.
param(
    [string]$Project = 'osdhyan-live',
    [string]$Zone    = 'asia-south1-a',
    [string]$Vm      = 'osdhyan-server',
    [string]$Dir     = '/home/dell/osdhyan'
)
$ErrorActionPreference = 'Stop'
$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$dirty = git -C $Root status --porcelain -- backend apps/portal deploy package.json package-lock.json
if ($dirty) { Write-Warning "Uncommitted changes are NOT sent:`n$dirty" }

$archive = Join-Path $env:TEMP 'osdhyan-code.tar.gz'
git -C $Root archive --format=tar.gz -o $archive HEAD
"== Sending commit $(git -C $Root log --oneline -1)"
gcloud compute scp $archive "${Vm}:/home/dell/osdhyan-code.tar.gz" --project=$Project --zone=$Zone --quiet
if ($LASTEXITCODE -ne 0) { throw 'upload failed' }

$remote = @"
set -e
tar -xzf /home/dell/osdhyan-code.tar.gz -C $Dir
cd $Dir/deploy
docker compose exec -T backup /bin/sh /backup-loop.sh now || true
docker compose build
docker compose up -d
docker image prune -f >/dev/null
for i in `$(seq 1 40); do docker compose exec -T backend curl -fsS http://127.0.0.1:10000/api/health >/dev/null 2>&1 && break; sleep 3; done
docker compose ps --format 'table {{.Service}}\t{{.Status}}'
"@ -replace "`r", ''
gcloud compute ssh $Vm --project=$Project --zone=$Zone --quiet --command=$remote
if ($LASTEXITCODE -ne 0) { throw 'remote deploy failed' }
"== Done. Check https://8-234-95-50.sslip.io/api/health"
