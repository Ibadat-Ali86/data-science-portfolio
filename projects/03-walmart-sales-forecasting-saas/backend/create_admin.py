
from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_admin():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@forecast.ai").first()
        if not user:
            logger.info("Creating admin user...")
            admin_user = User(
                email="admin@forecast.ai",
                password_hash=get_password_hash("admin123"),
                full_name="System Admin",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("✅ Admin user created successfully.")
        else:
            logger.info("ℹ️ Admin user already exists.")
            # Reset password just in case
            user.password_hash = get_password_hash("admin123")
            db.commit()
            logger.info("✅ Admin password reset to 'admin123'.")
            
    except Exception as e:
        logger.error(f"❌ Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
