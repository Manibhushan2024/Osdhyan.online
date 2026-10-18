# Makes the host start automatically when you log in to Windows (no admin needed):
# adds a shortcut to start-all.ps1 in your Startup folder. Remove the shortcut to undo.
$startup  = [Environment]::GetFolderPath('Startup')
$shortcut = Join-Path $startup 'OSDHYAN Host.lnk'
$ws = New-Object -ComObject WScript.Shell
$lnk = $ws.CreateShortcut($shortcut)
$lnk.TargetPath = 'powershell.exe'
$lnk.Arguments  = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\dev\test-series-platform\scripts\host\start-all.ps1"'
$lnk.WorkingDirectory = 'C:\dev\test-series-platform'
$lnk.Save()
"Installed: $shortcut"
"Also recommended: Settings > System > Power > Screen & sleep -> set 'Sleep' to Never while plugged in."
