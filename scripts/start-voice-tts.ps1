param([switch]$Watch,[string]$NodeExecutable)
$ErrorActionPreference = 'Stop'
$portfolioRoot = Split-Path $PSScriptRoot -Parent
$portfolioNode = if ($NodeExecutable) { $NodeExecutable } else { (Get-Command node).Source }
if (-not (Test-Path -LiteralPath $portfolioNode)) { throw 'Configured Node executable is missing.' }
$portfolioEnv = Join-Path $portfolioRoot '.runtime\voice-worker\tts.env'
if (-not (Test-Path -LiteralPath $portfolioEnv)) { throw 'Run node scripts/configure-voice-worker.mjs first.' }
try {
    $existing = Invoke-RestMethod 'http://127.0.0.1:11436/health' -TimeoutSec 2
    if ($existing.service -eq 'zuri-windows-tts') { Write-Output 'Zuri TTS is already running.'; exit 0 }
    throw 'Port 11436 belongs to another service.'
} catch {
    if (Get-NetTCPConnection -LocalPort 11436 -State Listen -ErrorAction SilentlyContinue) { throw 'Port 11436 is occupied. No process was stopped.' }
}
$portfolioArgs = @('--env-file="' + $portfolioEnv + '"', '"' + (Join-Path $portfolioRoot 'server\voice\tts-host.mjs') + '"')
$portfolioEarlyFailures = 0
do {
    $portfolioStarted = Get-Date
    $portfolioProcess = Start-Process -FilePath $portfolioNode -ArgumentList $portfolioArgs -WorkingDirectory $portfolioRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $portfolioRoot '.runtime\voice-worker\tts-host.stdout.log') -RedirectStandardError (Join-Path $portfolioRoot '.runtime\voice-worker\tts-host.stderr.log')
    if (-not $Watch) { break }
    $portfolioProcess.WaitForExit()
    # Do not depend on cached ExitCode or Task Scheduler retry behavior.
    if (((Get-Date) - $portfolioStarted).TotalSeconds -ge 60) { $portfolioEarlyFailures = 0 }
    $portfolioEarlyFailures++
    if ($portfolioEarlyFailures -ge 3) { exit 1 }
    Start-Sleep -Seconds 2
} while ($Watch)
Write-Output 'Started private Zuri Windows TTS. Check /health before use.'
