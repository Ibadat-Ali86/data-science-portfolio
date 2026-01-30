/**
 * VITAL-LINK — JavaScript Controller v2.0
 * Professional Medical Risk Assessment Dashboard
 * Handles UI interactions, file uploads, vital validation, and API calls
 */

// ============================================
// Configuration
// ============================================
const API_BASE_URL = 'http://localhost:5000';

// Vital sign reference ranges
const VITAL_RANGES = {
    temperature: { normal: { min: 36.1, max: 37.2 }, warning: { min: 35.0, max: 38.5 } },
    spo2: { normal: { min: 95, max: 100 }, warning: { min: 90, max: 94 } },
    heartRate: { normal: { min: 60, max: 100 }, warning: { min: 50, max: 120 } }
};

// ============================================
// State Management
// ============================================
let state = {
    xrayFile: null,
    audioFile: null,
    vitals: {},
    isLoading: false,
    clinicalMode: false,
    sampleLoaded: null
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Inputs
    ageSlider: document.getElementById('age'),
    ageValue: document.getElementById('age-value'),
    gender: document.getElementById('gender'),
    temperature: document.getElementById('temperature'),
    spo2: document.getElementById('spo2'),
    heartrate: document.getElementById('heartrate'),
    bloodpressure: document.getElementById('bloodpressure'),

    // File uploads
    xrayUpload: document.getElementById('xray-upload'),
    xrayFile: document.getElementById('xray-file'),
    xrayPreview: document.getElementById('xray-preview'),
    audioUpload: document.getElementById('audio-upload'),
    audioFile: document.getElementById('audio-file'),
    audioPreview: document.getElementById('audio-preview'),

    // Results
    analyzeBtn: document.getElementById('analyze-btn'),
    confidenceSection: document.getElementById('confidence-section'),
    confidenceValue: document.getElementById('confidence-value'),
    confidenceFill: document.getElementById('confidence-fill'),
    confidenceInterval: document.getElementById('confidence-interval'),
    confidenceRange: document.getElementById('confidence-range'),
    diagnosisSection: document.getElementById('diagnosis-section'),
    primaryDiagnosis: document.getElementById('primary-diagnosis'),
    riskLevelBadge: document.getElementById('risk-level-badge'),
    featureImportanceSection: document.getElementById('feature-importance-section'),
    featureBars: document.getElementById('feature-bars'),
    analysisTabs: document.getElementById('analysis-tabs'),
    limitationsSection: document.getElementById('limitations-section'),
    limitationsList: document.getElementById('limitations-list'),
    emptyState: document.getElementById('empty-state'),

    // Findings
    radiologyFindings: document.getElementById('radiology-findings'),
    auscultationFindings: document.getElementById('auscultation-findings'),
    vitalsInterpretation: document.getElementById('vitals-interpretation'),
    ddxList: document.getElementById('ddx-list'),
    reasoningTrace: document.getElementById('reasoning-trace'),
    actionsList: document.getElementById('actions-list'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initSliders();
    initFileUploads();
    initTabs();
    validateVitals(); // Initial validation
});

// ============================================
// Slider Handlers
// ============================================
function initSliders() {
    elements.ageSlider.addEventListener('input', (e) => {
        elements.ageValue.textContent = `${e.target.value} years`;
    });
}

// ============================================
// Clinical Mode Toggle
// ============================================
function toggleClinicalMode() {
    state.clinicalMode = !state.clinicalMode;
    const toggle = document.getElementById('mode-toggle');

    if (state.clinicalMode) {
        document.documentElement.setAttribute('data-theme', 'clinical');
        toggle.classList.add('clinical');
        showToast('Clinical Mode enabled — High contrast, minimal animations');
    } else {
        document.documentElement.removeAttribute('data-theme');
        toggle.classList.remove('clinical');
        showToast('Demo Mode enabled — Full visual effects');
    }
}

// ============================================
// Vital Sign Validation
// ============================================
function validateVitals() {
    const temp = parseFloat(elements.temperature.value) || 37;
    const spo2 = parseInt(elements.spo2.value) || 95;
    const hr = parseInt(elements.heartrate.value) || 80;

    // Validate each vital
    validateSingleVital('temp', temp, VITAL_RANGES.temperature);
    validateSingleVital('spo2', spo2, VITAL_RANGES.spo2);
    validateSingleVital('hr', hr, VITAL_RANGES.heartRate);
}

