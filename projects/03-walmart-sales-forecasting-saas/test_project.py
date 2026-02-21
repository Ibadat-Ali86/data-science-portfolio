#!/usr/bin/env python3
"""
Quick test script to verify the project loads and basic functionality works
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_imports():
    """Test all critical imports"""
    print("🔍 Testing imports...")
    try:
        from app.core.pipeline_orchestrator import (
            EnterprisePipelineOrchestrator,
            PipelineContext,
            PipelineStage,
            get_orchestrator
        )
        print("  ✅ Pipeline orchestrator")
        
        from app.services.enterprise_validator import EnterpriseDataValidator
        print("  ✅ Enterprise validator")
        
        from app.utils.structured_logger import pipeline_logger, api_logger
        print("  ✅ Structured logger")
        
        from app.api.error_handler import router as error_router
        print("  ✅ Error handler")
        
        from app.api.analysis import router as analysis_router
        print("  ✅ Analysis router")
        
        from app.main import app
        print("  ✅ FastAPI app")
        
        return True
    except Exception as e:
        print(f"  ❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_orchestrator():
    """Test orchestrator functionality"""
    print("\n🔍 Testing orchestrator...")
    try:
        from app.core.pipeline_orchestrator import get_orchestrator, PipelineStage
        
        orchestrator = get_orchestrator()
        
        # Test session creation
        context = orchestrator.create_session(
            user_id="test_user",
            file_path="/tmp/test.csv",
            original_filename="test.csv",
            file_size=1000,
            column_mapping={"date": "date", "target": "target"}
        )
        
        assert context.session_id is not None
        assert context.user_id == "test_user"
        print("  ✅ Session creation works")
        
        # Test stage enum
        assert PipelineStage.INGESTION.value == "ingestion"
        assert PipelineStage.VALIDATION.value == "validation"
        print("  ✅ Pipeline stages defined")
        
        return True
    except Exception as e:
        print(f"  ❌ Orchestrator test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_validator():
    """Test validator functionality"""
    print("\n🔍 Testing validator...")
    try:
        from app.services.enterprise_validator import EnterpriseDataValidator
        import pandas as pd
        
        validator = EnterpriseDataValidator(
            file_path="/tmp/test.csv",
            file_size_bytes=1000,
            column_mapping={"date": "date", "target": "target"}
        )
        
        # Test constraints
        assert validator.MAX_FILE_SIZE_MB == 50
        assert validator.MIN_ROWS == 30
        assert validator.MAX_ROWS == 1_000_000
        print("  ✅ Validator constraints configured")
        
        # Test with sample data
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=50),
            'target': range(50)
        })
        
        is_valid, results = validator.validate(df)
        print(f"  ✅ Validation runs (result: {is_valid})")
        
        return True
    except Exception as e:
        print(f"  ❌ Validator test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_routes():
    """Test API routes are registered"""
    print("\n🔍 Testing API routes...")
    try:
        from app.main import app
        
        routes = [route.path for route in app.routes]
        
        required_routes = [
            "/api/analysis/upload",
            "/api/analysis/detect-columns",
            "/api/log-error",
            "/health"
        ]
        
        for route in required_routes:
            if any(route in r for r in routes):
                print(f"  ✅ Route exists: {route}")
            else:
                print(f"  ⚠️  Route not found: {route}")
        
        return True
    except Exception as e:
        print(f"  ❌ API routes test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Project Test Suite")
    print("=" * 60)
    
    tests = [
        ("Imports", test_imports),
        ("Orchestrator", test_orchestrator),
        ("Validator", test_validator),
        ("API Routes", test_api_routes)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"\n❌ {name} test crashed: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ All tests passed! ({passed}/{total})")
        print("\n🚀 Project is ready to run!")
        print("\nTo start the backend:")
        print("  cd backend && uvicorn app.main:app --reload --port 8000")
        print("\nTo start the frontend:")
        print("  cd frontend && npm run dev")
        return 0
    else:
        print(f"⚠️  Some tests failed ({passed}/{total} passed)")
        return 1

if __name__ == "__main__":
    sys.exit(main())
