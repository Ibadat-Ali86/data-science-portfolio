
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Union
import logging

logger = logging.getLogger(__name__)

class ModelRouter:
    """
    Intelligent Model Selection and Fallback Routing.
    Task 0.3 of Student-Optimized Roadmap.
    """
    
    def __init__(self):
        pass

    def route_model(self, df: pd.DataFrame, target_col: str, date_col: str) -> List[str]:
        """
        Analyze data and return prioritized list of models to try.
        """
        prioritized_models = []
        
        # Data Characteristics
        n_rows = len(df)
        n_cols = len(df.columns)
        has_exogenous = n_cols > 2 # Date + Target + at least one other
        
        # 1. Check data sufficiency (Prophet/XGBoost overfit heavily on tiny data)
        if n_rows < 30:
            logger.info(f"Data too small ({n_rows} rows). Recommending lightweight models.")
            return ['naive', 'moving_average']
            
        # 2. Prefer Ensemble for robustness if data allows
        if n_rows > 50:
             prioritized_models.append('ensemble')
        
        # 3. Model Specifics based on data
        if has_exogenous:
            # XGBoost handles extra features well
            prioritized_models.append('xgboost')
        
        # Prophet handles seasonality robustly
        prioritized_models.append('prophet')
        
        # SARIMA (often fragile/slow, lower priority)
        # prioritized_models.append('sarima') 
        
        # Fallbacks for failures
        prioritized_models.append('naive')
        prioritized_models.append('moving_average')
        
        # Remove duplicates while preserving order
        seen = set()
        final_list = [x for x in prioritized_models if not (x in seen or seen.add(x))]
        
        logger.info(f"Model Routing Plan: {final_list}")
        return final_list
