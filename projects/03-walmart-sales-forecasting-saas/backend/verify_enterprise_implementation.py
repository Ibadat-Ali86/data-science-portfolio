#!/usr/bin/env python3
"""
Verification script for enterprise implementation
Checks that all components load correctly and are properly integrated
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def verify_imports():
    """Verify all critical imports work"""
    print("🔍 Verifying imports...")
    
    try:
        from app.core import pipeline_orchestrator
        from app.core.pipeline_orchestrator import (
            EnterprisePipelineOrchestrator,
            PipelineContext,
            PipelineStage,
            PipelineError
        )
        # Import get_orchestrator from module
        get_orchestrator = pipeline_orchestrator.get_orchestrator
        print("  ✅ Pipeline orchestrator imports OK")
    except Exception as e:
        print(f"  ❌ Pipeline orchestrator import failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    try:
        from app.services.enterprise_validator import (
            EnterpriseDataValidator,
            ValidationError
        )
        print("  ✅ Enterprise validator imports OK")
    except Exception as e:
        print(f"  ❌ Enterprise validator import failed: {e}")
        return False
    
    try:
        from app.utils.structured_logger import (
            StructuredLogger,
            pipeline_logger,
            api_logger,
            validation_logger
        )
        print("  ✅ Structured logger imports OK")
    except Exception as e:
        print(f"  ❌ Structured logger import failed: {e}")
        return False
    
    try:
        from app.api.error_handler import router as error_handler_router
        print("  ✅ Error handler imports OK")
    except Exception as e:
        print(f"  ❌ Error handler import failed: {e}")
        return False
    
    return True

def verify_orchestrator():
    """Verify orchestrator can be instantiated"""
    print("\n🔍 Verifying orchestrator...")
    
    try:
        from app.core import pipeline_orchestrator
        from app.core.pipeline_orchestrator import EnterprisePipelineOrchestrator
        get_orchestrator = pipeline_orchestrator.get_orchestrator
        orchestrator = get_orchestrator()
        assert isinstance(orchestrator, EnterprisePipelineOrchestrator)
        print("  ✅ Orchestrator instance OK")
        
        # Verify it has required methods
        required_methods = [
            'create_session',
            'validate_data',
            'execute_pipeline',
            'handle_validation_failure',
            'handle_pipeline_error',
            'handle_unexpected_error'
        ]
        
        for method in required_methods:
            assert hasattr(orchestrator, method), f"Missing method: {method}"
        
        print("  ✅ All required methods present")
        return True
    except Exception as e:
        print(f"  ❌ Orchestrator verification failed: {e}")
        return False

def verify_validator():
    """Verify validator can be instantiated"""
    print("\n🔍 Verifying validator...")
    
    try:
        from app.services.enterprise_validator import EnterpriseDataValidator
        
        validator = EnterpriseDataValidator(
            file_path="/tmp/test.csv",
            file_size_bytes=1000,
            column_mapping={"date": "date", "target": "target"}
        )
        
        assert validator.MAX_FILE_SIZE_MB == 50
        assert validator.MIN_ROWS == 30
        assert validator.MAX_ROWS == 1_000_000
        
        print("  ✅ Validator instance OK")
        print("  ✅ Validation constraints configured correctly")
        return True
    except Exception as e:
        print(f"  ❌ Validator verification failed: {e}")
        return False

def verify_logging():
    """Verify logging works"""
    print("\n🔍 Verifying logging...")
    
    try:
        from app.utils.structured_logger import pipeline_logger
        
        # Test logging
        pipeline_logger.log_event("test_event", {"test": "data"})
        pipeline_logger.info("Test info message")
        
        print("  ✅ Logging works correctly")
        return True
    except Exception as e:
        print(f"  ❌ Logging verification failed: {e}")
        return False

def verify_pipeline_stages():
    """Verify all pipeline stages are defined"""
    print("\n🔍 Verifying pipeline stages...")
    
    try:
        from app.core.pipeline_orchestrator import PipelineStage
        
        required_stages = [
            'INGESTION',
            'VALIDATION',
            'SANITIZATION',
            'PROFILING',
            'PREPROCESSING',
            'FEATURE_ENGINEERING',
            'MODEL_TRAINING',
            'ENSEMBLE',
            'COMPLETED',
            'FAILED'
        ]
        
        for stage_name in required_stages:
            stage = getattr(PipelineStage, stage_name)
            assert stage.value == stage_name.lower()
        
        print("  ✅ All pipeline stages defined")
        return True
    except Exception as e:
        print(f"  ❌ Pipeline stages verification failed: {e}")
        return False

def main():
    """Run all verification checks"""
    print("=" * 60)
    print("Enterprise Implementation Verification")
    print("=" * 60)
    
    checks = [
        verify_imports,
        verify_orchestrator,
        verify_validator,
        verify_logging,
        verify_pipeline_stages
    ]
    
    results = []
    for check in checks:
        try:
            result = check()
            results.append(result)
        except Exception as e:
            print(f"  ❌ Check failed with exception: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    if all(results):
        print("✅ All checks passed! Enterprise implementation is ready.")
        return 0
    else:
        print("❌ Some checks failed. Please review the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
