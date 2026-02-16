import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import get_password_hash

logger = logging.getLogger(__name__)

def init_default_user():
    """
    Initialize the database with a default user if none exists.
    This ensures the user can always log in after a system reset/deployment.
    """
    db = SessionLocal()
    try:
        # Check if ANY user exists (to avoid creating admin if users already exist)
        # or specifically check for the admin user. 
        # Checking specifically for admin is safer for "recovery" mode.
        user = db.query(User).filter(User.email == "admin@forecast.ai").first()
        
        if not user:
            logger.info("👤 No admin user found. Creating default admin...")
            try:
                # Create user with explicit password hashing
                # Note: The User model might handle hashing in __init__ or we do it here
                # consistently with auth_service.register logic
                password_hash = get_password_hash("admin123")
                
                admin_user = User(
                    email="admin@forecast.ai",
                    password_hash=password_hash,
                    full_name="System Admin",
                    role="admin",
                    is_active=True
                )
                db.add(admin_user)
                db.commit()
                logger.info("✅ Default user created: admin@forecast.ai / admin123")
            except Exception as inner_e:
                logger.error(f"Failed to insert admin user: {inner_e}")
                db.rollback()
        else:
            logger.info("✅ Default admin user already exists.")
            
    except Exception as e:
        logger.error(f"❌ Failed to initialize default user: {e}")
    finally:
        db.close()
