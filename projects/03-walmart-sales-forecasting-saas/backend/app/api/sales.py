from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
from app.database import get_db
from app.models.sales import Sales
from app.models.product import Product
from app.models.user import User
from app.services.auth_service import get_current_active_user
from datetime import datetime

router = APIRouter()

@router.post("/upload")
async def upload_sales_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload sales data from CSV file"""
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validate required columns
        required_columns = ['date', 'product_code', 'product_name', 'quantity']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        records_processed = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Get or create product
                product = db.query(Product).filter(
                    Product.product_code == row['product_code']
                ).first()
                
                if not product:
                    product = Product(
                        product_code=row['product_code'],
                        product_name=row['product_name'],
                        category=row.get('category'),
                        unit_price=row.get('unit_price')
                    )
                    db.add(product)
                    db.flush()
                
                # Create sales record
                sales = Sales(
                    product_id=product.id,
                    date=pd.to_datetime(row['date']).date(),
                    quantity=float(row['quantity']),
                    revenue=float(row.get('revenue', 0)) if pd.notna(row.get('revenue')) else None,
                    region=row.get('region'),
                    uploaded_by=current_user.id
                )
                db.add(sales)
                records_processed += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": "success",
            "records_processed": records_processed,
            "errors": errors[:10] if errors else []  # Return first 10 errors
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
