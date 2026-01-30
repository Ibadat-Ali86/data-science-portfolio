"""
VITAL-LINK Backend Server v2.0
Professional Medical API with RESTful Endpoints
Flask API for Gemini 2.0 Flash Integration
"""

from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import os
import json
import re
import uuid
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import PIL.Image
import io

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.urandom(24)
CORS(app)

# ============================================
# Gemini Client Setup
# ============================================
from google import genai
from google.genai import types

# Load API key
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    api_file = Path(__file__).parent / "api.txt"
    if api_file.exists():
        API_KEY = api_file.read_text().strip()

if API_KEY:
    client = genai.Client(api_key=API_KEY)
else:
    client = None
    print("⚠️ WARNING: No API key found. Set GEMINI_API_KEY or create api.txt")

# ============================================
# Clinical Configuration
# ============================================
CLINICAL_SCOPE = {
    "target_condition": "Community-Acquired Pneumonia",
    "version": "1.0.0-research",
    "disclaimer": "RESEARCH PROTOTYPE ONLY. Not FDA-cleared. Not for clinical use.",
    "supported_modalities": ["chest_xray", "lung_audio", "vital_signs"]
}

# Physiological ranges for vital sign validation
VITAL_RANGES = {
    "temperature": {
        "unit": "°C",
        "normal": {"min": 36.1, "max": 37.2},
        "warning": {"min": 35.0, "max": 38.5},
        "critical": {"min": 32.0, "max": 42.0}
    },
    "spo2": {
        "unit": "%",
        "normal": {"min": 95, "max": 100},
        "warning": {"min": 90, "max": 94},
        "critical": {"min": 70, "max": 100}
    },
    "heart_rate": {
        "unit": "bpm",
        "normal": {"min": 60, "max": 100},
        "warning": {"min": 50, "max": 120},
        "critical": {"min": 30, "max": 200}
    },
    "respiratory_rate": {
        "unit": "breaths/min",
        "normal": {"min": 12, "max": 20},
        "warning": {"min": 8, "max": 30},
        "critical": {"min": 4, "max": 60}
    },
    "systolic_bp": {
        "unit": "mmHg",
        "normal": {"min": 90, "max": 120},
        "warning": {"min": 80, "max": 140},
        "critical": {"min": 60, "max": 220}
    },
    "diastolic_bp": {
        "unit": "mmHg",
        "normal": {"min": 60, "max": 80},
        "warning": {"min": 50, "max": 90},
        "critical": {"min": 40, "max": 130}
    }
}

# Session storage (in-memory for demo)
sessions = {}

# ============================================
# Sample Data Paths
# ============================================
SAMPLES_DIR = Path(__file__).parent / "data" / "samples"

# ============================================
# Static Routes
# ============================================
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# ============================================
# API Routes
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check with clinical scope info"""
    return jsonify({
        "status": "healthy",
        "api_configured": API_KEY is not None,
        "clinical_scope": CLINICAL_SCOPE,
        "vital_ranges": VITAL_RANGES
    })

@app.route('/api/session/create', methods=['POST'])
def create_session():
    """Create a new analysis session"""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "id": session_id,
        "created": datetime.now().isoformat(),
        "status": "pending",
        "xray": None,
        "audio": None,
        "vitals": None,
        "result": None
    }
    return jsonify({"session_id": session_id})

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get session data"""
    if session_id not in sessions:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(sessions[session_id])

