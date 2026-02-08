import pickle
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.config import settings
import os

class MLForecastService:
    def __init__(self):
        self.models = {}
        self.model_dir = settings.MODEL_DIR
        
    def load_model(self, model_type: str):
        """Load a specific ML model"""
        model_path = os.path.join(self.model_dir, f"{model_type}_model.pkl")
        try:
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.models[model_type] = pickle.load(f)
                return True
        except Exception as e:
            print(f"Error loading {model_type} model: {e}")
        return False
    
    def generate_forecast(
        self,
        historical_data: pd.DataFrame,
        model_type: str = 'xgboost',
        periods: int = 30
    ) -> Dict:
        """Generate forecast using specified model"""
        
        # Generate mock forecast for now
        # In production, this would use the actual trained models
        dates = pd.date_range(
            start=datetime.now(),
            periods=periods,
            freq='D'
        )
        
        # Simple forecast logic (replace with actual ML model)
        if len(historical_data) > 0:
            mean_sales = historical_data['quantity'].mean()
            std_sales = historical_data['quantity'].std()
        else:
            mean_sales = 1000
            std_sales = 100
        
        # Generate predictions with some randomness
        predictions = np.random.normal(mean_sales, std_sales * 0.1, periods)
        lower_bound = predictions - std_sales * 0.5
        upper_bound = predictions + std_sales * 0.5
        
        forecast_data = {
            'dates': dates.strftime('%Y-%m-%d').tolist(),
            'predictions': predictions.tolist(),
            'lower_bound': lower_bound.tolist(),
            'upper_bound': upper_bound.tolist(),
            'model_type': model_type,
            'confidence_level': 95.0
        }
        
        return forecast_data
    
    def calculate_metrics(
        self,
        actual: List[float],
        predicted: List[float]
    ) -> Dict:
        """Calculate forecast accuracy metrics"""
        
        actual_arr = np.array(actual)
        predicted_arr = np.array(predicted)
        
        # MAPE
        mape = np.mean(np.abs((actual_arr - predicted_arr) / actual_arr)) * 100
        
        # RMSE
        rmse = np.sqrt(np.mean((actual_arr - predicted_arr) ** 2))
        
        # MAE
        mae = np.mean(np.abs(actual_arr - predicted_arr))
        
        # R²
        ss_res = np.sum((actual_arr - predicted_arr) ** 2)
        ss_tot = np.sum((actual_arr - np.mean(actual_arr)) ** 2)
        r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            'mape': round(mape, 2),
            'rmse': round(rmse, 2),
            'mae': round(mae, 2),
            'r2': round(r2, 3)
        }
    
    def scenario_analysis(
        self,
        base_forecast: List[float],
        demand_factor: float = 1.0,
        price_factor: float = 1.0,
        marketing_factor: float = 1.0
    ) -> Dict:
        """Perform what-if scenario analysis"""
        
        # Simple scenario calculation
        adjusted_forecast = np.array(base_forecast) * demand_factor * (2 - price_factor) * (0.5 + marketing_factor * 0.5)
        
        return {
            'adjusted_forecast': adjusted_forecast.tolist(),
            'base_forecast': base_forecast,
            'impact': {
                'demand': (demand_factor - 1) * 100,
                'price': (price_factor - 1) * 100,
                'marketing': (marketing_factor - 1) * 100
            }
        }

# Singleton instance
ml_service = MLForecastService()
