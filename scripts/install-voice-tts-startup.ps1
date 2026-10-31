$ErrorActionPreference = 'Stop'
$portfolioRoot = Split-Path $PSScriptRoot -Parent
$portfolioStarter = Join-Path $PSScriptRoot 'start-voice-tts.ps1'
$portfolioNode = (Get-Command node).Source
$portfolioPowerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$portfolioArguments = "-NoProfile -NonInteractive -ExecutionPolicy RemoteSigned -WindowStyle Hidden -File `"$portfolioStarter`" -Watch -NodeExecutable `"$portfolioNode`""
$portfolioTaskName = 'Portfolio-Zuri-TTS'
$portfolioDescription = 'Portfolio Zuri private Windows TTS; owned by F:/resume/app/scripts/install-voice-tts-startup.ps1'
$existingTask = Get-ScheduledTask -TaskName $portfolioTaskName -ErrorAction SilentlyContinue
if ($existingTask -and $existingTask.Description -ne $portfolioDescription) { throw 'Task name is occupied by an unrelated task.' }
try {
    $portfolioIdentity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    $portfolioAction = New-ScheduledTaskAction -Execute $portfolioPowerShell -Argument $portfolioArguments -WorkingDirectory $portfolioRoot
    $portfolioTrigger = New-ScheduledTaskTrigger -AtLogOn -User $portfolioIdentity
    $portfolioPrincipal = New-ScheduledTaskPrincipal -UserId $portfolioIdentity -LogonType Interactive -RunLevel Limited
    $portfolioSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable
    Register-ScheduledTask -TaskName $portfolioTaskName -Description $portfolioDescription -Action $portfolioAction -Trigger $portfolioTrigger -Principal $portfolioPrincipal -Settings $portfolioSettings -Force | Out-Null
    Write-Output 'Registered current-user logon task Portfolio-Zuri-TTS with bounded restart policy.'
} catch {
    # Current-user Startup fallback does not ask for elevation or change machine policy.
    $portfolioStartup = [Environment]::GetFolderPath('Startup')
    $portfolioLinkPath = Join-Path $portfolioStartup 'Portfolio Zuri TTS.lnk'
    $portfolioShell = New-Object -ComObject WScript.Shell
    $portfolioLink = $portfolioShell.CreateShortcut($portfolioLinkPath)
    if ((Test-Path -LiteralPath $portfolioLinkPath) -and $portfolioLink.Description -ne $portfolioDescription) { throw 'Startup name is occupied by an unrelated shortcut.' }
    $portfolioLink.TargetPath = $portfolioPowerShell
    $portfolioLink.Arguments = $portfolioArguments
    $portfolioLink.WorkingDirectory = $portfolioRoot
    $portfolioLink.WindowStyle = 7
    $portfolioLink.Description = $portfolioDescription
    $portfolioLink.Save()
    Write-Output 'Registered current-user Startup shortcut; Task Scheduler was unavailable. Shortcut does not provide a crash restart policy.'
}
