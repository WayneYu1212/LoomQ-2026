# Final human checklist — genuine QPU evidence

Never paste tokens or AWS credentials into chat. Keep them only in your local environment/standard credential store. Run commands from the fork root in Windows PowerShell.

## Origin Quantum

1. Log in or register at Origin Quantum Cloud, complete any identity/terms step, and activate real-chip quota.
2. Obtain the personal cloud Token. Keep it local.
3. Set it for the current PowerShell session:

```powershell
$env:LOOMQ_ORIGINQ_TOKEN = "<YOUR_TOKEN>"
$env:LOOMQ_ORIGINQ_CHIP_ID = "72"
$env:LOOMQ_ORIGINQ_DEVICE_NAME = "Origin Wukong / chip 72"
```

4. Diagnose:

```powershell
.\.venv\Scripts\python.exe -m starter_kit.hardware.originq_real --doctor
.\.venv\Scripts\python.exe -m starter_kit.hardware.originq_real --dry-run --shots 100
```

5. Submit one genuine Bell job:

```powershell
.\starter_kit\scripts\run_originq_hardware.ps1 -Shots 100
```

6. Success prints a non-local `task_id` and writes `originq-hardware-{bell,result,metadata}*` files under `starter_kit/evidence/files/`.
7. Common failures: invalid/expired Token, no real-chip quota, chip unavailable, insufficient balance, task queue timeout. Resolve in the Origin console; do not edit result JSON manually.

## AWS Braket

1. Log in to AWS, enable Braket, accept terms, configure billing/spending controls, create an S3 results bucket, and grant Braket/S3 permissions.
2. Configure AWS credentials locally using the standard AWS credential chain (AWS CLI/profile/SSO). Do not put access keys in this repo.
3. Set non-secret task configuration:

```powershell
$env:AWS_REGION = "us-west-1"
$env:LOOMQ_BRAKET_S3_BUCKET = "<YOUR_S3_BUCKET>"
$env:LOOMQ_BRAKET_S3_PREFIX = "loomq-2026-hardware"
# Optional: choose a gate-based QPU ARN; otherwise doctor auto-discovers an online candidate.
$env:LOOMQ_BRAKET_DEVICE_ARN = "<QPU_DEVICE_ARN>"
```

4. Diagnose and dry-run:

```powershell
.\.venv\Scripts\python.exe -m starter_kit.hardware.braket_qpu --doctor
.\.venv\Scripts\python.exe -m starter_kit.hardware.braket_qpu --dry-run --shots 100 --max-estimated-usd <YOUR_CAP>
```

5. After reviewing the device, region, shots, availability and current AWS pricing, explicitly approve the paid task:

```powershell
.\starter_kit\scripts\run_braket_hardware.ps1 -MaxEstimatedUsd <YOUR_CAP> -Shots 100
```

6. Success prints a full `arn:aws:braket:...:quantum-task/...` and writes `braket-hardware-*` evidence files.
7. Common failures: missing credentials, Braket permission denied, S3 access denied, device offline, region mismatch, billing/spending limit, queue timeout.

## Finalize two genuine platforms

```powershell
.\starter_kit\scripts\finalize_hardware_evidence.ps1
.\starter_kit\scripts\verify.ps1
git diff --check
git status --short
```

Review the generated L1 hardware section. Confirm both task IDs in the provider consoles, then commit only the genuine evidence files and updated README:

```powershell
git add -- starter_kit/evidence/README.md starter_kit/evidence/files/originq-hardware-* starter_kit/evidence/files/braket-hardware-*
git commit -m "evidence: add two-platform genuine QPU results"
git push origin max-score/final-112
.\.venv\Scripts\python.exe starter_kit\prepare_submission.py --team-id WayneYu1212
git rev-parse HEAD
git ls-remote origin max-score/final-112
```

Create a **new** upstream Final Submission Issue—never edit #52. Select L1/L2/L3 and set Hardware evidence to `starter_kit/evidence/README.md`. Completion requires `submission:accepted`; verify the receipt commit equals local/remote HEAD and record archive SHA-256 plus Artifact ID. Download the Artifact and independently hash `loomq-submission.tar.gz` when possible.
