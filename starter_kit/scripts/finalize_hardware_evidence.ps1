$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$python = Join-Path $root ".venv\Scripts\python.exe"
$origin = Join-Path $root "starter_kit\evidence\files\originq-hardware-metadata.json"
$braket = Join-Path $root "starter_kit\evidence\files\braket-hardware-metadata.json"
if (-not (Test-Path -LiteralPath $origin) -or -not (Test-Path -LiteralPath $braket)) {
    throw "Both genuine OriginQ and Braket metadata files are required."
}
$env:PYTHONUTF8 = "1"
Push-Location $root
try {
    & $python -m starter_kit.hardware.validate_evidence $origin $braket
    if ($LASTEXITCODE -ne 0) { throw "Hardware evidence validation failed" }
    & $python -m starter_kit.hardware.finalize_evidence $origin $braket
    if ($LASTEXITCODE -ne 0) { throw "Hardware evidence finalization failed" }
} finally { Pop-Location }