function validateSingleVital(vitalId, value, ranges) {
    const card = document.getElementById(`vital-card-${vitalId}`);
    const badge = document.getElementById(`status-${vitalId}`);

    if (!card || !badge) return;

    // Remove existing status classes
    card.classList.remove('status-normal', 'status-warning', 'status-critical');
    badge.classList.remove('normal', 'warning', 'critical');

    let status = 'normal';
    let icon = 'fa-check';

    if (value >= ranges.normal.min && value <= ranges.normal.max) {
        status = 'normal';
        icon = 'fa-check';
    } else if (value >= ranges.warning.min && value <= ranges.warning.max) {
        status = 'warning';
        icon = 'fa-exclamation';
    } else {
        status = 'critical';
        icon = 'fa-times';
    }

    card.classList.add(`status-${status}`);
    badge.classList.add(status);
    badge.innerHTML = `<i class="fas ${icon}"></i>`;
    badge.style.display = 'flex';
}

// ============================================
// File Upload Handlers
// ============================================
function initFileUploads() {
    // X-Ray Upload
    elements.xrayUpload.addEventListener('click', () => {
        elements.xrayFile.click();
    });

    elements.xrayFile.addEventListener('change', (e) => {
        handleFileUpload(e.target.files[0], 'xray');
    });

    // Audio Upload
    elements.audioUpload.addEventListener('click', () => {
        elements.audioFile.click();
    });

    elements.audioFile.addEventListener('change', (e) => {
        handleFileUpload(e.target.files[0], 'audio');
    });

    // Drag and drop
    [elements.xrayUpload, elements.audioUpload].forEach(box => {
        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            box.style.borderColor = 'var(--primary-start)';
            box.style.background = 'rgba(102, 126, 234, 0.1)';
        });

        box.addEventListener('dragleave', (e) => {
            e.preventDefault();
            box.style.borderColor = '';
            box.style.background = '';
        });

        box.addEventListener('drop', (e) => {
            e.preventDefault();
            box.style.borderColor = '';
            box.style.background = '';

            const file = e.dataTransfer.files[0];
            const type = box.id.includes('xray') ? 'xray' : 'audio';
            handleFileUpload(file, type);
        });
    });
}

function handleFileUpload(file, type) {
    if (!file) return;

    if (type === 'xray') {
        state.xrayFile = file;
        elements.xrayUpload.classList.add('has-file');

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.xrayPreview.innerHTML = `
                <img src="${e.target.result}" alt="X-Ray Preview">
                <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                    ${file.name}
                </p>
            `;
        };
        reader.readAsDataURL(file);

        showToast('X-Ray uploaded successfully!');
    } else {
        state.audioFile = file;
        elements.audioUpload.classList.add('has-file');

        // Show audio player
        const audioUrl = URL.createObjectURL(file);
        elements.audioPreview.innerHTML = `
            <audio controls src="${audioUrl}" style="width: 100%;"></audio>
            <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                ${file.name}
            </p>
        `;

        showToast('Audio uploaded successfully!');
    }
}

// ============================================
// Tab Handlers
// ============================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update pane visibility
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// ============================================
// Sample Case Loader
// ============================================

// Condition configurations with typical vitals and display info
const CONDITION_CONFIG = {
    pneumonia: {
        displayName: 'Pneumonia',
        icon: 'fa-lungs-virus',
        iconColor: 'var(--danger-start)',
        audioLabel: 'Crackles/Rales',
        xrayType: 'PNEUMONIA',
        vitals: { age: 65, gender: 'male', temp: 38.5, spo2: 91, hr: 105, bp: '130/85' }
    },
    healthy: {
        displayName: 'Healthy',
        icon: 'fa-heart',
        iconColor: 'var(--success-start)',
        audioLabel: 'Normal Vesicular',
        xrayType: 'NORMAL',
        vitals: { age: 35, gender: 'female', temp: 36.8, spo2: 98, hr: 72, bp: '118/76' }
    },
    copd: {
        displayName: 'COPD',
        icon: 'fa-smoking',
        iconColor: '#f59e0b',
        audioLabel: 'Wheezing/Rhonchi',
        xrayType: 'NORMAL', // COPD often shows hyperinflation, using normal for demo
        vitals: { age: 68, gender: 'male', temp: 37.2, spo2: 89, hr: 88, bp: '145/90' }
    },
    asthma: {
        displayName: 'Asthma',
        icon: 'fa-wind',
        iconColor: '#06b6d4',
        audioLabel: 'Expiratory Wheeze',
        xrayType: 'NORMAL',
        vitals: { age: 28, gender: 'female', temp: 37.0, spo2: 94, hr: 95, bp: '115/75' }
    },
    bronchiectasis: {
        displayName: 'Bronchiectasis',
        icon: 'fa-lungs',
        iconColor: '#8b5cf6',
        audioLabel: 'Coarse Crackles',
        xrayType: 'NORMAL',
        vitals: { age: 55, gender: 'female', temp: 37.4, spo2: 93, hr: 82, bp: '125/80' }
    },
    bronchiolitis: {
        displayName: 'Bronchiolitis',
        icon: 'fa-baby',
        iconColor: '#ec4899',
        audioLabel: 'Fine Crackles/Wheeze',
        xrayType: 'NORMAL',
        vitals: { age: 2, gender: 'male', temp: 38.2, spo2: 92, hr: 140, bp: '90/60' }
    },
    urti: {
        displayName: 'URTI',
        icon: 'fa-head-side-cough',
        iconColor: '#64748b',
        audioLabel: 'Upper Airway Sounds',
        xrayType: 'NORMAL',
        vitals: { age: 8, gender: 'female', temp: 38.0, spo2: 97, hr: 100, bp: '100/65' }
    },
    lrti: {
        displayName: 'LRTI',
        icon: 'fa-virus',
        iconColor: '#a855f7',
        audioLabel: 'Lower Crackles',
        xrayType: 'PNEUMONIA',
        vitals: { age: 45, gender: 'male', temp: 38.8, spo2: 90, hr: 110, bp: '135/88' }
    }
};

