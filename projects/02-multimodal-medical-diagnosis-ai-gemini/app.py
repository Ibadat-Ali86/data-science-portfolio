"""
🏥 Project VITAL-LINK
Multimodal Clinical Reasoning Dashboard
Built for the Gemini Hackathon

This application uses Google's Gemini 2.0 Flash model to perform
multimodal medical diagnosis by correlating:
- Chest X-Ray images
- Lung auscultation audio
- Patient vital signs
"""

import streamlit as st
import os
import json
import re
import PIL.Image
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- 1. CONFIGURATION & CLIENT ---
from google import genai
from google.genai import types

# Load API key from environment or file
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    # Try loading from api.txt as fallback
    api_file = Path(__file__).parent / "api.txt"
    if api_file.exists():
        API_KEY = api_file.read_text().strip()

if not API_KEY:
    st.error("⚠️ Please set your GEMINI_API_KEY environment variable or add it to api.txt")
    st.stop()

client = genai.Client(api_key=API_KEY)

# --- Page Configuration ---
st.set_page_config(
    page_title="VITAL-LINK | Medical AI",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS for Premium Look ---
st.markdown("""
<style>
    /* Main container styling */
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    
    /* Header styling */
    .stTitle {
        color: #1E40AF;
        font-weight: 700;
    }
    
    /* Card-like containers */
    .css-1r6slb0 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 20px;
    }
    
    /* Confidence meter styling */
    .confidence-high {
        color: #10B981;
        font-weight: bold;
        font-size: 1.5rem;
    }
    .confidence-medium {
        color: #F59E0B;
        font-weight: bold;
        font-size: 1.5rem;
    }
    .confidence-low {
        color: #EF4444;
        font-weight: bold;
        font-size: 1.5rem;
    }
    
    /* Sample case buttons */
    .stButton > button {
        width: 100%;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    /* Sidebar styling */
    .css-1d391kg {
        background: linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%);
    }
    
    /* Metrics styling */
    .css-1xarl3l {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        border-radius: 10px;
        padding: 15px;
    }
</style>
""", unsafe_allow_html=True)


# --- 2. SAMPLE DATA PATHS ---
SAMPLES_DIR = Path(__file__).parent / "data" / "samples"
PNEUMONIA_DIR = SAMPLES_DIR / "PNEUMONIA"
NORMAL_DIR = SAMPLES_DIR / "NORMAL"
AUDIO_DIR = SAMPLES_DIR / "AUDIO"


def get_sample_files(category: str):
    """Get available sample files for a category."""
    if category == "pneumonia":
        img_dir = PNEUMONIA_DIR
    else:
        img_dir = NORMAL_DIR
    
    images = list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.jpeg")) + list(img_dir.glob("*.png"))
    audios = list(AUDIO_DIR.glob("*.wav")) + list(AUDIO_DIR.glob("*.mp3"))
    
    return images, audios


# --- 3. BACKEND FUNCTION ---
def analyze_patient_data(xray_file, audio_file, vitals_data):
    """
    Send multimodal data to Gemini for clinical analysis.
    Returns both the analysis text and a confidence score.
    """
    # Process Image
    if hasattr(xray_file, 'read'):
        raw_image = PIL.Image.open(xray_file)
    else:
        raw_image = PIL.Image.open(xray_file)
    
    # Process Audio
    if hasattr(audio_file, 'read'):
        audio_bytes = audio_file.read()
        # Reset file pointer if needed
        if hasattr(audio_file, 'seek'):
            audio_file.seek(0)
    else:
        with open(audio_file, "rb") as f:
            audio_bytes = f.read()

    # System instruction for clinical analysis with JSON confidence
    sys_instruct = """
You are a Senior Medical Consultant AI. Analyze the provided chest X-ray image, 
lung auscultation audio, and patient vitals to provide a comprehensive clinical assessment.

Your response MUST be in the following JSON format:
{
    "confidence_score": <integer 0-100>,
    "primary_diagnosis": "<diagnosis name>",
    "analysis": {
        "radiology_findings": "<detailed X-ray analysis>",
        "auscultation_findings": "<detailed audio analysis>",
        "vitals_interpretation": "<interpretation of vital signs>",
        "correlation": "<how findings correlate across modalities>"
    },
    "differential_diagnosis": [
        {"condition": "<condition 1>", "probability": "<percentage>"},
        {"condition": "<condition 2>", "probability": "<percentage>"}
    ],
    "reasoning_trace": "<step-by-step clinical reasoning explaining your conclusion>",
    "recommended_actions": ["<action 1>", "<action 2>", "<action 3>"]
}

Be thorough, professional, and evidence-based in your analysis.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=sys_instruct,
                temperature=0.2,
            ),
            contents=[
                f"Patient Vitals: Age: {vitals_data['Age']}, Gender: {vitals_data['Gender']}, "
                f"Temperature: {vitals_data['Temp']}°C, SpO2: {vitals_data['SpO2']}%, "
                f"Heart Rate: {vitals_data.get('HeartRate', 'N/A')} bpm, "
                f"Blood Pressure: {vitals_data.get('BP', 'N/A')}",
                raw_image,
                types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav"),
                "Perform a comprehensive multimodal clinical correlation analysis. "
                "Does the audio correlate with the X-ray findings? What is your diagnosis?"
            ]
        )
        return response.text
    except Exception as e:
        return json.dumps({"error": str(e), "confidence_score": 0})


def parse_response(response_text: str):
    """Parse the JSON response from Gemini."""
    try:
        # Try to extract JSON from the response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        return {"raw_response": response_text, "confidence_score": 75}
    except json.JSONDecodeError:
        return {"raw_response": response_text, "confidence_score": 75}


def display_confidence_meter(confidence: int):
    """Display a visual confidence meter."""
    if confidence >= 80:
        color_class = "confidence-high"
        emoji = "🟢"
        label = "High Confidence"
    elif confidence >= 50:
        color_class = "confidence-medium"
        emoji = "🟡"
        label = "Moderate Confidence"
    else:
        color_class = "confidence-low"
        emoji = "🔴"
        label = "Low Confidence"
    
    st.markdown(f"""
    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); border-radius: 15px; margin: 10px 0;">
        <h3 style="color: white; margin-bottom: 10px;">AI Confidence Score</h3>
        <div class="{color_class}" style="font-size: 3rem;">{emoji} {confidence}%</div>
        <p style="color: #93C5FD;">{label}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Progress bar
    st.progress(confidence / 100)


