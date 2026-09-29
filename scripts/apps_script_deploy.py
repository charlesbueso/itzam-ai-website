"""
Publish apps-script/*.gs to the live Google Sheets webhooks via the Apps Script API.

    python scripts/apps_script_deploy.py --contact <SCRIPT_ID> --assessment <SCRIPT_ID>            # dry run: backup + diff
    python scripts/apps_script_deploy.py --contact <SCRIPT_ID> --assessment <SCRIPT_ID> --apply    # publish

For each script it:
  1. downloads the live project (backup saved to your temp dir) and diffs it
     against the repo file,
  2. (--apply) uploads the repo code (the manifest `appsscript.json` is kept
     as-is), creates a new version, and points the EXISTING web-app deployment
     at it — same /exec URL, so nothing changes in Vercel.

Script ID: open the Sheet → Extensions → Apps Script → ⚙ Project Settings → "Script ID".

Needs:  pip install google-auth requests
Auth:   ADC with script.projects + script.deployments scopes (see docs/analytics-and-seo.md,
        "Google login"), and the Apps Script API switched ON for your account at
        https://script.google.com/home/usersettings
The account must have edit access to both script projects.
"""
import argparse
import difflib
import json
import re
import tempfile
import time
from pathlib import Path

import google.auth
from google.auth.transport.requests import AuthorizedSession

REPO = Path(__file__).resolve().parent.parent
API = "https://script.googleapis.com/v1"
TARGETS = {
    # flag → (repo file, env var holding the deployed /exec URL)
    "contact": ("apps-script/contact-webhook.gs", "GOOGLE_SHEETS_WEBHOOK_URL"),
    "assessment": ("apps-script/assessment-webhook.gs", "GOOGLE_SHEETS_ASSESSMENT_WEBHOOK_URL"),
}


def env_deployment_id(var: str) -> str | None:
    """Deployment id from the webhook URL in .env.local (…/macros/s/<id>/exec). Never printed in full."""
    try:
        for line in (REPO / ".env.local").read_text(encoding="utf-8").splitlines():
            if line.startswith(var + "="):
                m = re.search(r"/macros/s/([^/]+)/exec", line)
                return m.group(1) if m else None
    except FileNotFoundError:
        pass
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--contact", help="Script ID of the contact-leads sheet's Apps Script")
    ap.add_argument("--assessment", help="Script ID of the assessment sheet's Apps Script")
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    creds, _ = google.auth.default(scopes=[
        "https://www.googleapis.com/auth/script.projects",
        "https://www.googleapis.com/auth/script.deployments",
    ])
    s = AuthorizedSession(creds)

    def call(method, url, **kw):
        r = s.request(method, url, **kw)
        if r.status_code >= 400:
            hint = ""
            if "has not been used" in r.text or "SERVICE_DISABLED" in r.text:
                hint = "\n→ Enable it: gcloud services enable script.googleapis.com --project itzam-reports"
            elif "User has not enabled the Apps Script API" in r.text:
                hint = "\n→ Turn on the Apps Script API at https://script.google.com/home/usersettings"
            raise SystemExit(f"{method} {url} → {r.status_code}\n{r.text[:500]}{hint}")
        return r.json() if r.text else {}

    stamp = time.strftime("%Y%m%d-%H%M%S")
    for key, (rel, env_var) in TARGETS.items():
        script_id = getattr(args, key)
        if not script_id:
            continue
        print(f"\n━━ {key}  ({rel})")
        content = call("GET", f"{API}/projects/{script_id}/content")
        files = content.get("files", [])
        backup = Path(tempfile.gettempdir()) / f"itzam-{key}-apps-script-{stamp}.json"
        backup.write_text(json.dumps(content, indent=1), encoding="utf-8")
        print(f"backup of live code → {backup}")

        code_files = [f for f in files if f["type"] == "SERVER_JS"]
        if len(code_files) != 1:
            raise SystemExit(f"Expected 1 .gs file, found {[f['name'] for f in code_files]} — merge by hand.")
        live = code_files[0]
        new_src = (REPO / rel).read_text(encoding="utf-8")
        diff = list(difflib.unified_diff(live["source"].splitlines(), new_src.splitlines(),
                                         f"live/{live['name']}.gs", rel, lineterm="", n=1))
        if not diff:
            print("live code already matches the repo.")
        else:
            added = sum(1 for d in diff if d.startswith("+") and not d.startswith("+++"))
            removed = sum(1 for d in diff if d.startswith("-") and not d.startswith("---"))
            print(f"diff: +{added} / -{removed} lines")
            print("\n".join(diff[:60]) + ("\n…" if len(diff) > 60 else ""))

        deps = call("GET", f"{API}/projects/{script_id}/deployments").get("deployments", [])
        webapps = [d for d in deps
                   if d.get("deploymentConfig", {}).get("versionNumber")
                   and any(e.get("entryPointType") == "WEB_APP" for e in d.get("entryPoints", []))]
        target = None
        env_id = env_deployment_id(env_var)
        if env_id:
            target = next((d for d in webapps if d["deploymentId"] == env_id), None)
        if not target and len(webapps) == 1:
            target = webapps[0]
        if not target:
            raise SystemExit(f"Can't tell which web-app deployment {env_var} uses "
                             f"({len(webapps)} candidates) — check the script ID.")
        cfg = target["deploymentConfig"]
        print(f"web-app deployment …{target['deploymentId'][-8:]} at version {cfg.get('versionNumber')}"
              f"{' (matches ' + env_var + ')' if env_id == target['deploymentId'] else ''}")

        if not args.apply:
            continue
        live["source"] = new_src
        call("PUT", f"{API}/projects/{script_id}/content", json={"files": files})
        ver = call("POST", f"{API}/projects/{script_id}/versions",
                   json={"description": f"itzam.ai repo {rel} ({stamp})"})
        call("PUT", f"{API}/projects/{script_id}/deployments/{target['deploymentId']}",
             json={"deploymentConfig": {"scriptId": script_id, "versionNumber": ver["versionNumber"],
                                        "manifestFileName": cfg.get("manifestFileName", "appsscript"),
                                        "description": f"repo {stamp}"}})
        print(f"PUBLISHED: version {ver['versionNumber']} is live on the same /exec URL.")

    if not args.apply:
        print("\nDry run — re-run with --apply to publish.")


if __name__ == "__main__":
    main()