@app.route('/api/validate-vitals', methods=['POST'])
def validate_vitals():
    """Validate vital signs against physiological ranges"""
    try:
        data = request.json
        validation_results = {}
        
        # Temperature
        temp = float(data.get('temperature', 37.0))
        validation_results['temperature'] = validate_vital('temperature', temp)
        
        # SpO2
        spo2 = int(data.get('spo2', 95))
        validation_results['spo2'] = validate_vital('spo2', spo2)
        
        # Heart Rate
        hr = int(data.get('heart_rate', 80))
        validation_results['heart_rate'] = validate_vital('heart_rate', hr)
        
        # Blood Pressure
        bp = data.get('blood_pressure', '120/80')
        if '/' in str(bp):
            sys, dia = map(int, bp.split('/'))
            validation_results['systolic_bp'] = validate_vital('systolic_bp', sys)
            validation_results['diastolic_bp'] = validate_vital('diastolic_bp', dia)
        
        # Overall status
        statuses = [v['status'] for v in validation_results.values()]
        if 'critical' in statuses:
            overall = 'critical'
        elif 'warning' in statuses:
            overall = 'warning'
        else:
            overall = 'normal'
        
        return jsonify({
            "valid": overall != 'critical',
            "overall_status": overall,
            "vitals": validation_results,
            "reference_ranges": VITAL_RANGES
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

def validate_vital(vital_name, value):
    """Validate a single vital sign"""
    ranges = VITAL_RANGES.get(vital_name, {})
    normal = ranges.get('normal', {})
    warning = ranges.get('warning', {})
    critical = ranges.get('critical', {})
    
    if not (critical.get('min', 0) <= value <= critical.get('max', 999)):
        return {"value": value, "status": "critical", "message": "Value outside physiological range"}
    elif not (warning.get('min', 0) <= value <= warning.get('max', 999)):
        return {"value": value, "status": "critical", "message": "Critically abnormal"}
    elif not (normal.get('min', 0) <= value <= normal.get('max', 999)):
        return {"value": value, "status": "warning", "message": "Abnormal - requires attention"}
    else:
        return {"value": value, "status": "normal", "message": "Within normal range"}

@app.route('/api/upload-xray', methods=['POST'])
def upload_xray():
    """Upload and validate X-ray image"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        session_id = request.form.get('session_id')
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
        if file.content_type not in allowed_types:
            return jsonify({
                "valid": False,
                "error": "Invalid file type. Accepted: JPG, PNG"
            }), 400
        
        # Read and validate image
        image_bytes = file.read()
        try:
            img = PIL.Image.open(io.BytesIO(image_bytes))
            width, height = img.size
        except Exception:
            return jsonify({"valid": False, "error": "Invalid image file"}), 400
        
        # Store in session
        if session_id and session_id in sessions:
            sessions[session_id]['xray'] = {
                "uploaded": True,
                "size": len(image_bytes),
                "dimensions": f"{width}x{height}",
                "format": img.format
            }
        
        return jsonify({
            "valid": True,
            "message": "X-ray uploaded successfully",
            "metadata": {
                "size_bytes": len(image_bytes),
                "dimensions": f"{width}x{height}",
                "format": img.format,
                "modality": "PA Chest Radiograph (assumed)"
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload-audio', methods=['POST'])
def upload_audio():
    """Upload and validate lung audio"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        session_id = request.form.get('session_id')
        
        # Validate file type
        allowed_types = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/x-wav']
        if file.content_type not in allowed_types:
            return jsonify({
                "valid": False,
                "error": "Invalid file type. Accepted: WAV, MP3"
            }), 400
        
        audio_bytes = file.read()
        
        # Store in session
        if session_id and session_id in sessions:
            sessions[session_id]['audio'] = {
                "uploaded": True,
                "size": len(audio_bytes),
                "format": file.content_type
            }
        
        return jsonify({
            "valid": True,
            "message": "Lung audio uploaded successfully",
            "metadata": {
                "size_bytes": len(audio_bytes),
                "format": file.content_type,
                "recording_site": "Bilateral lung fields (assumed)"
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Main analysis endpoint with professional medical output
    Returns risk scores, confidence intervals, and feature importance
    """
    try:
        # Parse vitals
        vitals_str = request.form.get('vitals', '{}')
        vitals = json.loads(vitals_str)
        
        # Get files
        xray_file = request.files.get('xray')
        audio_file = request.files.get('audio')
        sample_type = request.form.get('sample_type')
        
        # Handle sample cases
        if sample_type and not xray_file:
            xray_file, audio_file = load_sample_files(sample_type)
        
        # Process with Gemini or mock
        if client and xray_file:
            result = analyze_with_gemini(xray_file, audio_file, vitals)
        else:
            result = get_professional_mock_result(sample_type or 'normal', vitals)
        
        # Add clinical metadata
        result['clinical_scope'] = CLINICAL_SCOPE
        result['disclaimer'] = CLINICAL_SCOPE['disclaimer']
        result['timestamp'] = datetime.now().isoformat()
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in analyze: {e}")
        return jsonify({"error": str(e)}), 500

def load_sample_files(sample_type):
    """Load sample files from disk based on condition type."""
    # Map sample type to folder name
    condition_map = {
        'pneumonia': 'PNEUMONIA',
        'healthy': 'HEALTHY',
        'normal': 'HEALTHY',  # 'normal' alias for 'healthy'
        'copd': 'COPD',
        'asthma': 'ASTHMA',
        'bronchiectasis': 'BRONCHIECTASIS',
        'bronchiolitis': 'BRONCHIOLITIS',
        'urti': 'URTI',
        'lrti': 'LRTI'
    }
    
    condition_folder = condition_map.get(sample_type.lower(), 'HEALTHY')
    
    # Get audio files from condition-specific folder
    audio_dir = SAMPLES_DIR / "AUDIO_BY_CONDITION" / condition_folder
    
    # Fall back to old AUDIO folder if condition folder doesn't exist
    if not audio_dir.exists():
        audio_dir = SAMPLES_DIR / "AUDIO"
    
    # Get X-ray files from condition-specific folder
    xray_dir = SAMPLES_DIR / "XRAY_BY_CONDITION" / condition_folder
    
    # Fall back to old PNEUMONIA/NORMAL folders if condition folder doesn't exist
    if not xray_dir.exists():
        if sample_type.lower() in ['pneumonia', 'lrti']:
            xray_dir = SAMPLES_DIR / "PNEUMONIA"
        else:
            xray_dir = SAMPLES_DIR / "NORMAL"
    
    # Find available files
    images = list(xray_dir.glob("*.jpg")) + list(xray_dir.glob("*.jpeg")) + list(xray_dir.glob("*.png"))
    audios = list(audio_dir.glob("*.wav")) + list(audio_dir.glob("*.mp3"))
    
    return (images[0] if images else None, audios[0] if audios else None)

def analyze_with_gemini(xray_file, audio_file, vitals):
    """Send multimodal data to Gemini for analysis"""
    # Load image
    if hasattr(xray_file, 'read'):
        image_bytes = xray_file.read()
        raw_image = PIL.Image.open(io.BytesIO(image_bytes))
    else:
        raw_image = PIL.Image.open(xray_file)
    
    # Load audio
    audio_bytes = None
    if audio_file:
        if hasattr(audio_file, 'read'):
            audio_bytes = audio_file.read()
        else:
            with open(audio_file, 'rb') as f:
                audio_bytes = f.read()
    
    # Professional medical prompt
    sys_instruct = """
You are a Clinical Decision Support AI for research purposes only.
Analyze the provided chest X-ray, lung audio, and vitals to generate a RISK ASSESSMENT (not diagnosis).

Your response MUST be valid JSON with this structure:
{
    "risk_score": <integer 0-100>,
    "confidence_interval": {"lower": <int>, "upper": <int>},
    "risk_level": "low" | "moderate" | "high" | "critical",
    "primary_finding": "<main observation>",
    "feature_importance": [
        {"feature": "X-ray findings", "contribution": <0.0-1.0>, "description": "..."},
        {"feature": "Lung sounds", "contribution": <0.0-1.0>, "description": "..."},
        {"feature": "Vital signs", "contribution": <0.0-1.0>, "description": "..."}
    ],
    "modality_analysis": {
        "radiological": {"findings": "...", "confidence": <int>},
        "auscultation": {"findings": "...", "confidence": <int>},
        "vitals": {"interpretation": "...", "alerts": [...]}
    },
    "differential_considerations": [
        {"condition": "...", "probability": "..."}
    ],
    "clinical_reasoning": "<step-by-step reasoning>",
    "recommended_actions": ["...", "..."],
    "limitations": ["AI analysis may miss findings", "Requires clinical correlation"]
}

CRITICAL: This is for research/demonstration only. Include appropriate caveats.
"""
    
    contents = [
        f"Patient Data: Age {vitals.get('age', 'unknown')}, {vitals.get('gender', 'unknown')}. "
        f"Vitals: Temp {vitals.get('temperature', 'N/A')}°C, SpO2 {vitals.get('spo2', 'N/A')}%, "
        f"HR {vitals.get('heartRate', 'N/A')} bpm, BP {vitals.get('bloodPressure', 'N/A')}",
        raw_image,
    ]
    
    if audio_bytes:
        contents.append(types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav"))
    
    contents.append("Generate a clinical risk assessment with feature importance analysis.")
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=sys_instruct,
            temperature=0.2,
        ),
        contents=contents
    )
    
    return parse_gemini_response(response.text)

def parse_gemini_response(response_text):
    """Extract JSON from Gemini response"""
    try:
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        return {"raw_response": response_text, "risk_score": 50}
    except json.JSONDecodeError:
        return {"raw_response": response_text, "risk_score": 50}

def get_professional_mock_result(sample_type, vitals):
    """Return professional mock result with feature importance"""
    temp = float(vitals.get('temperature', 37))
    spo2 = int(vitals.get('spo2', 95))
    
    is_abnormal = sample_type == 'pneumonia' or temp > 38 or spo2 < 94
    
    if is_abnormal:
        return {
            "risk_score": 78,
            "confidence_interval": {"lower": 71, "upper": 85},
            "risk_level": "high",
            "primary_finding": "Findings consistent with Community-Acquired Pneumonia",
            "feature_importance": [
                {
                    "feature": "Radiological Findings",
                    "contribution": 0.45,
                    "description": "Right lower lobe consolidation with air bronchograms"
                },
                {
                    "feature": "Auscultation Findings", 
                    "contribution": 0.30,
                    "description": "Late inspiratory crackles in right lower lung field"
                },
                {
                    "feature": "Vital Sign Abnormalities",
                    "contribution": 0.25,
                    "description": f"Fever ({temp}°C), Hypoxemia (SpO2 {spo2}%)"
                }
            ],
            "modality_analysis": {
                "radiological": {
                    "findings": "Consolidation observed in right lower lobe with air bronchograms. Minor pleural effusion noted. Cardiac silhouette within normal limits.",
                    "confidence": 82
                },
                "auscultation": {
                    "findings": "Late inspiratory crackles (rales) detected in right lower lung field. Decreased breath sounds over affected area.",
                    "confidence": 75
                },
                "vitals": {
                    "interpretation": f"Febrile state ({temp}°C) consistent with infection. Hypoxemia (SpO2 {spo2}%) indicating respiratory compromise.",
                    "alerts": ["Temperature elevated", "SpO2 below normal"]
                }
            },
            "differential_considerations": [
                {"condition": "Bacterial Pneumonia", "probability": "75%"},
                {"condition": "Viral Pneumonia", "probability": "15%"},
                {"condition": "Acute Bronchitis", "probability": "7%"},
                {"condition": "Other", "probability": "3%"}
            ],
            "clinical_reasoning": "The combination of localized consolidation on chest X-ray with corresponding crackles on auscultation, combined with fever and hypoxemia, yields a high risk score for pneumonia. The unilateral presentation and air bronchograms are characteristic of lobar pneumonia.",
            "recommended_actions": [
                "Consider sputum culture and sensitivity if not already obtained",
                "CBC with differential and inflammatory markers (CRP/PCT)",
                "Evaluate need for empiric antibiotic therapy",
                "Supplemental oxygen to maintain SpO2 > 94%",
                "Clinical correlation and specialist consultation recommended"
            ],
            "limitations": [
                "AI analysis may miss subtle findings",
                "Results require clinical correlation",
                "Not validated for clinical decision-making",
                "Audio quality may affect auscultation analysis"
            ]
        }
    else:
        return {
            "risk_score": 12,
            "confidence_interval": {"lower": 8, "upper": 18},
            "risk_level": "low",
            "primary_finding": "No significant abnormalities detected",
            "feature_importance": [
                {
                    "feature": "Radiological Findings",
                    "contribution": 0.40,
                    "description": "Clear lung fields bilaterally, no consolidation"
                },
                {
                    "feature": "Auscultation Findings",
                    "contribution": 0.35,
                    "description": "Normal vesicular breath sounds throughout"
                },
                {
                    "feature": "Vital Signs",
                    "contribution": 0.25,
                    "description": "All vitals within normal physiological ranges"
                }
            ],
            "modality_analysis": {
                "radiological": {
                    "findings": "Clear lung fields bilaterally. No consolidation, effusion, or masses identified. Cardiac silhouette normal.",
                    "confidence": 90
                },
                "auscultation": {
                    "findings": "Vesicular breath sounds heard bilaterally. Good air entry. No adventitious sounds detected.",
                    "confidence": 88
                },
                "vitals": {
                    "interpretation": f"Temperature normal ({temp}°C). Oxygen saturation excellent ({spo2}%).",
                    "alerts": []
                }
            },
            "differential_considerations": [
                {"condition": "Healthy/Normal Study", "probability": "88%"},
                {"condition": "Early/Subclinical Process", "probability": "8%"},
                {"condition": "Technical Limitation", "probability": "4%"}
            ],
            "clinical_reasoning": "Clear lung parenchyma on imaging with bilateral vesicular breath sounds and normal vital signs. Multimodal correlation confirms low risk for acute respiratory pathology.",
            "recommended_actions": [
                "No immediate intervention indicated",
                "Routine health maintenance as appropriate",
                "Return if new symptoms develop"
            ],
            "limitations": [
                "AI analysis may miss subtle findings",
                "Results require clinical correlation",
                "Not validated for clinical decision-making"
            ]
        }

# ============================================
# Main Entry Point
# ============================================
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 VITAL-LINK Server v2.0 (Professional Medical API)")
    print("="*60)
    print(f"📁 Working directory: {Path(__file__).parent}")
    print(f"🔑 API Key: {'Configured ✅' if API_KEY else 'Not found ❌'}")
    print(f"🎯 Clinical Scope: {CLINICAL_SCOPE['target_condition']}")
    print(f"⚠️  {CLINICAL_SCOPE['disclaimer']}")
    print("="*60)
    print("📡 Available Endpoints:")
    print("   GET  /api/health          - Health check with clinical info")
    print("   POST /api/session/create  - Create analysis session")
    print("   GET  /api/session/{id}    - Get session data")
    print("   POST /api/validate-vitals - Validate vital signs")
    print("   POST /api/upload-xray     - Upload X-ray image")
    print("   POST /api/upload-audio    - Upload lung audio")
    print("   POST /api/analyze         - Run multimodal analysis")
    print("="*60)
    print("🌐 Open http://localhost:5000 in your browser")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
