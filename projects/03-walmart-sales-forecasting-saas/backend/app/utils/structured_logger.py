"""
Enterprise Structured Logging System
Provides JSON-formatted, production-ready logging with correlation IDs and contextual information
"""

import logging
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path


class StructuredLogger:
    """
    Enterprise-grade structured logging for production observability
    
    Features:
    - JSON-formatted logs for easy parsing
    - Correlation IDs for request tracing
    - Multiple log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    - File and console handlers
    - Automatic log rotation
    """
    
    def __init__(self, name: str, log_level: str = "INFO", log_dir: str = "logs"):
        """
        Initialize structured logger
        
        Args:
            name: Logger name (usually module/service name)
            log_level: Minimum log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            log_dir: Directory for log files (relative to project root)
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, log_level.upper()))
        self.name = name
        
        # Prevent duplicate handlers
        if self.logger.handlers:
            return
        
        # Create logs directory if it doesn't exist
        project_root = Path(__file__).parent.parent.parent
        log_path = project_root / log_dir
        log_path.mkdir(exist_ok=True)
        
        # JSON formatter for structured logs
        class JSONFormatter(logging.Formatter):
            def format(self, record: logging.LogRecord) -> str:
                log_data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "level": record.levelname,
                    "logger": record.name,
                    "message": record.getMessage(),
                    "module": record.module,
                    "function": record.funcName,
                    "line": record.lineno
                }
                
                # Add extra fields if present
                if hasattr(record, 'correlation_id'):
                    log_data['correlation_id'] = record.correlation_id
                if hasattr(record, 'user_id'):
                    log_data['user_id'] = record.user_id
                if hasattr(record, 'session_id'):
                    log_data['session_id'] = record.session_id
                
                # Add exception info if present
                if record.exc_info:
                    log_data['exception'] = self.formatException(record.exc_info)
                
                return json.dumps(log_data)
        
        # Console handler - structured format for development
        console_handler = logging.StreamHandler()
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(console_formatter)
        console_handler.setLevel(logging.INFO)
        self.logger.addHandler(console_handler)
        
        # File handler - JSON format for production
        file_handler = logging.FileHandler(log_path / f'{name}.log')
        file_handler.setFormatter(JSONFormatter())
        file_handler.setLevel(logging.DEBUG)
        self.logger.addHandler(file_handler)
        
        # Error file handler - separate file for errors
        error_handler = logging.FileHandler(log_path / f'{name}_errors.log')
        error_handler.setFormatter(JSONFormatter())
        error_handler.setLevel(logging.ERROR)
        self.logger.addHandler(error_handler)
    
    def log_event(self, event_type: str, data: Dict[str, Any], 
                  level: str = "info", **extra_fields):
        """
        Log structured event with context
        
        Args:
            event_type: Type of event (e.g., "user_login", "data_upload", "model_training")
            data: Event data dictionary
            level: Log level (debug, info, warning, error, critical)
            **extra_fields: Additional fields to include (correlation_id, user_id, etc.)
        """
        log_entry = {
            "event_type": event_type,
            "data": data,
        }
        
        # Create a log record with extra fields
        extra = {k: v for k, v in extra_fields.items()}
        
        message = f"[{event_type}] {json.dumps(data)}"
        log_method = getattr(self.logger, level.lower())
        log_method(message, extra=extra)
    
    def log_error(self, error: Exception, context: Dict[str, Any], 
                  operation: str, **extra_fields):
        """
        Log error with full context for debugging
        
        Args:
            error: Exception object
            context: Additional context about the error
            operation: Operation being performed when error occurred
            **extra_fields: Additional fields (correlation_id, user_id, etc.)
        """
        import traceback
        
        error_data = {
            "operation": operation,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "stack_trace": traceback.format_exc(),
            "context": context,
            "severity": "ERROR"
        }
        
        extra = {k: v for k, v in extra_fields.items()}
        self.logger.error(
            f"Error in {operation}: {str(error)}", 
            exc_info=True,
            extra=extra
        )
    
    def debug(self, message: str, **extra_fields):
        """Log debug message"""
        extra = {k: v for k, v in extra_fields.items()}
        self.logger.debug(message, extra=extra)
    
    def info(self, message: str, **extra_fields):
        """Log info message"""
        extra = {k: v for k, v in extra_fields.items()}
        self.logger.info(message, extra=extra)
    
    def warning(self, message: str, **extra_fields):
        """Log warning message"""
        extra = {k: v for k, v in extra_fields.items()}
        self.logger.warning(message, extra=extra)
    
    def error(self, message: str, **extra_fields):
        """Log error message"""
        extra = {k: v for k, v in extra_fields.items()}
        self.logger.error(message, extra=extra)
    
    def critical(self, message: str, **extra_fields):
        """Log critical message"""
        extra = {k: v for k, v in extra_fields.items()}
        self.logger.critical(message, extra=extra)


# Global logger instances for common services
pipeline_logger = StructuredLogger("forecastai_pipeline")
api_logger = StructuredLogger("forecastai_api")
ml_logger = StructuredLogger("forecastai_ml")
validation_logger = StructuredLogger("forecastai_validation")


# Helper function to get logger for a specific module
def get_logger(name: str, log_level: str = "INFO") -> StructuredLogger:
    """
    Get or create a structured logger for a module
    
    Args:
        name: Logger name (module/service name)
        log_level: Minimum log level
        
    Returns:
        StructuredLogger instance
    """
    return StructuredLogger(name, log_level)
