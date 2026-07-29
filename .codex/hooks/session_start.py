import json
import subprocess
import sys
from pathlib import Path


def run(*args: str) -> str:
    result = subprocess.run(
        args,
        check=False,
        capture_output=True,
        text=True,
        timeout=3,
    )
    return result.stdout.strip()


payload = json.load(sys.stdin)
root = Path(run("git", "rev-parse", "--show-toplevel") or payload["cwd"])
branch = run("git", "branch", "--show-current") or "detached HEAD"
status = run("git", "status", "--short")
changed = len(status.splitlines()) if status else 0

context = (
    f"Mira workspace: {root}. Branch: {branch}. "
    f"Working tree changes: {changed}. "
    "Read AGENTS.md and docs/PROJECT_MAP.md before edits. "
    "For a new product idea, use $mira-feature-flow. "
    "Preserve unrelated uncommitted changes."
)

print(
    json.dumps(
        {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": context,
            }
        },
        ensure_ascii=False,
    )
)
