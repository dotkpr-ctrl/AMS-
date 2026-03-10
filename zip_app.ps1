$source = Join-Path (Get-Location) "dist\ AMS-Server-win32-x64"
$dest = Join-Path (Get-Location) "ams_app.zip"
Write-Host "Zipping from $source to $dest"
Compress-Archive -Path "$source\*" -DestinationPath $dest -Force
