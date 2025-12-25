# E-commerce Unit Price Prediction - Web Application

Professional Flask-based web application for deploying the Pakistan E-commerce Price Prediction Model.

## Features

- **Clean, Modern UI**: Professional design with responsive layout
- **Real-time Predictions**: Instant price predictions based on product and order features
- **Feature Engineering**: Automatic calculation of derived features (discount rate, weekend flag, bulk order, etc.)
- **Model Pipeline**: Uses the trained Random Forest model with integrated preprocessing

## Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Ensure Model File Exists**:
   - Make sure `random_forest_price_model.pkl` is in the project root directory
   - This file should be generated from your Jupyter notebook

## Running the Application

### Development Mode:
```bash
python app.py
```

The application will start on `http://localhost:5000`

### Production Mode:
```bash
export PORT=5000
export DEBUG=False
python app.py
```

Or use a production WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Project Structure

```
.
├── app.py                      # Flask application
├── templates/
│   └── index.html             # Main HTML template
├── static/
│   └── style.css              # Professional CSS styling
├── random_forest_price_model.pkl  # Trained model (required)
├── requirements.txt           # Python dependencies
└── README_DEPLOYMENT.md       # This file
```

## Usage

1. Open the web application in your browser
2. Fill in the form fields:
   - **Product Information**: Category, Quantity
   - **Order Details**: Order Total, Discount, Payment Type, Order Status
   - **Temporal Information**: Order Date/Time, Customer Registration Date
3. Click "Predict Unit Price"
4. View the predicted price in PKR

## Model Details

- **Algorithm**: Random Forest Regressor
- **Performance**: R² = 0.92 (92% accuracy)
- **Best Performance**: Premium products (PKR 10,000+)
- **Features**: 13 features (10 numeric, 3 categorical)
- **Preprocessing**: Automatic via scikit-learn Pipeline

## API Endpoints

### POST `/predict`
Submit form data to get price prediction.

**Request**: Form data with all required fields
**Response**: JSON with predicted price and feature details

### GET `/health`
Health check endpoint.

**Response**: JSON with application status

## Notes

- The model expects features in a specific order (handled automatically)
- Predictions are transformed from log scale back to original price scale
- Feature engineering matches the training notebook logic exactly
- Model performs best for high-value products (PKR 10,000+)

## Troubleshooting

**Model not found error**:
- Ensure `random_forest_price_model.pkl` exists in the project root
- Check file permissions

**Prediction errors**:
- Verify all required form fields are filled
- Check that numeric inputs are valid numbers
- Ensure dates are in correct format

## License

This project is part of the Data Science Application Assignment.

