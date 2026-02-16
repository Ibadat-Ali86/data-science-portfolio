
import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/auth"

def test_auth():
    email = "test_user_robust@example.com"
    password = "SecurePassword123!"
    full_name = "Test User"

    print(f"1. Attempting Registration for {email}...")
    reg_response = requests.post(f"{BASE_URL}/register", json={
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": "analyst",
        "confirm_password": password 
    })
    
    # Handle if user already exists
    if reg_response.status_code == 400 and "already registered" in reg_response.text:
        print("   User already exists, proceeding to login.")
    elif reg_response.status_code == 200:
        print("   Registration Successful:", reg_response.json())
    else:
        print(f"   Registration Failed: {reg_response.status_code} {reg_response.text}")
        return

    print(f"\n2. Attempting Login for {email}...")
    login_data = {
        "username": email,
        "password": password
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/login", data=login_data)
        
        if login_response.status_code == 200:
            print("   Login Successful!")
            print("   Token:", login_response.json().get("access_token")[:20] + "...")
        else:
            print(f"   Login Failed: {login_response.status_code} {login_response.text}")
    except Exception as e:
        print(f"   Login Exception: {e}")

if __name__ == "__main__":
    try:
        test_auth()
    except Exception as e:
        print(f"Script failed: {e}")
