
import requests
import json
import sys

base_url = 'http://localhost:8000/api/analysis'

try:
    # 1. Upload
    print('Uploading marketing_data_full.csv...')
    with open('marketing_data_full.csv', 'rb') as f:
        files = {'file': f}
        res = requests.post(f'{base_url}/upload', files=files)
        if res.status_code != 200:
            print(f'Upload failed: {res.text}')
            sys.exit(1)
        data = res.json()
        session_id = data['session_id']
        print(f'Session ID: {session_id}')

    # 2. Profile
    print('Profiling...')
    profile_res = requests.post(f'{base_url}/profile/{session_id}', json={'target_col': 'conversions', 'date_col': 'campaign_date'})
    if profile_res.status_code != 200:
        print(f'Profile failed: {profile_res.text}')
        sys.exit(1)

    profile = profile_res.json()
    print(f"DEBUG: Profile Keys: {profile.keys()}")
    domain_analysis = profile.get('domain_analysis', {})
    print(f"DEBUG: Domain Analysis Keys: {domain_analysis.keys()}")
    kpis = domain_analysis.get('domain_kpis', [])

    print(f'Detected Domain: {domain_analysis.get("detected_domain")}')
    print(f'Confidence: {domain_analysis.get("confidence")}')
    
    if not kpis:
        print("NO KPIS FOUND!")
        print(f"DEBUG: domain_analysis content: {json.dumps(domain_analysis, indent=2)}")
        sys.exit(1)
        
    print(f'KPIs Found: {len(kpis)}')
    for kpi in kpis:
        print(f' - {kpi["label"]}: {kpi["value"]} ({kpi["trend"]})')
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