def display_analysis_results(parsed_response: dict):
    """Display the analysis results in a professional format."""
    
    if "error" in parsed_response:
        st.error(f"Analysis Error: {parsed_response['error']}")
        return
    
    if "raw_response" in parsed_response:
        st.markdown(parsed_response["raw_response"])
        return
    
    # Display primary diagnosis
    if "primary_diagnosis" in parsed_response:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); 
                    padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
            <h2 style="color: white; margin: 0;">🩺 Primary Diagnosis</h2>
            <h1 style="color: white; margin: 10px 0;">{parsed_response['primary_diagnosis']}</h1>
        </div>
        """, unsafe_allow_html=True)
    
    # Display analysis tabs
    tab1, tab2, tab3, tab4 = st.tabs(["📋 Analysis", "🔬 Differential Diagnosis", "🧠 Reasoning", "📌 Actions"])
    
    with tab1:
        if "analysis" in parsed_response:
            analysis = parsed_response["analysis"]
            
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("#### 🫁 Radiology Findings")
                st.info(analysis.get("radiology_findings", "N/A"))
                
                st.markdown("#### 🎧 Auscultation Findings")
                st.info(analysis.get("auscultation_findings", "N/A"))
            
            with col2:
                st.markdown("#### 💓 Vitals Interpretation")
                st.info(analysis.get("vitals_interpretation", "N/A"))
                
                st.markdown("#### 🔗 Cross-Modal Correlation")
                st.success(analysis.get("correlation", "N/A"))
    
    with tab2:
        if "differential_diagnosis" in parsed_response:
            st.markdown("#### Differential Diagnosis (DDx)")
            for i, dx in enumerate(parsed_response["differential_diagnosis"], 1):
                prob = dx.get("probability", "N/A")
                st.markdown(f"**{i}. {dx.get('condition', 'Unknown')}** — {prob}")
                if isinstance(prob, str) and "%" in prob:
                    try:
                        prob_value = int(prob.replace("%", ""))
                        st.progress(prob_value / 100)
                    except:
                        pass
    
    with tab3:
        if "reasoning_trace" in parsed_response:
            st.markdown("#### 🧠 Clinical Reasoning Trace")
            st.markdown(f"> {parsed_response['reasoning_trace']}")
    
    with tab4:
        if "recommended_actions" in parsed_response:
            st.markdown("#### 📌 Recommended Next Steps")
            for action in parsed_response["recommended_actions"]:
                st.markdown(f"- ✅ {action}")


# --- 4. UI FRONTEND ---
st.title("🏥 Project VITAL-LINK")
st.markdown("### Multimodal Clinical Reasoning Dashboard")
st.markdown("*Powered by Google Gemini 2.0 Flash*")
st.divider()

# --- Sidebar ---
with st.sidebar:
    st.image("https://img.icons8.com/color/96/health-checkup.png", width=80)
    st.header("🩺 Patient Intake")
    
    # Sample Case Buttons (The "Wow" Factor!)
    st.markdown("---")
    st.subheader("📂 Quick Load Sample Cases")
    st.caption("Pre-loaded cases for demonstration")
    
    col_sample1, col_sample2 = st.columns(2)
    
    # Initialize session state
    if 'sample_xray' not in st.session_state:
        st.session_state.sample_xray = None
    if 'sample_audio' not in st.session_state:
        st.session_state.sample_audio = None
    if 'sample_loaded' not in st.session_state:
        st.session_state.sample_loaded = False
    
    with col_sample1:
        if st.button("🦠 Pneumonia Case", use_container_width=True):
            images, audios = get_sample_files("pneumonia")
            if images and audios:
                st.session_state.sample_xray = images[0]
                st.session_state.sample_audio = audios[0]
                st.session_state.sample_loaded = True
                st.session_state.sample_type = "Pneumonia"
                st.success("✅ Loaded!")
            else:
                st.warning("No sample files found. Please add files to data/samples/")
    
    with col_sample2:
        if st.button("💚 Normal Case", use_container_width=True):
            images, audios = get_sample_files("normal")
            if images and audios:
                st.session_state.sample_xray = images[0]
                st.session_state.sample_audio = audios[0]
                st.session_state.sample_loaded = True
                st.session_state.sample_type = "Normal"
                st.success("✅ Loaded!")
            else:
                st.warning("No sample files found. Please add files to data/samples/")
    
    st.markdown("---")
    
    # Patient Vitals Input
    st.subheader("📊 Patient Vitals")
    age = st.slider("Patient Age", 0, 100, 45)
    gender = st.selectbox("Gender", ["Male", "Female", "Other"])
    temp = st.number_input("Temperature (°C)", min_value=35.0, max_value=42.0, value=37.5, step=0.1)
    spo2 = st.slider("SpO2 (%)", 80, 100, 95)
    heart_rate = st.slider("Heart Rate (bpm)", 40, 180, 80)
    bp_sys = st.number_input("Systolic BP (mmHg)", min_value=60, max_value=250, value=120)
    bp_dia = st.number_input("Diastolic BP (mmHg)", min_value=40, max_value=150, value=80)
    
    vitals = {
        "Age": age,
        "Gender": gender,
        "Temp": temp,
        "SpO2": spo2,
        "HeartRate": heart_rate,
        "BP": f"{bp_sys}/{bp_dia}"
    }
    
    st.markdown("---")
    st.subheader("📤 Upload Custom Files")
    uploaded_xray = st.file_uploader("Upload Chest X-Ray", type=['jpg', 'jpeg', 'png'])
    uploaded_audio = st.file_uploader("Upload Lung Sounds", type=['wav', 'mp3'])


# --- Main Panel ---
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("📷 Input Visualizations")
    
    # Determine which files to display (uploaded or sample)
    display_xray = uploaded_xray or (st.session_state.sample_xray if st.session_state.sample_loaded else None)
    display_audio = uploaded_audio or (st.session_state.sample_audio if st.session_state.sample_loaded else None)
    
    if display_xray:
        if st.session_state.sample_loaded and not uploaded_xray:
            st.image(str(st.session_state.sample_xray), caption=f"Chest X-Ray (Sample: {st.session_state.sample_type})", use_container_width=True)
        else:
            st.image(uploaded_xray, caption="Chest X-Ray (Uploaded)", use_container_width=True)
    else:
        st.info("📤 Upload or load a sample X-ray to visualize")
    
    if display_audio:
        if st.session_state.sample_loaded and not uploaded_audio:
            st.audio(str(st.session_state.sample_audio))
            st.caption(f"🎧 Auscultation Recording (Sample: {st.session_state.sample_type})")
        else:
            st.audio(uploaded_audio)
            st.caption("🎧 Auscultation Recording (Uploaded)")
    else:
        st.info("📤 Upload or load sample lung sounds to visualize")
    
    # Display vitals summary
    st.markdown("#### 📊 Vitals Summary")
    vitals_cols = st.columns(3)
    with vitals_cols[0]:
        st.metric("🌡️ Temp", f"{temp}°C", delta="Normal" if 36.5 <= temp <= 37.5 else "Abnormal")
    with vitals_cols[1]:
        st.metric("💓 SpO2", f"{spo2}%", delta="Normal" if spo2 >= 95 else "Low")
    with vitals_cols[2]:
        st.metric("❤️ HR", f"{heart_rate} bpm", delta="Normal" if 60 <= heart_rate <= 100 else "Abnormal")


with col2:
    st.subheader("🤖 AI Clinical Reasoning")
    
    # Analysis button
    analysis_xray = uploaded_xray or (st.session_state.sample_xray if st.session_state.sample_loaded else None)
    analysis_audio = uploaded_audio or (st.session_state.sample_audio if st.session_state.sample_loaded else None)
    
    if st.button("🚀 Run Multi-Modal Diagnostic", type="primary", use_container_width=True):
        if analysis_xray and analysis_audio:
            with st.spinner("🧠 Gemini 2.0 Flash is correlating medical data..."):
                try:
                    # REAL CALL TO GEMINI
                    result = analyze_patient_data(analysis_xray, analysis_audio, vitals)
                    parsed = parse_response(result)
                    
                    # Display confidence meter
                    confidence = parsed.get("confidence_score", 75)
                    display_confidence_meter(confidence)
                    
                    # Display full analysis
                    st.success("✅ Analysis Complete")
                    display_analysis_results(parsed)
                    
                except Exception as e:
                    st.error(f"❌ Error during analysis: {e}")
        else:
            st.error("⚠️ Please upload or load both X-Ray and Audio files to begin analysis.")
    
    # Info box when no analysis yet
    if not st.session_state.get('analysis_done', False):
        st.info("👆 Click the button above to start the AI analysis after loading files.")


# --- Professional Footer ---
st.divider()
st.markdown("""
<div style="text-align: center; padding: 20px; color: #6B7280;">
    <p><strong>🏥 VITAL-LINK</strong> — Multimodal Clinical Reasoning AI</p>
    <p>Built for the <strong>Google Gemini Hackathon 2026</strong></p>
    <p style="font-size: 0.8rem;">⚠️ This is an AI research prototype for educational purposes only. Not intended for clinical use.</p>
    <p style="font-size: 0.8rem;">Powered by Google Gemini 2.0 Flash | Made with ❤️ by Ibadat</p>
</div>
""", unsafe_allow_html=True)
