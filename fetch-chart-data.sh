#!/bin/bash
# Run this locally to fetch Meta Ads + AppsFlyer data into data/ folder.
# Usage: bash fetch-chart-data.sh

set -e
DIR="$(cd "$(dirname "$0")" && pwd)/data"
mkdir -p "$DIR"

# ── Config ──
META_ACCESS_TOKEN="EAAMFJ4efZBA4BQhaXKpZClERlEKe9D3AfKscXDIeVuNfAC7lCVXm00jBsLornvKTQTDcqSZBSWT8ufdhjaeqZBdAa5F6q7TSVGFwAjtJW5pt7wE1SZCYWayZBGsAmsLPe5KqTpXyg3MBvvOtXE6sTNzEgRR1jSNZCPAM0ZCtwiRYjnO3uN7azO7UZCQhW91kkBwZDZD"
META_AD_ACCOUNT_ID="act_2045754205850315"

APPSFLYER_API_TOKEN="eyJhbGciOiJBMjU2S1ciLCJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwidHlwIjoiSldUIiwiemlwIjoiREVGIn0.vmZysoZFTxaeZWQfil-QydbdypHOEj9CRaG8u0fXlorTPQT86vYewg.iZs3q_aecRPcu4Wj.WqJnq-ulCXk8kTPcNwtyp4K2ED73nL06vLshTxdCoo-2FZXQxRCxLKnhCuCaCll8YLAEC9fgxe_QwDwrYzh7gqKy2s9WLq9o0dMbhTfq6nzIRBtEn7zf0J97TPYjqQVmNixasaekaM41E1ZFr1_t0PbxTQDTokjdWfqQr5DU2d1zywMukn_oT_NYc97tcGzTZVrSDXZtNhVd__jrNExips_-Qvv3RV_YdOQDuAdXLyKI0px1hrP1JkZya2wQ1JvJKPj8_yNTeowcQ8YqDNPxwND4uI5jsLqizDyKdSsAJpOlLQTXJj8-b3FGpX8uNRlznMlCOdcZysSnuO6d1V9pYzKrIqmS.a4L4sUi6P1MyOjOr_R9JuQ"
APPSFLYER_APP_ID="id6451213618"

FROM_DATE="2026-01-01"
TO_DATE=$(date +%Y-%m-%d)

echo "Fetching Meta Ads daily insights..."

# Fetch Meta Ads — daily spend, clicks, impressions
META_RAW=$(curl -s "https://graph.facebook.com/v21.0/${META_AD_ACCOUNT_ID}/insights?\
fields=spend,clicks,impressions,cpc,actions&\
time_increment=1&\
time_range={\"since\":\"${FROM_DATE}\",\"until\":\"${TO_DATE}\"}&\
level=account&\
limit=500&\
access_token=${META_ACCESS_TOKEN}")

# Check for errors
if echo "$META_RAW" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if 'data' in d else 1)" 2>/dev/null; then
  # Transform into our format
  python3 -c "
import json, sys
from datetime import datetime

raw = json.loads('''${META_RAW}''')
daily = []
for row in raw.get('data', []):
    daily.append({
        'date': row['date_start'],
        'spend': float(row.get('spend', 0)),
        'clicks': int(row.get('clicks', 0)),
        'impressions': int(row.get('impressions', 0)),
        'cpc': float(row.get('cpc', 0))
    })
daily.sort(key=lambda x: x['date'])

# Also fetch ad-level breakdown
result = {
    'updated_at': datetime.utcnow().isoformat() + 'Z',
    'period': {'start': '${FROM_DATE}', 'end': '${TO_DATE}'},
    'daily': daily,
    'ads': []
}
print(json.dumps(result, indent=2))
" > "$DIR/meta-ads-stats.json"
  echo "✓ Saved data/meta-ads-stats.json ($(echo "$META_RAW" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" ) days)"
else
  echo "✗ Meta Ads API error:"
  echo "$META_RAW" | python3 -m json.tool 2>/dev/null || echo "$META_RAW"
fi

echo ""
echo "Fetching AppsFlyer installs..."

# Fetch AppsFlyer — aggregate daily installs
AF_RAW=$(curl -s "https://hq.appsflyer.com/api/agg-data/export/app/${APPSFLYER_APP_ID}/installs_report/v5?\
from=${FROM_DATE}&to=${TO_DATE}&\
timezone=America/New_York&\
groupings=date&\
kpis=installs,loyal_users" \
  -H "Authorization: Bearer ${APPSFLYER_API_TOKEN}" \
  -H "accept: text/csv")

if echo "$AF_RAW" | head -1 | grep -qi "date"; then
  python3 -c "
import csv, json, io, sys
from datetime import datetime

reader = csv.DictReader(io.StringIO('''${AF_RAW}'''))
daily = []
by_source = {}
for row in reader:
    date_val = row.get('Date','') or row.get('date','')
    installs = int(row.get('Installs','0') or row.get('installs','0') or 0)
    daily.append({'date': date_val, 'installs': installs})
    source = row.get('Media Source','') or 'unknown'
    by_source[source] = by_source.get(source, 0) + installs

daily.sort(key=lambda x: x['date'])

result = {
    'updated_at': datetime.utcnow().isoformat() + 'Z',
    'period': {'start': '${FROM_DATE}', 'end': '${TO_DATE}'},
    'daily': daily,
    'bySource': [{'source': k, 'installs': v} for k,v in sorted(by_source.items(), key=lambda x: -x[1])]
}
print(json.dumps(result, indent=2))
" > "$DIR/appsflyer-stats.json"
  echo "✓ Saved data/appsflyer-stats.json ($(echo "$AF_RAW" | tail -n +2 | wc -l | tr -d ' ') days)"
else
  echo "✗ AppsFlyer API error:"
  echo "$AF_RAW" | head -20
fi

echo ""
echo "Done! Commit & push the new files in data/ to see them on the dashboard."
