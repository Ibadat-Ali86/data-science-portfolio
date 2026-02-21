
import requests

BASE_URL = "http://127.0.0.1:8000/api/auth"

def test_frontend_login_simulation():
    email = "test_user_robust@example.com"
    password = "SecurePassword123!"

    print(f"Testing Login for {email} using application/x-www-form-urlencoded...")
    
    # Simulate exactly what URLSearchParams does: form-encoded data
    login_data = {
        "username": email,
        "password": password
    }
    
    try:
        # requests.post with 'data=' uses application/x-www-form-urlencoded by default
        login_response = requests.post(f"{BASE_URL}/login", data=login_data)
        
        if login_response.status_code == 200:
            print("✅ Login Successful!")
            print("   Token:", login_response.json().get("access_token")[:20] + "...")
            return True
        else:
            print(f"❌ Login Failed: {login_response.status_code} {login_response.text}")
            return False
    except Exception as e:
        print(f"❌ Login Exception: {e}")
        return False

if __name__ == "__main__":
    test_frontend_login_simulation()
