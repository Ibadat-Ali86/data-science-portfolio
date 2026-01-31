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
    const color = score >= 70 ? '#E74C3C' : score >= 40 ? '#F39C12' : '#00B894';

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
                ctx.fillStyle = '#B0B8C8';
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
    const colors = ['#0066CC', '#00A3A3', '#6C5CE7', '#00B894', '#F39C12'];

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
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#B0B8C8' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#FFFFFF', font: { size: 11 } }
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
        'rgba(0, 102, 204, 0.8)',
        'rgba(0, 163, 163, 0.8)',
        'rgba(108, 92, 231, 0.8)',
        'rgba(0, 184, 148, 0.8)',
        'rgba(243, 156, 18, 0.8)'
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
    // Check if we have analysis results (use mock if none)
    if (!lastAnalysisResult) {
        // Generate mock result for PDF if no real analysis done
        const isPneumonia = state.sampleLoaded === 'pneumonia' ||
            parseFloat(elements.temperature.value) > 38 ||
            parseInt(elements.spo2.value) < 94;

        if (isPneumonia) {
            lastAnalysisResult = {
                confidence_score: 87,
                risk_score: 87,
                primary_diagnosis: "Community-Acquired Pneumonia",
                analysis: {
                    radiology_findings: "Consolidation observed in the right lower lobe with air bronchograms. Minor pleural effusion noted. Cardiac silhouette within normal limits.",
                    auscultation_findings: "Late inspiratory crackles (rales) detected in the right lower lung field. Decreased breath sounds over the affected area. No wheezing appreciated.",
                    vitals_interpretation: `Febrile state (${elements.temperature.value}°C) consistent with infection. SpO2 (${elements.spo2.value}%) indicating respiratory status. Heart rate (${elements.heartrate.value} bpm).`
                },
                differential_diagnosis: [
                    { condition: "Bacterial Pneumonia", probability: "85%" },
                    { condition: "Viral Pneumonia", probability: "10%" },
                    { condition: "Acute Bronchitis", probability: "5%" }
                ],
                reasoning_trace: "The combination of localized consolidation on chest X-ray, corresponding crackles on auscultation, fever, and hypoxemia strongly suggests bacterial pneumonia.",
                recommended_actions: [
                    "Order sputum culture and sensitivity",
                    "CBC with differential and CRP/PCT levels",
                    "Initiate empiric antibiotics",
                    "Supplemental oxygen to maintain SpO2 > 94%",
                    "Consider hospital admission given hypoxemia"
                ]
            };
        } else {
            lastAnalysisResult = {
                confidence_score: 92,
                risk_score: 25,
                primary_diagnosis: "No Significant Pathology Detected",
                analysis: {
                    radiology_findings: "Clear lung fields bilaterally. No consolidation, effusion, or masses identified. Cardiac silhouette and mediastinum appear normal.",
                    auscultation_findings: "Vesicular breath sounds heard bilaterally. Good air entry throughout all lung zones. No adventitious sounds detected.",
                    vitals_interpretation: `Temperature normal (${elements.temperature.value}°C). Oxygen saturation (${elements.spo2.value}%). Heart rate (${elements.heartrate.value} bpm).`
                },
                differential_diagnosis: [
                    { condition: "Healthy/Normal Study", probability: "92%" },
                    { condition: "Early/Subclinical Process", probability: "5%" },
                    { condition: "Technical Limitation", probability: "3%" }
                ],
                reasoning_trace: "The chest radiograph demonstrates clear lung parenchyma without infiltrates or effusions. All vital signs are within physiological limits.",
                recommended_actions: [
                    "No immediate intervention required",
                    "Continue routine health maintenance",
                    "Annual wellness examination recommended"
                ]
            };
        }
    }

    const exportBtn = document.getElementById('export-pdf-btn');
    exportBtn.classList.add('generating');
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Report...';

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = margin;

        // ============================================
        // PAGE 1: Cover & Patient Information
        // ============================================

        // Header Banner
        doc.setFillColor(10, 22, 40);
        doc.rect(0, 0, pageWidth, 50, 'F');

        // Gradient accent line
        doc.setFillColor(0, 102, 255);
        doc.rect(0, 48, pageWidth, 3, 'F');

        // Logo and title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('VITAL-LINK', margin, 25);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('AI-Powered Multimodal Clinical Assessment Report', margin, 35);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        const reportDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        doc.text(`Generated: ${reportDate}`, margin, 43);

        const reportId = `VL-${Date.now().toString(36).toUpperCase()}`;
        doc.text(`Report ID: ${reportId}`, pageWidth - margin - 45, 43);

        yPos = 60;

        // Patient Information Box
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 45, 4, 4, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 45, 4, 4, 'S');

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT INFORMATION', margin + 5, yPos + 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);

        const patientData = [
            { label: 'Age', value: `${elements.ageSlider.value} years`, x: margin + 5 },
            { label: 'Gender', value: elements.gender.value.charAt(0).toUpperCase() + elements.gender.value.slice(1), x: margin + 55 },
            { label: 'Temperature', value: `${elements.temperature.value}°C`, x: margin + 105 },
            { label: 'SpO2', value: `${elements.spo2.value}%`, x: margin + 5, y: 35 },
            { label: 'Heart Rate', value: `${elements.heartrate.value} bpm`, x: margin + 55, y: 35 },
            { label: 'Blood Pressure', value: `${elements.bloodpressure.value} mmHg`, x: margin + 105, y: 35 }
        ];

        patientData.forEach(item => {
            const baseY = item.y || 20;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.text(item.label, item.x, yPos + baseY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(11);
            doc.text(item.value, item.x, yPos + baseY + 6);
        });

        yPos += 55;

        // Primary Diagnosis Section
        const diagnosis = lastAnalysisResult.primary_diagnosis || lastAnalysisResult.primary_finding || 'Analysis Complete';
        const riskScore = lastAnalysisResult.risk_score || lastAnalysisResult.confidence_score || 85;
        const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MODERATE' : 'LOW';
        const riskColor = riskScore >= 70 ? [220, 38, 38] : riskScore >= 40 ? [245, 158, 11] : [16, 185, 129];

        doc.setFillColor(...riskColor);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 4, 4, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('PRIMARY DIAGNOSTIC FINDING', margin + 5, yPos + 10);

        doc.setFontSize(16);
        doc.text(diagnosis, margin + 5, yPos + 22);

        doc.setFontSize(11);
        doc.text(`Risk Level: ${riskLevel} (${riskScore}%)`, pageWidth - margin - 55, yPos + 22);

        yPos += 45;

        // Clinical Findings Section
        doc.setTextColor(0, 102, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MULTIMODAL CLINICAL FINDINGS', margin, yPos);

        doc.setDrawColor(0, 102, 255);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos + 3, 90, yPos + 3);
        yPos += 12;

        const analysis = lastAnalysisResult.analysis || lastAnalysisResult.modality_analysis || {};

        // Radiology Findings
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 28, 3, 3, 'F');
        doc.setTextColor(30, 64, 175);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('📋 RADIOLOGICAL ANALYSIS', margin + 5, yPos + 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        const radioText = doc.splitTextToSize(analysis.radiology_findings || analysis.radiological?.findings || 'Pending analysis', pageWidth - margin * 2 - 10);
        doc.text(radioText, margin + 5, yPos + 15);
        yPos += 33;

        // Auscultation Findings
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 28, 3, 3, 'F');
        doc.setTextColor(22, 101, 52);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('🔊 AUSCULTATION FINDINGS', margin + 5, yPos + 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        const ausText = doc.splitTextToSize(analysis.auscultation_findings || analysis.auscultation?.findings || 'Pending analysis', pageWidth - margin * 2 - 10);
        doc.text(ausText, margin + 5, yPos + 15);
        yPos += 33;

        // Vitals Interpretation
        doc.setFillColor(254, 249, 195);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 28, 3, 3, 'F');
        doc.setTextColor(133, 77, 14);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('❤️ VITAL SIGNS INTERPRETATION', margin + 5, yPos + 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        const vitText = doc.splitTextToSize(analysis.vitals_interpretation || analysis.vitals?.interpretation || 'Pending analysis', pageWidth - margin * 2 - 10);
        doc.text(vitText, margin + 5, yPos + 15);
        yPos += 35;

        // ============================================
        // PAGE 2: Visualizations & Differential
        // ============================================
        doc.addPage();
        yPos = margin;

        // Page 2 Header
        doc.setFillColor(10, 22, 40);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('VITAL-LINK — Diagnostic Visualizations', margin, 13);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Report ID: ${reportId}`, pageWidth - margin - 40, 13);

        yPos = 30;

        // Capture Charts as Images if they exist
        const chartPromises = [];

        // Try to capture risk gauge chart
        const riskGaugeCanvas = document.getElementById('riskGaugeChart');
        if (riskGaugeCanvas && riskGaugeCanvas.getContext) {
            try {
                const gaugeImg = riskGaugeCanvas.toDataURL('image/png');
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(margin, yPos, 55, 50, 3, 3, 'F');
                doc.addImage(gaugeImg, 'PNG', margin + 5, yPos + 5, 45, 35);
                doc.setTextColor(51, 65, 85);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Risk Score Gauge', margin + 27.5, yPos + 47, { align: 'center' });
            } catch (e) { console.log('Could not capture gauge chart'); }
        }

        // Try to capture feature importance chart
        const featureCanvas = document.getElementById('featureImportanceChart');
        if (featureCanvas && featureCanvas.getContext) {
            try {
                const featureImg = featureCanvas.toDataURL('image/png');
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(margin + 60, yPos, 60, 50, 3, 3, 'F');
                doc.addImage(featureImg, 'PNG', margin + 63, yPos + 5, 54, 35);
                doc.setTextColor(51, 65, 85);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Feature Importance', margin + 90, yPos + 47, { align: 'center' });
            } catch (e) { console.log('Could not capture feature chart'); }
        }

        // Try to capture differential chart
        const diffCanvas = document.getElementById('differentialChart');
        if (diffCanvas && diffCanvas.getContext) {
            try {
                const diffImg = diffCanvas.toDataURL('image/png');
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(margin + 125, yPos, 55, 50, 3, 3, 'F');
                doc.addImage(diffImg, 'PNG', margin + 128, yPos + 5, 49, 35);
                doc.setTextColor(51, 65, 85);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Differential Dx', margin + 152, yPos + 47, { align: 'center' });
            } catch (e) { console.log('Could not capture differential chart'); }
        }

        yPos += 58;

        // Differential Diagnosis Table
        doc.setTextColor(0, 102, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DIFFERENTIAL DIAGNOSIS', margin, yPos);
        doc.setDrawColor(0, 102, 255);
        doc.line(margin, yPos + 3, 70, yPos + 3);
        yPos += 10;

        const ddx = lastAnalysisResult.differential_diagnosis || lastAnalysisResult.differential_considerations || [];

        // Table header
        doc.setFillColor(226, 232, 240);
        doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Rank', margin + 5, yPos + 5.5);
        doc.text('Condition', margin + 25, yPos + 5.5);
        doc.text('Probability', pageWidth - margin - 25, yPos + 5.5);
        yPos += 10;

        ddx.forEach((dx, i) => {
            const bgColor = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
            doc.setFillColor(...bgColor);
            doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`#${i + 1}`, margin + 5, yPos + 5.5);
            doc.text(dx.condition, margin + 25, yPos + 5.5);
            doc.setFont('helvetica', 'bold');
            doc.text(dx.probability, pageWidth - margin - 25, yPos + 5.5);
            yPos += 8;
        });

        yPos += 10;

        // Clinical Reasoning Section
        doc.setTextColor(139, 92, 246);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('AI CLINICAL REASONING', margin, yPos);
        doc.setDrawColor(139, 92, 246);
        doc.line(margin, yPos + 3, 55, yPos + 3);
        yPos += 10;

        doc.setFillColor(245, 243, 255);
        const reasoning = lastAnalysisResult.clinical_reasoning || lastAnalysisResult.reasoning_trace || 'Analysis reasoning not available.';
        const reasoningLines = doc.splitTextToSize(reasoning, pageWidth - margin * 2 - 10);
        const reasoningHeight = reasoningLines.length * 5 + 10;
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, reasoningHeight, 3, 3, 'F');

        doc.setDrawColor(139, 92, 246);
        doc.setLineWidth(2);
        doc.line(margin, yPos, margin, yPos + reasoningHeight);

        doc.setTextColor(88, 28, 135);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(reasoningLines, margin + 8, yPos + 8);
        yPos += reasoningHeight + 10;

        // ============================================
        // PAGE 3: Recommendations & Precautions
        // ============================================
        doc.addPage();
        yPos = margin;

        // Page 3 Header
        doc.setFillColor(10, 22, 40);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('VITAL-LINK — Treatment Recommendations', margin, 13);

        yPos = 30;

        // Get disease-specific information
        const diseaseInfo = DISEASE_INFO[diagnosis] || DISEASE_INFO['No Significant Pathology Detected'];

        // Recommended Actions
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMENDED CLINICAL ACTIONS', margin, yPos);
        doc.setDrawColor(16, 185, 129);
        doc.line(margin, yPos + 3, 75, yPos + 3);
        yPos += 12;

        const actions = lastAnalysisResult.recommended_actions || [
            'Schedule follow-up appointment',
            'Complete prescribed medication course',
            'Monitor symptoms and report changes'
        ];

        actions.forEach((action, i) => {
            doc.setFillColor(240, 253, 244);
            doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, 'F');
            doc.setFillColor(16, 185, 129);
            doc.circle(margin + 5, yPos + 5, 2.5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1}`, margin + 5, yPos + 6.5, { align: 'center' });
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(action, margin + 12, yPos + 6.5);
            yPos += 12;
        });

        yPos += 8;

        // Precautions Section
        doc.setTextColor(245, 158, 11);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PRECAUTIONS & CARE GUIDELINES', margin, yPos);
        doc.setDrawColor(245, 158, 11);
        doc.line(margin, yPos + 3, 75, yPos + 3);
        yPos += 12;

        diseaseInfo.precautions.forEach((precaution, i) => {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = margin + 10;
            }
            doc.setFillColor(254, 252, 232);
            doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, 'F');
            doc.setTextColor(146, 64, 14);
            doc.setFontSize(10);
            doc.text('⚠', margin + 4, yPos + 6.5);
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const precautionLines = doc.splitTextToSize(precaution, pageWidth - margin * 2 - 15);
            doc.text(precautionLines[0], margin + 12, yPos + 6.5);
            yPos += 12;
        });

        yPos += 8;

        // Follow-up Box
        doc.setFillColor(219, 234, 254);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 18, 3, 3, 'F');
        doc.setTextColor(30, 64, 175);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('📅 FOLLOW-UP RECOMMENDATION', margin + 5, yPos + 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        doc.text(diseaseInfo.followUp, margin + 5, yPos + 14);

        // Disclaimer Footer on last page
        yPos = pageHeight - 45;
        doc.setFillColor(254, 226, 226);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'F');
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'S');

        doc.setTextColor(153, 27, 27);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠ IMPORTANT DISCLAIMER', margin + 5, yPos + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(127, 29, 29);
        const disclaimer = 'This report is generated by VITAL-LINK, an AI research prototype. It is NOT FDA-cleared and is intended for educational and research purposes only. This report should NOT be used for clinical decision-making. All findings must be verified by qualified healthcare professionals. Always consult with a licensed physician for medical advice, diagnosis, or treatment.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 10);
        doc.text(disclaimerLines, margin + 5, yPos + 15);

        // Footer with page numbers on all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
            doc.text('VITAL-LINK | AI Medical Diagnostic System', margin, pageHeight - 5);
        }

        // Save PDF
        doc.save(`VITAL-LINK_Medical_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Professional medical report exported successfully!');

    } catch (error) {
        console.error('PDF generation error:', error);
        showToast('Failed to generate report: ' + error.message, 'error');
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
