"""
GA4 + Search Console configuration for itzam.ai, as code. Idempotent.

    python scripts/google_setup.py            # dry run: show what would change
    python scripts/google_setup.py --apply    # make the changes

Needs:  pip install google-auth requests
Auth:   Application Default Credentials with EDIT scopes — the "Google login"
        command in docs/analytics-and-seo.md (one login covers reports, this
        script and scripts/apps_script_deploy.py).

What it does (see docs/analytics-and-seo.md for the why):
  GA4
    • key event  generate_lead             (every lead: contact form + assessment)
    • removes the unused placeholder key events (qualify_lead, close_convert_lead)
    • custom dimensions (event scope): lead_type, form_location, cta_target, assessment_band
    • event data retention → 14 months (default is 2, which breaks YoY reports)
  Search Console
    • (re)submits https://itzam.ai/sitemap.xml
Things with no API (do them in the UI — listed at the end of the run):
  internal-traffic data filter → Active, unwanted referrals, Request Indexing.
"""
import sys
from urllib.parse import quote

import google.auth
from google.auth.transport.requests import AuthorizedSession

MEASUREMENT_ID = "G-JVXTVD9NXY"
SITE = "sc-domain:itzam.ai"
SITEMAP = "https://itzam.ai/sitemap.xml"
ADMIN = "https://analyticsadmin.googleapis.com/v1beta"

KEY_EVENTS = ["generate_lead"]
REMOVE_KEY_EVENTS = ["qualify_lead", "close_convert_lead"]
CUSTOM_DIMENSIONS = [
    ("lead_type", "Lead type", "contact | assessment"),
    ("form_location", "Form location", "Site area where a lead/CTA happened (home, contact, assessment…)"),
    ("cta_target", "CTA target", "Which page a CTA click pointed to (assessment | contact)"),
    ("assessment_band", "Assessment band", "manual | in_motion | building | ai_ready"),
]

APPLY = "--apply" in sys.argv


def main():
    creds, _ = google.auth.default(scopes=[
        "https://www.googleapis.com/auth/analytics.edit",
        "https://www.googleapis.com/auth/webmasters",
    ])
    s = AuthorizedSession(creds)

    def call(method, url, **kw):
        r = s.request(method, url, **kw)
        if r.status_code >= 400:
            raise SystemExit(f"{method} {url} → {r.status_code}\n{r.text[:600]}")
        return r.json() if r.text else {}

    def act(desc, fn):
        print(("  APPLY  " if APPLY else "  PLAN   ") + desc)
        if APPLY:
            fn()

    # ── locate the GA4 property by measurement ID ──
    prop = None
    for acct in call("GET", f"{ADMIN}/accountSummaries?pageSize=200").get("accountSummaries", []):
        for p in acct.get("propertySummaries", []):
            for st in call("GET", f"{ADMIN}/{p['property']}/dataStreams").get("dataStreams", []):
                if st.get("webStreamData", {}).get("measurementId") == MEASUREMENT_ID:
                    prop = p["property"]
    if not prop:
        raise SystemExit(f"No GA4 property with stream {MEASUREMENT_ID} visible to this account.")
    print(f"GA4 property {prop}")

    # ── key events ──
    existing = {k["eventName"]: k for k in call("GET", f"{ADMIN}/{prop}/keyEvents").get("keyEvents", [])}
    for name in KEY_EVENTS:
        if name in existing:
            print(f"  ok     key event {name}")
        else:
            act(f"create key event {name}", lambda n=name: call(
                "POST", f"{ADMIN}/{prop}/keyEvents", json={"eventName": n, "countingMethod": "ONCE_PER_EVENT"}))
    for name in REMOVE_KEY_EVENTS:
        k = existing.get(name)
        if k and k.get("deletable"):
            act(f"delete placeholder key event {name}", lambda k=k: call("DELETE", f"{ADMIN}/{k['name']}"))

    # ── custom dimensions ──
    dims = {d["parameterName"] for d in call("GET", f"{ADMIN}/{prop}/customDimensions?pageSize=200").get("customDimensions", [])}
    for param, display, desc in CUSTOM_DIMENSIONS:
        if param in dims:
            print(f"  ok     custom dimension {param}")
        else:
            act(f"create custom dimension {param}", lambda p=param, d=display, x=desc: call(
                "POST", f"{ADMIN}/{prop}/customDimensions",
                json={"parameterName": p, "displayName": d, "description": x, "scope": "EVENT"}))

    # ── data retention ──
    ret = call("GET", f"{ADMIN}/{prop}/dataRetentionSettings")
    if ret.get("eventDataRetention") == "FOURTEEN_MONTHS":
        print("  ok     data retention 14 months")
    else:
        act(f"set event data retention {ret.get('eventDataRetention')} → FOURTEEN_MONTHS", lambda: call(
            "PATCH", f"{ADMIN}/{ret['name']}?updateMask=eventDataRetention",
            json={"eventDataRetention": "FOURTEEN_MONTHS"}))

    # ── Search Console sitemap ──
    act(f"submit sitemap {SITEMAP}", lambda: call(
        "PUT", f"https://www.googleapis.com/webmasters/v3/sites/{quote(SITE, safe='')}/sitemaps/{quote(SITEMAP, safe='')}"))

    print("""
Manual steps (no API):
  1. GA4 → Admin → Data collection → Data filters → "Internal Traffic" → set to ACTIVE.
     (The site tags team browsers with traffic_type=internal.)
  2. GA4 → Admin → Data streams → web → Configure tag settings → List unwanted referrals:
     vercel.com, accounts.google.com, app.itzam.ai
  3. Search Console → URL inspection → Request indexing for:
     https://itzam.ai/en/services  https://itzam.ai/es/services
     https://itzam.ai/es           https://itzam.ai/es/about
""")
    if not APPLY:
        print("Dry run — re-run with --apply to make the changes above.")


if __name__ == "__main__":
    main()
