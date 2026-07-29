import json
import subprocess
import sys


json.load(sys.stdin)
checks = [
    subprocess.run(
        ["git", "diff", "--check"],
        check=False,
        capture_output=True,
        text=True,
        timeout=8,
    ),
    subprocess.run(
        ["git", "diff", "--cached", "--check"],
        check=False,
        capture_output=True,
        text=True,
        timeout=8,
    ),
]

if all(check.returncode == 0 for check in checks):
    raise SystemExit(0)

details = "\n".join(
    (check.stdout or check.stderr).strip()
    for check in checks
    if check.returncode != 0
)
print(
    json.dumps(
        {
            "continue": False,
            "stopReason": "Исправьте ошибки из git diff --check перед завершением.",
            "systemMessage": f"git diff --check не прошёл:\n{details[:1800]}",
        },
        ensure_ascii=False,
    )
)
