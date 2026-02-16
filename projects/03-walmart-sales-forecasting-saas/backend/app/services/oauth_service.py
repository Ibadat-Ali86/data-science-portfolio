from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.requests import Request
from fastapi import HTTPException
from app.config import settings

# Initialize OAuth
# We use settings from config, but fallback to env vars if needed/configured in settings
config_data = {
    'GOOGLE_CLIENT_ID': settings.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': settings.GOOGLE_CLIENT_SECRET,
    'GITHUB_CLIENT_ID': settings.GITHUB_CLIENT_ID,
    'GITHUB_CLIENT_SECRET': settings.GITHUB_CLIENT_SECRET,
}

# Starlette Config object expecting env vars or a dict
starlette_config = Config(environ=config_data)
oauth = OAuth(starlette_config)

# Register Google
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Register GitHub
oauth.register(
    name='github',
    api_base_url='https://api.github.com/',
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    client_kwargs={'scope': 'user:email'},
    userinfo_endpoint='https://api.github.com/user',
)

async def get_oauth_user_info(provider: str, request: Request, token: dict):
    """
    Extract standardized user info from different providers
    """
    if provider == 'google':
        # Google user info is available in id_token usually, or userinfo endpoint
        # Authlib's authorize_access_token parses id_token if present for openid
        user_data = token.get('userinfo')
        if not user_data:
            # Fallback if not automatically parsed
            resp = await oauth.google.get('https://www.googleapis.com/oauth2/v3/userinfo', token=token)
            user_data = resp.json()
            
        return {
            'email': user_data.get('email'),
            'name': user_data.get('name'),
            'picture': user_data.get('picture'),
            'provider_id': user_data.get('sub')
        }
        
    elif provider == 'github':
        # GitHub requires separate call for user profile and validation
        resp = await oauth.github.get('user', token=token)
        profile = resp.json()
        
        # Get email (might be private)
        email = profile.get('email')
        if not email:
            resp_emails = await oauth.github.get('user/emails', token=token)
            emails = resp_emails.json()
            # Get primary verified email
            for e in emails:
                if e.get('primary') and e.get('verified'):
                    email = e.get('email')
                    break
        
        return {
            'email': email,
            'name': profile.get('name') or profile.get('login'),
            'picture': profile.get('avatar_url'),
            'provider_id': str(profile.get('id'))
        }
    
    raise ValueError(f"Unsupported provider: {provider}")
