"""
Circuit Breaker Pattern Implementation
Prevents cascading failures by failing fast when a service is unhealthy.

States:
  CLOSED   - Normal operation, requests pass through
  OPEN     - Service is failing, requests are rejected immediately
  HALF_OPEN - Testing if service has recovered
"""

import time
import threading
from enum import Enum
from typing import Callable, Any, Optional
from functools import wraps

from .structured_logger import get_logger

logger = get_logger("circuit_breaker")


class CircuitState(Enum):
    CLOSED = "closed"       # Normal - requests pass through
    OPEN = "open"           # Failing - requests rejected immediately
    HALF_OPEN = "half_open" # Testing recovery


class CircuitBreakerError(Exception):
    """Raised when circuit breaker is OPEN and request is rejected"""
    def __init__(self, service_name: str, failure_count: int, reset_timeout: float):
        self.service_name = service_name
        self.failure_count = failure_count
        self.reset_timeout = reset_timeout
        super().__init__(
            f"Circuit breaker OPEN for '{service_name}'. "
            f"Failed {failure_count} times. "
            f"Will retry after {reset_timeout:.0f}s."
        )


class CircuitBreaker:
    """
    Enterprise circuit breaker with configurable thresholds.
    
    Usage:
        breaker = CircuitBreaker(name="ml_training", failure_threshold=5)
        
        @breaker.call
        def train_model():
            ...
        
        # Or use directly:
        result = breaker.execute(train_model, arg1, arg2)
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        success_threshold: int = 2,
        reset_timeout: float = 60.0,
        expected_exceptions: tuple = (Exception,)
    ):
        """
        Initialize circuit breaker.

        Args:
            name: Service/operation name for logging
            failure_threshold: Failures before opening circuit
            success_threshold: Successes in HALF_OPEN before closing
            reset_timeout: Seconds to wait before trying again (OPEN → HALF_OPEN)
            expected_exceptions: Exception types that count as failures
        """
        self.name = name
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.reset_timeout = reset_timeout
        self.expected_exceptions = expected_exceptions

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: Optional[float] = None
        self._lock = threading.Lock()

    @property
    def state(self) -> CircuitState:
        """Get current circuit state, transitioning OPEN→HALF_OPEN if timeout elapsed"""
        with self._lock:
            if self._state == CircuitState.OPEN:
                if self._last_failure_time and (time.time() - self._last_failure_time) >= self.reset_timeout:
                    self._state = CircuitState.HALF_OPEN
                    self._success_count = 0
                    logger.info(
                        f"Circuit breaker '{self.name}' transitioning OPEN → HALF_OPEN",
                        service=self.name
                    )
            return self._state

    def execute(self, func: Callable, *args, **kwargs) -> Any:
        """
        Execute function through circuit breaker.

        Args:
            func: Function to execute
            *args, **kwargs: Arguments to pass to function

        Returns:
            Function result

        Raises:
            CircuitBreakerError: If circuit is OPEN
            Exception: If function raises and circuit trips
        """
        current_state = self.state

        if current_state == CircuitState.OPEN:
            logger.warning(
                f"Circuit breaker '{self.name}' is OPEN - rejecting request",
                service=self.name,
                failure_count=self._failure_count
            )
            raise CircuitBreakerError(self.name, self._failure_count, self.reset_timeout)

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result

        except self.expected_exceptions as e:
            self._on_failure(e)
            raise

    def _on_success(self):
        """Handle successful execution"""
        with self._lock:
            if self._state == CircuitState.HALF_OPEN:
                self._success_count += 1
                if self._success_count >= self.success_threshold:
                    self._state = CircuitState.CLOSED
                    self._failure_count = 0
                    self._success_count = 0
                    logger.info(
                        f"Circuit breaker '{self.name}' CLOSED - service recovered",
                        service=self.name
                    )
            elif self._state == CircuitState.CLOSED:
                # Reset failure count on success
                self._failure_count = max(0, self._failure_count - 1)

    def _on_failure(self, error: Exception):
        """Handle failed execution"""
        with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.time()

            logger.warning(
                f"Circuit breaker '{self.name}' recorded failure {self._failure_count}/{self.failure_threshold}",
                service=self.name,
                error=str(error),
                error_type=type(error).__name__
            )

            if self._failure_count >= self.failure_threshold:
                if self._state != CircuitState.OPEN:
                    self._state = CircuitState.OPEN
                    logger.error(
                        f"Circuit breaker '{self.name}' OPENED after {self._failure_count} failures",
                        service=self.name,
                        reset_timeout=self.reset_timeout
                    )

    def call(self, func: Callable) -> Callable:
        """Decorator to wrap a function with circuit breaker"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            return self.execute(func, *args, **kwargs)
        return wrapper

    def get_status(self) -> dict:
        """Get current circuit breaker status for health checks"""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "failure_threshold": self.failure_threshold,
            "last_failure_time": self._last_failure_time,
            "reset_timeout": self.reset_timeout
        }

    def reset(self):
        """Manually reset circuit breaker to CLOSED state"""
        with self._lock:
            self._state = CircuitState.CLOSED
            self._failure_count = 0
            self._success_count = 0
            self._last_failure_time = None
            logger.info(f"Circuit breaker '{self.name}' manually reset to CLOSED", service=self.name)


def retry_with_backoff(
    func: Callable,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
) -> Any:
    """
    Execute function with exponential backoff retry logic.

    Args:
        func: Function to execute (no-arg callable or lambda)
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay in seconds
        max_delay: Maximum delay cap in seconds
        backoff_factor: Multiplier for each retry delay
        exceptions: Exception types to retry on

    Returns:
        Function result

    Raises:
        Last exception if all retries exhausted
    """
    last_exception = None
    delay = base_delay

    for attempt in range(max_retries + 1):
        try:
            return func()
        except exceptions as e:
            last_exception = e
            if attempt < max_retries:
                actual_delay = min(delay, max_delay)
                logger.warning(
                    f"Retry attempt {attempt + 1}/{max_retries} after {actual_delay:.1f}s",
                    error=str(e),
                    attempt=attempt + 1
                )
                time.sleep(actual_delay)
                delay *= backoff_factor
            else:
                logger.error(
                    f"All {max_retries} retries exhausted",
                    error=str(e),
                    max_retries=max_retries
                )

    raise last_exception


# Global circuit breakers for key services
ml_training_breaker = CircuitBreaker(
    name="ml_training",
    failure_threshold=3,
    reset_timeout=120.0
)

data_profiling_breaker = CircuitBreaker(
    name="data_profiling",
    failure_threshold=5,
    reset_timeout=60.0
)

database_breaker = CircuitBreaker(
    name="database",
    failure_threshold=5,
    reset_timeout=30.0
)
