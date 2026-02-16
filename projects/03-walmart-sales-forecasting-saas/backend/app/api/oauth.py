from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.services.oauth_service import oauth, get_oauth_user_info
from app.services.auth_service import create_access_token, get_or_create_oauth_user
from app.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/login/{provider}")
async def login_oauth(provider: str, request: Request):
    """
    Redirect to OAuth provider login page
    """
    if provider not in ['google', 'github']:
        raise HTTPException(status_code=404, detail="Provider not supported")
    
    # Construct callback URL
    # Ensure this matches what is registered in Google/GitHub console
    # Usually: http://localhost:8000/api/auth/callback/{provider}
    redirect_uri = request.url_for('auth_callback', provider=provider)
    
    # For local dev with https proxy issues, might need to force https or handle it
    # But starlette request.url_for usually handles scheme from request
    
    logger.info(f"Initiating {provider} login, redirecting to: {redirect_uri}")
    client = getattr(oauth, provider)
    return await client.authorize_redirect(request, redirect_uri)


@router.get("/callback/{provider}")
async def auth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    """
    Handle OAuth callback
    """
    if provider not in ['google', 'github']:
        raise HTTPException(status_code=404, detail="Provider not supported")
        
    client = getattr(oauth, provider)
    
    try:
        # Exchange code for token
        token = await client.authorize_access_token(request)
        
        # Get user info
        user_info = await get_oauth_user_info(provider, request, token)
        logger.info(f"OAuth success for {provider}: {user_info['email']}")
        
        # Create or update user in DB
        user = get_or_create_oauth_user(db, user_info)
        
        # Create JWT access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token
        # Using a query param or a temporary cookie, usually query param for simplicity in this stack
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)
        
    except Exception as e:
        logger.error(f"OAuth callback failed: {e}")
        # Redirect to frontend login with error
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=oauth_failed")