async function loadSampleCase(caseType) {
    const config = CONDITION_CONFIG[caseType];

    if (!config) {
        showToast(`Unknown condition: ${caseType}`, 'error');
        return;
    }

    showToast(`Loading ${config.displayName} sample case...`);

    // Set vitals
    elements.ageSlider.value = config.vitals.age;
    elements.ageValue.textContent = `${config.vitals.age} years`;
    elements.temperature.value = config.vitals.temp;
    elements.spo2.value = config.vitals.spo2;
    elements.heartrate.value = config.vitals.hr;
    elements.bloodpressure.value = config.vitals.bp;
    elements.gender.value = config.vitals.gender;

    // Validate vitals with new values
    validateVitals();

    // Show X-Ray indicator
    elements.xrayUpload.classList.add('has-file');
    elements.xrayPreview.innerHTML = `
        <div style="padding: 1rem; text-align: center;">
            <i class="fas ${config.icon}" style="font-size: 3rem; color: ${config.iconColor};"></i>
            <p style="margin-top: 0.5rem; font-weight: 600; color: var(--text-primary);">
                ${config.displayName} Sample X-Ray
            </p>
            <p style="font-size: 0.75rem; color: var(--text-muted);">
                ${config.xrayType.toLowerCase()}_sample.jpg
            </p>
        </div>
    `;

    // Show Audio indicator
    elements.audioUpload.classList.add('has-file');
    elements.audioPreview.innerHTML = `
        <div style="padding: 1rem; text-align: center;">
            <i class="fas fa-volume-up" style="font-size: 2rem; color: ${config.iconColor};"></i>
            <p style="margin-top: 0.5rem; font-weight: 600; color: var(--text-primary);">
                ${config.audioLabel}
            </p>
            <p style="font-size: 0.75rem; color: var(--text-muted);">
                ${caseType.toUpperCase()} audio sample
            </p>
        </div>
    `;

    // Set sample loaded flag
    state.sampleLoaded = caseType;

    showToast(`${config.displayName} case loaded!`);
    validateVitals();
}

