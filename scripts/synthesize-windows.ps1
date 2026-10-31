$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
$request = [Console]::In.ReadToEnd() | ConvertFrom-Json
if ($request.language -notin @('th','en') -or [string]::IsNullOrWhiteSpace($request.text) -or $request.text.Length -gt 800) { exit 2 }
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$stream = New-Object System.IO.MemoryStream
try {
    $voiceName = if ($request.language -eq 'th') { 'Microsoft Pattara' } else { 'Microsoft Zira Desktop' }
    $synth.SelectVoice($voiceName)
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(24000,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
    $synth.SetOutputToAudioStream($stream,$format)
    $synth.Speak([string]$request.text)
    $synth.SetOutputToNull()
    $bytes = $stream.ToArray()
    [Console]::OpenStandardOutput().Write($bytes,0,$bytes.Length)
} finally { $synth.Dispose(); $stream.Dispose() }
