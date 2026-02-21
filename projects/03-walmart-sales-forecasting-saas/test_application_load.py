#!/usr/bin/env python3
"""
Test application loading and fix common errors
"""

import requests
import json
import time
import sys

API_BASE = "http://localhost:8000"
FRONTEND_BASE = "http://localhost:5173"

def test_backend():
    """Test backend endpoints"""
    print("🔍 Testing Backend...")
    errors = []
    
    # Test health
    try:
        r = requests.get(f"{API_BASE}/health", timeout=5)
        if r.status_code == 200:
            print("  ✅ Health endpoint OK")
        else:
            errors.append(f"Health endpoint returned {r.status_code}")
    except Exception as e:
        errors.append(f"Health endpoint failed: {e}")
    
    # Test models
    try:
        r = requests.get(f"{API_BASE}/api/analysis/models", timeout=5)
        if r.status_code == 200:
            data = r.json()
            print(f"  ✅ Models endpoint OK ({len(data.get('models', []))} models)")
        else:
            errors.append(f"Models endpoint returned {r.status_code}")
    except Exception as e:
        errors.append(f"Models endpoint failed: {e}")
    
    # Test CORS
    try:
        r = requests.options(
            f"{API_BASE}/api/analysis/upload",
            headers={
                "Origin": FRONTEND_BASE,
                "Access-Control-Request-Method": "POST"
            },
            timeout=5
        )
        if "access-control-allow-origin" in str(r.headers).lower():
            print("  ✅ CORS configured correctly")
        else:
            errors.append("CORS headers missing")
    except Exception as e:
        errors.append(f"CORS test failed: {e}")
    
    return errors

def test_frontend():
    """Test frontend accessibility"""
    print("\n🔍 Testing Frontend...")
    errors = []
    
    try:
        r = requests.get(FRONTEND_BASE, timeout=5)
        if r.status_code == 200:
            if "root" in r.text.lower() or "react" in r.text.lower():
                print("  ✅ Frontend serves HTML")
            else:
                errors.append("Frontend HTML seems invalid")
        else:
            errors.append(f"Frontend returned {r.status_code}")
    except Exception as e:
        errors.append(f"Frontend not accessible: {e}")
    
    return errors

def test_api_connectivity():
    """Test API connectivity from frontend perspective"""
    print("\n🔍 Testing API Connectivity...")
    errors = []
    
    endpoints = [
        "/api/analysis/models",
        "/health",
        "/api/health/detailed"
    ]
    
    for endpoint in endpoints:
        try:
            r = requests.get(f"{API_BASE}{endpoint}", timeout=5)
            if r.status_code == 200:
                print(f"  ✅ {endpoint} accessible")
            else:
                errors.append(f"{endpoint} returned {r.status_code}")
        except Exception as e:
            errors.append(f"{endpoint} failed: {e}")
    
    return errors

def main():
    """Run all tests"""
    print("=" * 60)
    print("Application Load Test")
    print("=" * 60)
    
    all_errors = []
    
    # Wait for servers to be ready
    print("\n⏳ Waiting for servers to be ready...")
    time.sleep(2)
    
    all_errors.extend(test_backend())
    all_errors.extend(test_frontend())
    all_errors.extend(test_api_connectivity())
    
    print("\n" + "=" * 60)
    if not all_errors:
        print("✅ All tests passed! Application is ready.")
        print("\n🌐 Access the application:")
        print(f"   Frontend: {FRONTEND_BASE}")
        print(f"   Backend API: {API_BASE}")
        print(f"   API Docs: {API_BASE}/docs")
        return 0
    else:
        print(f"⚠️  Found {len(all_errors)} issues:")
        for error in all_errors:
            print(f"   - {error}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