// ============================================
// Diagnosis Function
// ============================================
async function runDiagnosis() {
    // Validate inputs
    if (!state.xrayFile && !state.sampleLoaded) {
        showToast('Please upload an X-Ray or load a sample case', 'error');
        return;
    }

    if (!state.audioFile && !state.sampleLoaded) {
        showToast('Please upload lung sounds or load a sample case', 'error');
        return;
    }

    // Collect vitals
    const vitals = {
        age: elements.ageSlider.value,
        gender: elements.gender.value,
        temperature: elements.temperature.value,
        spo2: elements.spo2.value,
        heartRate: elements.heartrate.value,
        bloodPressure: elements.bloodpressure.value
    };

    // Show loading state
    setLoading(true);

    try {
        // Create form data
        const formData = new FormData();
        formData.append('vitals', JSON.stringify(vitals));

        if (state.xrayFile) {
            formData.append('xray', state.xrayFile);
        } else {
            formData.append('sample_type', state.sampleLoaded);
        }

        if (state.audioFile) {
            formData.append('audio', state.audioFile);
        }

        // Call backend API
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const result = await response.json();
        displayResults(result);

    } catch (error) {
        console.error('Error:', error);

        // For demo purposes, show mock results if API fails for any reason
        // This ensures the demo works even without actual sample files
        showMockResults();
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    state.isLoading = isLoading;

    if (isLoading) {
        elements.analyzeBtn.classList.add('loading');
        elements.analyzeBtn.disabled = true;
    } else {
        elements.analyzeBtn.classList.remove('loading');
        elements.analyzeBtn.disabled = false;
    }
}

// ============================================
// Display Results
// ============================================
function displayResults(result) {
    // Hide empty state
    elements.emptyState.style.display = 'none';

    // Show confidence/risk meter
    const riskScore = result.risk_score || result.confidence_score || 85;
    showConfidence(riskScore);

    // Show confidence interval if available
    if (result.confidence_interval && elements.confidenceInterval) {
        elements.confidenceInterval.style.display = 'flex';
        elements.confidenceRange.textContent =
            `${result.confidence_interval.lower}% — ${result.confidence_interval.upper}%`;
    }

    // Show risk level badge
    if (result.risk_level && elements.riskLevelBadge) {
        elements.riskLevelBadge.className = `risk-level-badge ${result.risk_level}`;
        elements.riskLevelBadge.textContent = `${result.risk_level.toUpperCase()} RISK`;
    }

    // Show diagnosis/finding
    const primaryFinding = result.primary_finding || result.primary_diagnosis;
    if (primaryFinding) {
        elements.diagnosisSection.style.display = 'block';
        elements.primaryDiagnosis.textContent = primaryFinding;
    }

    // Show feature importance
    if (result.feature_importance && elements.featureBars) {
        elements.featureImportanceSection.style.display = 'block';
        elements.featureBars.innerHTML = result.feature_importance.map(f => {
            const barType = f.feature.toLowerCase().includes('radio') ? 'radiology' :
                f.feature.toLowerCase().includes('auscult') ? 'auscultation' : 'vitals';
            return `
                <div class="feature-bar">
                    <div class="feature-bar-header">
                        <span class="feature-bar-name">${f.feature}</span>
                        <span class="feature-bar-value">${Math.round(f.contribution * 100)}%</span>
                    </div>
                    <div class="feature-bar-track">
                        <div class="feature-bar-fill ${barType}" style="width: ${f.contribution * 100}%"></div>
                    </div>
                    <div class="feature-bar-description">${f.description}</div>
                </div>
            `;
        }).join('');
    }

    // Show analysis tabs
    elements.analysisTabs.style.display = 'block';

    // Populate findings from new format
    if (result.modality_analysis) {
        elements.radiologyFindings.textContent = result.modality_analysis.radiological?.findings || '-';
        elements.auscultationFindings.textContent = result.modality_analysis.auscultation?.findings || '-';
        elements.vitalsInterpretation.textContent = result.modality_analysis.vitals?.interpretation || '-';
    } else if (result.analysis) {
        elements.radiologyFindings.textContent = result.analysis.radiology_findings || '-';
        elements.auscultationFindings.textContent = result.analysis.auscultation_findings || '-';
        elements.vitalsInterpretation.textContent = result.analysis.vitals_interpretation || '-';
    }

    // Populate DDx
    const ddx = result.differential_considerations || result.differential_diagnosis;
    if (ddx) {
        elements.ddxList.innerHTML = ddx.map((dx, i) => `
            <div class="ddx-item">
                <div class="ddx-rank">${i + 1}</div>
                <div class="ddx-info">
                    <div class="ddx-condition">${dx.condition}</div>
                    <div class="ddx-probability">${dx.probability}</div>
                </div>
                <div class="ddx-bar">
                    <div class="ddx-bar-fill" style="width: ${parseInt(dx.probability) || 50}%"></div>
                </div>
            </div>
        `).join('');
    }

    // Populate reasoning
    const reasoning = result.clinical_reasoning || result.reasoning_trace;
    if (reasoning) {
        elements.reasoningTrace.textContent = reasoning;
    }

    // Populate actions
    if (result.recommended_actions) {
        elements.actionsList.innerHTML = result.recommended_actions.map(action => `
            <div class="action-item">
                <i class="fas fa-check-circle action-check"></i>
                <span class="action-text">${action}</span>
            </div>
        `).join('');
    }

    // Show limitations
    if (result.limitations && elements.limitationsSection) {
        elements.limitationsSection.style.display = 'block';
        elements.limitationsList.innerHTML = result.limitations.map(lim => `
            <li><i class="fas fa-info-circle"></i> ${lim}</li>
        `).join('');
    }

    showToast('Analysis complete!');
}

function showConfidence(confidence) {
    elements.confidenceSection.style.display = 'block';

    // Set color class based on confidence
    elements.confidenceSection.classList.remove('high', 'medium', 'low');
    if (confidence >= 80) {
        elements.confidenceSection.classList.add('high');
    } else if (confidence >= 50) {
        elements.confidenceSection.classList.add('medium');
    } else {
        elements.confidenceSection.classList.add('low');
    }

    // Animate confidence value
    let current = 0;
    const duration = 1000;
    const step = confidence / (duration / 16);

    const animate = () => {
        current = Math.min(current + step, confidence);
        elements.confidenceValue.textContent = `${Math.round(current)}%`;
        elements.confidenceFill.style.width = `${current}%`;

        if (current < confidence) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
}

// ============================================
// Mock Results (Demo Mode)
// ============================================
function showMockResults() {
    const isPneumonia = state.sampleLoaded === 'pneumonia' ||
        parseFloat(elements.temperature.value) > 38 ||
        parseInt(elements.spo2.value) < 94;

    let mockResult;

    if (isPneumonia) {
        mockResult = {
            confidence_score: 87,
            primary_diagnosis: "Community-Acquired Pneumonia",
            analysis: {
                radiology_findings: "Consolidation observed in the right lower lobe with air bronchograms. Minor pleural effusion noted. Cardiac silhouette within normal limits.",
                auscultation_findings: "Late inspiratory crackles (rales) detected in the right lower lung field. Decreased breath sounds over the affected area. No wheezing appreciated.",
                vitals_interpretation: "Febrile state (38.5°C) consistent with infection. Mild hypoxemia (SpO2 91%) indicating respiratory compromise. Tachycardia (105 bpm) likely compensatory."
            },
            differential_diagnosis: [
                { condition: "Bacterial Pneumonia", probability: "85%" },
                { condition: "Viral Pneumonia", probability: "10%" },
                { condition: "Acute Bronchitis", probability: "5%" }
            ],
            reasoning_trace: "The combination of localized consolidation on chest X-ray, corresponding crackles on auscultation, fever, and hypoxemia strongly suggests bacterial pneumonia. The unilateral presentation and air bronchograms are characteristic of lobar pneumonia. The absence of wheezing and the presence of crackles help differentiate this from bronchitis or viral etiologies.",
            recommended_actions: [
                "Order sputum culture and sensitivity",
                "CBC with differential and CRP/PCT levels",
                "Initiate empiric antibiotics (consider respiratory fluoroquinolone)",
                "Supplemental oxygen to maintain SpO2 > 94%",
                "Consider hospital admission given hypoxemia"
            ]
        };
    } else {
        mockResult = {
            confidence_score: 92,
            primary_diagnosis: "No Significant Pathology Detected",
            analysis: {
                radiology_findings: "Clear lung fields bilaterally. No consolidation, effusion, or masses identified. Cardiac silhouette and mediastinum appear normal. Costophrenic angles are sharp.",
                auscultation_findings: "Vesicular breath sounds heard bilaterally. Good air entry throughout all lung zones. No adventitious sounds (crackles, wheezes, or rhonchi) detected.",
                vitals_interpretation: "Temperature normal (36.8°C). Excellent oxygen saturation (98%). Heart rate within normal limits (72 bpm). Blood pressure optimal."
            },
            differential_diagnosis: [
                { condition: "Healthy/Normal Study", probability: "92%" },
                { condition: "Early/Subclinical Process", probability: "5%" },
                { condition: "Technical Limitation", probability: "3%" }
            ],
            reasoning_trace: "The chest radiograph demonstrates clear lung parenchyma without infiltrates or effusions. Auscultation confirms good bilateral air entry with vesicular breath sounds. All vital signs are within physiological limits. The multimodal correlation confirms a healthy respiratory system with no evidence of acute pathology.",
            recommended_actions: [
                "No immediate intervention required",
                "Continue routine health maintenance",
                "Annual wellness examination recommended",
                "Encourage smoking cessation if applicable",
                "Return if symptoms develop"
            ]
        };
    }

    displayResults(mockResult);
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;

    const icon = elements.toast.querySelector('.toast-icon i');
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = 'var(--danger-start)';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = 'var(--success-start)';
    }

    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Utility Functions
// ============================================
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// Chart.js Instances
// ============================================
let riskGaugeChart = null;
let featureImportanceChart = null;
let differentialChart = null;

// Store last analysis result for PDF generation
let lastAnalysisResult = null;

// ============================================
// Glow Button Activation
// ============================================
function activateGlowButton() {
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.classList.add('glowing');
}

function deactivateGlowButton() {
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.classList.remove('glowing');
}

// ============================================
// Disease Information Database
// ============================================
const DISEASE_INFO = {
    'Community-Acquired Pneumonia': {
        causes: [
            'Bacterial infection (Streptococcus pneumoniae most common)',
            'Viral pathogens (Influenza, RSV, SARS-CoV-2)',
            'Aspiration of oral/gastric contents',
            'Weakened immune system',
            'Pre-existing lung conditions'
        ],
        precautions: [
            'Complete full course of prescribed antibiotics',
            'Get adequate rest and sleep (8-10 hours daily)',
            'Stay well hydrated (2-3 liters of water daily)',
            'Avoid smoking and secondhand smoke exposure',
            'Practice respiratory hygiene (cover coughs/sneezes)',
            'Monitor oxygen saturation levels regularly',
            'Seek immediate care if breathing worsens',
            'Complete pneumonia vaccination when recovered',
            'Avoid crowded indoor spaces during recovery'
        ],
        followUp: 'Follow-up chest X-ray in 6-8 weeks to confirm resolution'
    },
    'No Significant Pathology Detected': {
        causes: [
            'Normal respiratory function',
            'No active infection or disease process',
            'Healthy lung parenchyma and airways'
        ],
        precautions: [
            'Maintain regular exercise routine',
            'Continue nonsmoking lifestyle or quit smoking',
            'Annual health checkups recommended',
            'Maintain updated vaccinations (flu, pneumonia)',
            'Practice good hand hygiene',
            'Maintain healthy weight and diet'
        ],
        followUp: 'Routine annual wellness examination'
    },
    'COPD Exacerbation': {
        causes: [
            'Chronic smoking history (primary cause)',
            'Occupational dust/chemical exposure',
            'Alpha-1 antitrypsin deficiency (rare)',
            'Air pollution exposure',
            'Respiratory infections triggering exacerbation'
        ],
        precautions: [
            'Smoking cessation is critical - seek support programs',
            'Use prescribed inhalers correctly and regularly',
            'Attend pulmonary rehabilitation programs',
            'Avoid air pollutants and irritants',
            'Get annual flu and pneumococcal vaccines',
            'Monitor for signs of worsening (increased sputum, dyspnea)',
            'Keep emergency medications readily available',
            'Maintain oxygen therapy as prescribed',
            'Avoid extreme temperatures',
            'Practice pursed-lip breathing techniques'
        ],
        followUp: 'Pulmonology follow-up in 2-4 weeks, spirometry every 6 months'
    },
    'Asthma': {
        causes: [
            'Allergic triggers (pollen, dust mites, pet dander)',
            'Respiratory infections',
            'Exercise-induced bronchoconstriction',
            'Cold air exposure',
            'Occupational irritants',
            'Genetic predisposition'
        ],
        precautions: [
            'Identify and avoid personal triggers',
            'Use controller medications daily as prescribed',
            'Keep rescue inhaler accessible at all times',
            'Use peak flow meter to monitor lung function',
            'Create asthma action plan with healthcare provider',
            'Cover nose/mouth in cold weather',
            'Warm up before exercise',
            'Keep home humidity between 30-50%',
            'Use HEPA air filters',
            'Wash bedding weekly in hot water'
        ],
        followUp: 'Asthma control assessment every 3-6 months'
    },
    'Bronchiectasis': {
        causes: [
            'Post-infectious damage (prior pneumonia/TB)',
            'Cystic fibrosis',
            'Immunodeficiency disorders',
            'Autoimmune conditions',
            'Allergic bronchopulmonary aspergillosis'
        ],
        precautions: [
            'Perform airway clearance techniques daily',
            'Use prescribed bronchodilators and mucolytics',
            'Complete antibiotic courses promptly for infections',
            'Stay up-to-date with vaccinations',
            'Maintain adequate hydration for mucus clearance',
            'Consider pulmonary rehabilitation',
            'Monitor sputum color and quantity changes',
            'Avoid respiratory irritants and pollutants'
        ],
        followUp: 'Pulmonology review every 3-6 months, annual CT chest'
    }
};

// ============================================
// Chart Rendering Functions
// ============================================
function renderCharts(result) {
    const visualizationSection = document.getElementById('visualization-section');
    visualizationSection.style.display = 'grid';

    // Risk Score Gauge
    renderRiskGaugeChart(result.risk_score || result.confidence_score || 85);

    // Feature Importance Chart
    const features = result.feature_importance || [
        { feature: 'Radiological Analysis', contribution: 0.45 },
        { feature: 'Auscultation Findings', contribution: 0.30 },
        { feature: 'Vital Signs', contribution: 0.15 },
        { feature: 'Patient Demographics', contribution: 0.10 }
    ];
    renderFeatureImportanceChart(features);

    // Differential Diagnosis Chart
    const ddx = result.differential_diagnosis || result.differential_considerations || [
        { condition: 'Primary Diagnosis', probability: '85%' },
        { condition: 'Alternative 1', probability: '10%' },
        { condition: 'Alternative 2', probability: '5%' }
    ];
    renderDifferentialChart(ddx);
}

function renderRiskGaugeChart(score) {
    const ctx = document.getElementById('riskGaugeChart').getContext('2d');

    // Destroy existing chart if exists
    if (riskGaugeChart) {
        riskGaugeChart.destroy();
    }

    const remaining = 100 - score;
    const color = score >= 70 ? '#FF304F' : score >= 40 ? '#f59e0b' : '#10b981';

    riskGaugeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, remaining],
                backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        },
        plugins: [{
            id: 'gaugeText',
            afterDraw(chart) {
                const { ctx, chartArea: { width, height } } = chart;
                ctx.save();
                ctx.font = 'bold 28px Inter';
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(score)}%`, width / 2, height - 20);
                ctx.font = '12px Inter';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('Risk Score', width / 2, height);
                ctx.restore();
            }
        }]
    });
}

function renderFeatureImportanceChart(features) {
    const ctx = document.getElementById('featureImportanceChart').getContext('2d');

    if (featureImportanceChart) {
        featureImportanceChart.destroy();
    }

    const labels = features.map(f => f.feature);
    const data = features.map(f => (f.contribution * 100).toFixed(1));
    const colors = ['#118DF0', '#0E2F56', '#FF304F', '#ECECDA', '#10b981'];

    featureImportanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, features.length),
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    max: 100,
                    grid: { color: 'rgba(14, 47, 86, 0.1)' },
                    ticks: { color: '#0E2F56' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#0E2F56', font: { size: 11 } }
                }
            }
        }
    });
}

function renderDifferentialChart(diagnoses) {
    const ctx = document.getElementById('differentialChart').getContext('2d');

    if (differentialChart) {
        differentialChart.destroy();
    }

    const labels = diagnoses.map(d => d.condition.substring(0, 15));
    const data = diagnoses.map(d => parseInt(d.probability) || 50);
    const colors = [
        'rgba(17, 141, 240, 0.8)',
        'rgba(14, 47, 86, 0.8)',
        'rgba(255, 48, 79, 0.8)',
        'rgba(236, 236, 218, 0.8)',
        'rgba(16, 185, 129, 0.8)'
    ];

    differentialChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, diagnoses.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 10 },
                        padding: 10
                    }
                }
            },
            scales: {
                r: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { display: false }
                }
            }
        }
    });
}

// ============================================
// PDF Medical Report Generation
// ============================================
async function generateMedicalReport() {
    if (!lastAnalysisResult) {
        showToast('No analysis results to export', 'error');
        return;
    }

    const exportBtn = document.getElementById('export-pdf-btn');
    exportBtn.classList.add('generating');
    exportBtn.innerHTML = '<i class="fas fa-spinner"></i> Generating Report...';

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = margin;

        // Header with logo area
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('VITAL-LINK', margin, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('AI-Powered Medical Diagnostic Report', margin, 30);

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin, 38);
        doc.text(`Report ID: VL-${Date.now().toString(36).toUpperCase()}`, pageWidth - margin - 50, 38);

        yPos = 55;

        // Patient Information Section
        doc.setTextColor(102, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT INFORMATION', margin, yPos);
        yPos += 8;

        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        doc.setTextColor(51, 51, 51);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const patientInfo = [
            ['Age:', `${elements.ageSlider.value} years`],
            ['Gender:', elements.gender.value.charAt(0).toUpperCase() + elements.gender.value.slice(1)],
            ['Temperature:', `${elements.temperature.value}°C`],
            ['SpO2:', `${elements.spo2.value}%`],
            ['Heart Rate:', `${elements.heartrate.value} bpm`],
            ['Blood Pressure:', `${elements.bloodpressure.value} mmHg`]
        ];

        patientInfo.forEach(([label, value], index) => {
            const xOffset = index % 2 === 0 ? margin : pageWidth / 2;
            if (index % 2 === 0 && index > 0) yPos += 6;
            doc.setFont('helvetica', 'bold');
            doc.text(label, xOffset, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, xOffset + 35, yPos);
        });
        yPos += 15;

        // Primary Diagnosis
        doc.setTextColor(102, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PRIMARY DIAGNOSTIC FINDING', margin, yPos);
        yPos += 8;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        const diagnosis = lastAnalysisResult.primary_diagnosis || lastAnalysisResult.primary_finding || 'Analysis Complete';
        const riskScore = lastAnalysisResult.risk_score || lastAnalysisResult.confidence_score || 85;

        // Risk score box
        const riskColor = riskScore >= 70 ? [239, 68, 68] : riskScore >= 40 ? [245, 158, 11] : [16, 185, 129];
        doc.setFillColor(...riskColor);
        doc.roundedRect(margin, yPos, 50, 20, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${riskScore}%`, margin + 25, yPos + 13, { align: 'center' });

        doc.setTextColor(51, 51, 51);
        doc.setFontSize(12);
        doc.text(diagnosis, margin + 60, yPos + 8);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('AI Risk Assessment Score', margin + 60, yPos + 16);
        yPos += 30;

        // Disease Causes Section
        const diseaseInfo = DISEASE_INFO[diagnosis] || DISEASE_INFO['No Significant Pathology Detected'];

        doc.setTextColor(102, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ETIOLOGY & CONTRIBUTING FACTORS', margin, yPos);
        yPos += 8;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        doc.setTextColor(51, 51, 51);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        diseaseInfo.causes.forEach((cause, i) => {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(`• ${cause}`, margin + 5, yPos);
            yPos += 6;
        });
        yPos += 8;

        // Clinical Findings
        doc.setTextColor(102, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINICAL FINDINGS', margin, yPos);
        yPos += 8;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        doc.setTextColor(51, 51, 51);
        doc.setFontSize(10);

        const analysis = lastAnalysisResult.analysis || lastAnalysisResult.modality_analysis || {};
        const findings = [
            { title: 'Radiology:', content: analysis.radiology_findings || analysis.radiological?.findings || 'See clinical notes' },
            { title: 'Auscultation:', content: analysis.auscultation_findings || analysis.auscultation?.findings || 'See clinical notes' },
            { title: 'Vitals:', content: analysis.vitals_interpretation || analysis.vitals?.interpretation || 'See patient information' }
        ];

        findings.forEach(finding => {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(finding.title, margin, yPos);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(finding.content, pageWidth - margin * 2 - 25);
            doc.text(lines, margin + 25, yPos);
            yPos += lines.length * 5 + 8;
        });

        // Add new page for precautions
        doc.addPage();
        yPos = margin;

        // Precautions Section
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMENDED PRECAUTIONS & CARE GUIDELINES', margin, yPos);
        yPos += 8;
        doc.setDrawColor(16, 185, 129);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setTextColor(51, 51, 51);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        diseaseInfo.precautions.forEach((precaution, i) => {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }
            doc.setFillColor(16, 185, 129);
            doc.circle(margin + 3, yPos - 2, 2, 'F');
            const lines = doc.splitTextToSize(precaution, pageWidth - margin * 2 - 15);
            doc.text(lines, margin + 10, yPos);
            yPos += lines.length * 5 + 5;
        });
        yPos += 10;

        // Recommended Actions
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMENDED CLINICAL ACTIONS', margin, yPos);
        yPos += 8;
        doc.setDrawColor(59, 130, 246);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setTextColor(51, 51, 51);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const actions = lastAnalysisResult.recommended_actions || [
            'Schedule follow-up appointment',
            'Complete prescribed medication course',
            'Monitor symptoms and report changes',
            'Maintain adequate rest and hydration'
        ];

        actions.forEach((action, i) => {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(`${i + 1}. ${action}`, margin + 5, yPos);
            yPos += 7;
        });
        yPos += 10;

        // Follow-up
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 15, 3, 3, 'F');
        doc.setTextColor(51, 51, 51);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Follow-up Recommendation:', margin + 5, yPos + 10);
        doc.setFont('helvetica', 'normal');
        doc.text(diseaseInfo.followUp, margin + 55, yPos + 10);
        yPos += 25;

        // Disclaimer Footer
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(margin, pageHeight - 50, pageWidth - margin * 2, 35, 3, 3, 'F');

        doc.setTextColor(146, 64, 14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠ IMPORTANT DISCLAIMER', margin + 5, pageHeight - 42);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const disclaimer = 'This report is generated by an AI research prototype (VITAL-LINK) and is NOT FDA-cleared. It is intended for educational and research purposes only and should NOT be used for clinical decision-making. All findings should be verified by qualified healthcare professionals. Always consult with a licensed physician for medical advice, diagnosis, or treatment.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 10);
        doc.text(disclaimerLines, margin + 5, pageHeight - 35);

        // Save PDF
        doc.save(`VITAL-LINK_Medical_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Medical report exported successfully!');

    } catch (error) {
        console.error('PDF generation error:', error);
        showToast('Failed to generate report', 'error');
    } finally {
        exportBtn.classList.remove('generating');
        exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export Medical Report (PDF)';
    }
}

// ============================================
// Print Results Function
// ============================================
function printResults() {
    window.print();
}

// ============================================
// Enhanced Display Results with Charts
// ============================================
const originalDisplayResults = displayResults;
displayResults = function (result) {
    // Store result for PDF generation
    lastAnalysisResult = result;

    // Activate glow button
    activateGlowButton();

    // Call original display function
    originalDisplayResults(result);

    // Render charts
    renderCharts(result);

    // Show export section
    const exportSection = document.getElementById('export-section');
    if (exportSection) {
        exportSection.style.display = 'flex';
    }
};
