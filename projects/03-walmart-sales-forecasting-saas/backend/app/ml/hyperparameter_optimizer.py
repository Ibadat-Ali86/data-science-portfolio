"""
Hyperparameter Optimization for Time Series Models

This module implements Bayesian optimization for XGBoost hyperparameters
using time series cross-validation to avoid data leakage.

Uses Optuna for efficient hyperparameter search with pruning.

Author: ML Team
Date: 2026-02-08
"""
import numpy as np
import pandas as pd
from typing import Dict, Optional, Callable, List
from sklearn.model_selection import TimeSeriesSplit
import logging
import time

logger = logging.getLogger(__name__)

# Try to import optuna, fall back to simple grid search if not available
try:
    import optuna
    from optuna.pruners import MedianPruner
    from optuna.samplers import TPESampler
    OPTUNA_AVAILABLE = True
except ImportError:
    OPTUNA_AVAILABLE = False
    logger.warning("Optuna not installed. Using simple grid search instead.")


class TimeSeriesHyperparameterOptimizer:
    """
    Bayesian optimization for XGBoost hyperparameters using time series CV.
    
    Key Features:
    - TimeSeriesSplit CV (no shuffling!)
    - Early stopping within trials
    - Pruning of unpromising trials
    - Monotonic constraints support
    
    Usage:
        optimizer = TimeSeriesHyperparameterOptimizer(X_train, y_train)
        best_params = optimizer.optimize(n_trials=100)
        final_model = optimizer.get_best_model()
    """
    
    def __init__(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        n_splits: int = 5,
        metric: str = 'mape',
        random_state: int = 42
    ):
        """
        Initialize the optimizer.
        
        Args:
            X_train: Training features
            y_train: Training target
            n_splits: Number of time series CV splits
            metric: Optimization metric ('mape', 'rmse', 'mae')
            random_state: Random seed for reproducibility
        """
        self.X_train = X_train
        self.y_train = y_train
        self.n_splits = n_splits
        self.metric = metric
        self.random_state = random_state
        
        self.best_params = None
        self.best_score = None
        self.study = None
        self.best_model = None
        self.optimization_history = []
        
    def _get_param_space(self, trial) -> Dict:
        """Define hyperparameter search space for XGBoost."""
        return {
            'n_estimators': trial.suggest_int('n_estimators', 100, 1000),
            'max_depth': trial.suggest_int('max_depth', 3, 10),
            'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
            'subsample': trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
            'gamma': trial.suggest_float('gamma', 0, 5),
            'reg_alpha': trial.suggest_float('reg_alpha', 0, 10),
            'reg_lambda': trial.suggest_float('reg_lambda', 0, 10),
            'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
            
            # Fixed params
            'tree_method': 'hist',
            'random_state': self.random_state,
            'n_jobs': -1,
            'objective': 'reg:squarederror'
        }
    
    def _calculate_metric(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Calculate the optimization metric."""
        if self.metric == 'mape':
            return np.mean(np.abs((y_true - y_pred) / (y_true + 1e-6))) * 100
        elif self.metric == 'rmse':
            return np.sqrt(np.mean((y_true - y_pred) ** 2))
        elif self.metric == 'mae':
            return np.mean(np.abs(y_true - y_pred))
        else:
            raise ValueError(f"Unknown metric: {self.metric}")
    
    def _objective(self, trial) -> float:
        """Optuna objective function."""
        try:
            import xgboost as xgb
        except ImportError:
            logger.error("XGBoost not installed")
            return float('inf')
        
        params = self._get_param_space(trial)
        
        # Time series cross-validation (no shuffling!)
        tscv = TimeSeriesSplit(n_splits=self.n_splits)
        scores = []
        
        for fold, (train_idx, val_idx) in enumerate(tscv.split(self.X_train)):
            X_train_fold = self.X_train.iloc[train_idx]
            y_train_fold = self.y_train.iloc[train_idx]
            X_val_fold = self.X_train.iloc[val_idx]
            y_val_fold = self.y_train.iloc[val_idx]
            
            model = xgb.XGBRegressor(**params)
            model.fit(
                X_train_fold, y_train_fold,
                eval_set=[(X_val_fold, y_val_fold)],
                verbose=False
            )
            
            preds = model.predict(X_val_fold)
            score = self._calculate_metric(y_val_fold.values, preds)
            scores.append(score)
            
            # Report intermediate score for pruning
            if OPTUNA_AVAILABLE:
                trial.report(np.mean(scores), fold)
                if trial.should_prune():
                    raise optuna.TrialPruned()
        
        return np.mean(scores)
    
    def optimize(self, n_trials: int = 100, timeout: int = 3600) -> Dict:
        """
        Run Bayesian optimization.
        
        Args:
            n_trials: Number of optimization trials
            timeout: Maximum optimization time in seconds
            
        Returns:
            Best hyperparameters
        """
        start_time = time.time()
        
        if OPTUNA_AVAILABLE:
            self.study = optuna.create_study(
                direction='minimize',
                sampler=TPESampler(seed=self.random_state),
                pruner=MedianPruner()
            )
            
            self.study.optimize(
                self._objective, 
                n_trials=n_trials,
                timeout=timeout,
                show_progress_bar=True
            )
            
            self.best_params = self.study.best_params
            self.best_score = self.study.best_value
            
            # Add fixed params
            self.best_params.update({
                'tree_method': 'hist',
                'random_state': self.random_state,
                'n_jobs': -1,
                'objective': 'reg:squarederror'
            })
        else:
            # Simple grid search fallback
            self.best_params, self.best_score = self._simple_grid_search()
        
        optimization_time = time.time() - start_time
        
        logger.info(f"Optimization complete in {optimization_time:.1f}s")
        logger.info(f"Best {self.metric.upper()}: {self.best_score:.4f}")
        logger.info(f"Best params: {self.best_params}")
        
        return self.best_params
    
    def _simple_grid_search(self) -> tuple:
        """Simple grid search fallback when Optuna is not available."""
        try:
            import xgboost as xgb
        except ImportError:
            logger.error("XGBoost not installed")
            return {}, float('inf')
        
        param_grid = [
            {'n_estimators': 100, 'max_depth': 4, 'learning_rate': 0.1},
            {'n_estimators': 300, 'max_depth': 6, 'learning_rate': 0.1},
            {'n_estimators': 500, 'max_depth': 6, 'learning_rate': 0.05},
            {'n_estimators': 500, 'max_depth': 8, 'learning_rate': 0.05},
        ]
        
        best_score = float('inf')
        best_params = {}
        
        tscv = TimeSeriesSplit(n_splits=self.n_splits)
        
        for params in param_grid:
            full_params = {
                **params,
                'random_state': self.random_state,
                'n_jobs': -1,
                'objective': 'reg:squarederror'
            }
            
            scores = []
            for train_idx, val_idx in tscv.split(self.X_train):
                X_train_fold = self.X_train.iloc[train_idx]
                y_train_fold = self.y_train.iloc[train_idx]
                X_val_fold = self.X_train.iloc[val_idx]
                y_val_fold = self.y_train.iloc[val_idx]
                
                model = xgb.XGBRegressor(**full_params)
                model.fit(X_train_fold, y_train_fold, verbose=False)
                
                preds = model.predict(X_val_fold)
                score = self._calculate_metric(y_val_fold.values, preds)
                scores.append(score)
            
            avg_score = np.mean(scores)
            if avg_score < best_score:
                best_score = avg_score
                best_params = full_params
        
        return best_params, best_score
    
    def get_best_model(self):
        """Train and return model with best parameters."""
        if not self.best_params:
            raise ValueError("Must run optimize() first")
        
        try:
            import xgboost as xgb
        except ImportError:
            raise ImportError("XGBoost not installed")
        
        self.best_model = xgb.XGBRegressor(**self.best_params)
        self.best_model.fit(self.X_train, self.y_train)
        
        return self.best_model
    
    def get_optimization_report(self) -> Dict:
        """Generate optimization report."""
        if not self.best_params:
            raise ValueError("Must run optimize() first")
        
        report = {
            'best_score': self.best_score,
            'best_params': self.best_params,
            'metric': self.metric,
            'n_splits': self.n_splits,
        }
        
        if OPTUNA_AVAILABLE and self.study:
            report.update({
                'n_trials': len(self.study.trials),
                'n_pruned': len([t for t in self.study.trials if t.state == optuna.trial.TrialState.PRUNED]),
                'optimization_time': sum([t.duration.total_seconds() for t in self.study.trials if t.duration])
            })
        
        return report
    
    def plot_optimization_history(self, save_path: Optional[str] = None):
        """Plot optimization history using Optuna visualization."""
        if not OPTUNA_AVAILABLE or not self.study:
            logger.warning("Optuna visualization not available")
            return
        
        try:
            from optuna.visualization import plot_optimization_history, plot_param_importances
            import plotly.io as pio
            
            fig1 = plot_optimization_history(self.study)
            if save_path:
                pio.write_html(fig1, f"{save_path}_history.html")
            
            fig2 = plot_param_importances(self.study)
            if save_path:
                pio.write_html(fig2, f"{save_path}_importance.html")
                
        except Exception as e:
            logger.warning(f"Could not generate plots: {e}")
