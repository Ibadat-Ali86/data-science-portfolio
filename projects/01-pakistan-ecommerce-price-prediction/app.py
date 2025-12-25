"""
E-commerce Unit Price Prediction Web Application
Professional Flask-based deployment for Pakistan E-commerce Price Prediction Model
"""

from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)

# Load the trained model
MODEL_PATH = 'random_forest_price_model.pkl'

try:
    model = joblib.load(MODEL_PATH)
    print(f"✓ Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"✗ Error: Model file '{MODEL_PATH}' not found!")
    model = None
except Exception as e:
    print(f"✗ Error loading model: {str(e)}")
    model = None

# Feature engineering constants (from training data)
# 90th percentile for bulk orders (approximate from training)
BULK_ORDER_THRESHOLD = 3.0  # Approximate 90th percentile quantity

def calculate_features(form_data):
    """
    Calculate all required features from user input.
    Matches the feature engineering logic from the training notebook.
    """
    # Parse input data
    order_datetime = pd.to_datetime(form_data.get('order_datetime', datetime.now().isoformat()))
    customer_registration_date = pd.to_datetime(form_data.get('customer_registration_date', order_datetime.isoformat()))
    
    quantity_ordered = float(form_data.get('quantity_ordered', 1))
    order_total_amount = float(form_data.get('order_total_amount', 0))
    discount_value = float(form_data.get('discount_value', 0))
    
    product_category = form_data.get('product_category', 'Others')
    payment_type = form_data.get('payment_type', 'cod')
    order_status = form_data.get('order_status', 'complete')
    
    # Feature engineering (matching notebook logic)
    order_year = float(order_datetime.year)
    order_month = float(order_datetime.month)
    order_dayofweek = int(order_datetime.dayofweek)
    is_weekend = 1 if order_dayofweek >= 5 else 0
    
    # Customer tenure in days
    if pd.notna(customer_registration_date):
        customer_tenure_days = max(0, (order_datetime - customer_registration_date).days)
    else:
        customer_tenure_days = 0.0
    
    # Discount rate
    if order_total_amount > 0:
        discount_rate = min(1.0, max(0.0, discount_value / order_total_amount))
    else:
        discount_rate = 0.0
    
    # Bulk order flag (90th percentile threshold)
    is_bulk_order = 1 if quantity_ordered > BULK_ORDER_THRESHOLD else 0
    
    # Create feature dictionary in the exact order expected by the model
    features = {
        'quantity_ordered': quantity_ordered,
        'order_total_amount': order_total_amount,
        'discount_value': discount_value,
        'discount_rate': discount_rate,
        'customer_tenure_days': customer_tenure_days,
        'order_year': order_year,
        'order_month': order_month,
        'order_dayofweek': order_dayofweek,
        'is_weekend': is_weekend,
        'is_bulk_order': is_bulk_order,
        'product_category': product_category,
        'payment_type': payment_type,
        'order_status': order_status
    }
    
    return features

def predict_price(features):
    """
    Make prediction using the loaded model pipeline.
    The model outputs log(1 + price), so we transform back.
    """
    if model is None:
        return None, "Model not loaded. Please ensure random_forest_price_model.pkl exists."
    
    try:
        # Convert features to DataFrame with correct column order
        numeric_features = [
            'quantity_ordered', 'order_total_amount', 'discount_value', 'discount_rate',
            'customer_tenure_days', 'order_year', 'order_month', 'order_dayofweek',
            'is_weekend', 'is_bulk_order'
        ]
        categorical_features = ['product_category', 'payment_type', 'order_status']
        
        # Create DataFrame
        feature_dict = {**features}
        df = pd.DataFrame([feature_dict])
        
        # Reorder columns to match training data
        df = df[numeric_features + categorical_features]
        
        # Make prediction (model pipeline handles preprocessing)
        log_prediction = model.predict(df)[0]
        
        # Transform back from log scale: exp(log(1 + price)) - 1 = price
        predicted_price = np.expm1(log_prediction)
        
        # Ensure non-negative
        predicted_price = max(0, predicted_price)
        
        return predicted_price, None
        
    except Exception as e:
        return None, f"Prediction error: {str(e)}"

@app.route('/')
def index():
    """Render the main prediction form."""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests."""
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded. Please ensure random_forest_price_model.pkl exists.'
        }), 500
    
    try:
        # Get form data
        form_data = request.form.to_dict()
        
        # Calculate features
        features = calculate_features(form_data)
        
        # Make prediction
        predicted_price, error = predict_price(features)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        # Format response
        return jsonify({
            'success': True,
            'predicted_price': round(predicted_price, 2),
            'predicted_price_formatted': f"PKR {predicted_price:,.2f}",
            'features_used': features
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Server error: {str(e)}"
        }), 500

@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)

