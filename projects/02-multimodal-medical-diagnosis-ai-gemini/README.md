<div align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/Flask-Server-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/Chart.js-Visualizations-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/jsPDF-Reports-red?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="jsPDF">
</div>

<div align="center">
  <h1>🏥 VITAL-LINK</h1>
  <h3>AI-Powered Multimodal Clinical Reasoning Platform</h3>
  <p><em>Revolutionizing medical diagnosis through intelligent fusion of X-ray, audio, and vital signs analysis</em></p>
  
  <p>
    <a href="#-features">Features</a> •
    <a href="#-demo">Demo</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-usage">Usage</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 🎯 Overview

**VITAL-LINK** is a cutting-edge medical diagnostic platform that leverages **Google Gemini 2.0 Flash** to perform sophisticated multimodal clinical reasoning. The system correlates multiple data sources to provide comprehensive diagnostic insights:

| Data Source | Analysis Type | Use Case |
|-------------|---------------|----------|
| 🫁 **Chest X-Ray** | Deep radiological analysis | Detect pneumonia, consolidations, effusions |
| 🎧 **Lung Sounds** | Audio pattern recognition | Identify crackles, wheezes, rhonchi |
| 📊 **Vital Signs** | Clinical context integration | Assess severity, risk stratification |

> ⚠️ **Disclaimer**: This is an AI research prototype for educational purposes only. NOT FDA-cleared or intended for clinical decision-making.

---

## ✨ Features

### 🧠 Core Intelligence
- **Multi-Modal Fusion**: Simultaneously analyzes visual, audio, and numerical data
- **Explainable AI**: Transparent reasoning trace for every diagnosis
- **Differential Diagnosis**: Ranked conditions with probability scores
- **Risk Stratification**: Automatic severity assessment

### 📊 Advanced Visualizations
- **Interactive Gauge Charts**: Real-time risk score visualization
- **Feature Importance Bars**: Understand which inputs drive predictions
- **Polar Area Charts**: Differential diagnosis comparison

### 📄 Professional Reporting
- **PDF Export**: Generate comprehensive medical reports
- **Detailed Precautions**: Disease-specific care guidelines
- **Clinical Actions**: Recommended follow-up steps

### 🎨 Premium User Experience
- **Animated Hero Title**: Engaging gradient shimmer effects
- **Background Video**: Professional medical-themed ambiance
- **Glowing Buttons**: Visual feedback on interactions
- **Dark Theme**: Modern, eye-friendly interface

---

## 🚀 Demo

### Quick Sample Cases
Load pre-configured sample cases with one click:

| Condition | Description |
|-----------|-------------|
| 🦠 **Pneumonia** | Community-acquired pneumonia case |
| 🌬️ **COPD** | Chronic obstructive pulmonary disease |
| 😮‍💨 **Asthma** | Bronchospasm with wheezing |
| ✅ **Healthy** | Normal respiratory baseline |
| 🤧 **URTI** | Upper respiratory tract infection |
| 🫁 **LRTI** | Lower respiratory tract infection |
| 🌿 **Bronchiectasis** | Chronic bronchial dilation |
| 🔥 **Bronchiolitis** | Small airway inflammation |

---

## 💻 Installation

### Prerequisites
- Python 3.10 or higher
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/VITAL-LINK.git
cd VITAL-LINK
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure API Key 🔐

> ⚠️ **IMPORTANT**: Never commit your API key to version control!

**Option A: Environment Variable (Recommended)**
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

**Option B: Create api.txt file**
```bash
echo "your_actual_api_key_here" > api.txt
```

**Option C: Copy .env.example**
```bash
cp .env.example .env
# Edit .env and replace placeholder with your key
```

---

## 🎮 Usage

### Start the Server
```bash
python server.py
```

### Access the Dashboard
Open your browser and navigate to:
```
http://localhost:5000
```

### Running Diagnosis
1. **Load Sample Case** or upload your own files
2. **Enter Patient Vitals** (age, temperature, SpO2, etc.)
3. **Click "Run Multi-Modal Diagnostic"**
4. **Review Results** with charts and reasoning
5. **Export PDF Report** for documentation

---

## 🏗️ Architecture

```
VITAL-LINK/
├── 🖥️ Frontend (Vanilla JS + HTML/CSS)
│   ├── index.html          # Main dashboard UI
│   ├── styles.css          # Professional styling (1800+ lines)
│   ├── script.js           # Client-side logic (1300+ lines)
│   ├── about.html          # About page
│   └── documentation.html  # API documentation
│
├── ⚙️ Backend (Flask + Python)
│   ├── server.py           # REST API server
│   └── app.py              # Streamlit alternative UI
│
├── 📁 Data & Samples
│   └── data/samples/       # Sample medical files
│       ├── PNEUMONIA/      # X-ray samples
│       ├── NORMAL/         # Healthy samples  
│       └── AUDIO/          # Lung sound samples
│
├── 📋 Configuration
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # API key template
│   └── .gitignore          # Git exclusions
│
└── 📚 Documentation
    ├── README.md           # This file
    └── Hackathon.ipynb     # Development notebook
```

---

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **AI Engine** | Google Gemini 2.0 Flash | Multimodal reasoning |
| **Backend** | Flask + Python 3.10+ | REST API server |
| **Frontend** | HTML5, CSS3, JavaScript | User interface |
| **Charts** | Chart.js 4.4 | Data visualization |
| **PDF** | jsPDF 2.5 + html2canvas | Report generation |
| **Styling** | Custom CSS + Glassmorphism | Premium aesthetics |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check with system status |
| `POST` | `/api/session/create` | Create analysis session |
| `POST` | `/api/validate-vitals` | Validate vital sign inputs |
| `POST` | `/api/upload-xray` | Upload X-ray image |
| `POST` | `/api/upload-audio` | Upload lung audio |
| `POST` | `/api/analyze` | Run multimodal diagnosis |

---

## 🏆 Key Innovations

### 1. Multimodal Fusion Intelligence
Correlates three distinct data modalities for comprehensive diagnosis—going beyond single-input AI systems.

### 2. Explainable Clinical Reasoning
Every prediction comes with a transparent reasoning trace, building trust with healthcare professionals.

### 3. Zero-Friction Demo Experience
Pre-loaded sample cases enable instant demonstration without requiring medical data uploads.

### 4. Professional PDF Reports
Generate detailed medical reports with disease causes, precautions, and clinical actions—ready for documentation.

### 5. Premium Visual Design
Medical-grade UI with animations, glassmorphism, and dark theme for optimal user experience.

---

## 🔐 Security Notice

This project is designed with security in mind:

- ✅ API keys are **never committed** to version control
- ✅ `.gitignore` excludes sensitive files (`api.txt`, `.env`)
- ✅ Environment variables preferred for production
- ✅ `.env.example` contains only **placeholder** values

**For your own deployment:**
1. Generate your own Gemini API key
2. Never share your API key publicly
3. Use environment variables in production

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ibadat**

- 🎓 Developed for Google Gemini Hackathon 2026
- 🏥 Focused on medical AI innovation

---

## 🙏 Acknowledgments

- **Google Gemini Team** for the powerful multimodal AI API
- **Chart.js** for beautiful data visualizations
- **jsPDF** for PDF report generation
- **Open Source Community** for inspiration and tools

---

<div align="center">
  <p><strong>⭐ Star this repository if you find it helpful!</strong></p>
  <p>Made with ❤️ for advancing medical AI</p>
  
  <img src="https://img.shields.io/badge/Made%20with-Python-1f425f.svg?style=flat-square" alt="Made with Python">
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-blue?style=flat-square" alt="Powered by Gemini">
</div>
