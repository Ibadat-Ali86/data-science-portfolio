#!/usr/bin/env python3
"""
Sample Extraction Script for VITAL-LINK
Extracts diverse audio AND X-ray samples from the Kaggle datasets
organized by condition type.
"""

import os
import shutil
import csv
from pathlib import Path
import random

# Configuration
AUDIO_SOURCE = Path.home() / ".cache/kagglehub/datasets/vbookshelf/respiratory-sound-database/versions/2/Respiratory_Sound_Database/Respiratory_Sound_Database/audio_and_txt_files"
XRAY_SOURCE = Path.home() / ".cache/kagglehub/datasets/paultimothymooney/chest-xray-pneumonia/versions/2/chest_xray"
DIAGNOSIS_FILE = Path.home() / ".cache/kagglehub/datasets/vbookshelf/respiratory-sound-database/versions/2/Respiratory_Sound_Database/Respiratory_Sound_Database/patient_diagnosis.csv"

# Output directories
OUTPUT_DIR = Path(__file__).parent / "data" / "samples"
AUDIO_BY_CONDITION = OUTPUT_DIR / "AUDIO_BY_CONDITION"
XRAY_BY_CONDITION = OUTPUT_DIR / "XRAY_BY_CONDITION"

# Number of samples to extract per condition
SAMPLES_PER_CONDITION = 3

# X-ray mapping: which source folder to use for each condition
# Based on clinical correlation (Pneumonia/LRTI show infiltrates, others typically normal or specific patterns)
XRAY_SOURCE_MAP = {
    'Pneumonia': 'PNEUMONIA',      # Definite pneumonia findings
    'LRTI': 'PNEUMONIA',           # Lower respiratory often shows infiltrates
    'Bronchiolitis': 'PNEUMONIA',  # Often shows hyperinflation/patches
    'Healthy': 'NORMAL',           # Normal lungs
    'COPD': 'NORMAL',              # Hyperinflation but no infiltrates
    'Asthma': 'NORMAL',            # Usually normal between attacks
    'Bronchiectasis': 'NORMAL',    # Specific patterns but using normal for demo
    'URTI': 'NORMAL'               # Upper respiratory, lungs usually clear
}


def load_diagnosis_map():
    """Load patient ID to diagnosis mapping."""
    diagnosis_map = {}
    with open(DIAGNOSIS_FILE, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 2:
                patient_id = row[0].strip()
                diagnosis = row[1].strip()
                diagnosis_map[patient_id] = diagnosis
    return diagnosis_map


def get_audio_files_by_condition(diagnosis_map):
    """Group audio files by condition."""
    condition_files = {}
    
    for wav_file in AUDIO_SOURCE.glob("*.wav"):
        patient_id = wav_file.name.split("_")[0]
        
        if patient_id in diagnosis_map:
            condition = diagnosis_map[patient_id]
            if condition not in condition_files:
                condition_files[condition] = []
            condition_files[condition].append(wav_file)
    
    return condition_files


def extract_samples():
    """Extract audio and X-ray samples from each condition."""
    print("=" * 60)
    print("🏥 VITAL-LINK Sample Extraction Script v2.0")
    print("   Now with matching X-ray images!")
    print("=" * 60)
    
    # Load diagnosis mapping
    print("\n📋 Loading patient diagnosis data...")
    diagnosis_map = load_diagnosis_map()
    print(f"   Found {len(diagnosis_map)} patients")
    
    # Get audio files grouped by condition
    print("\n🔍 Scanning audio files...")
    condition_files = get_audio_files_by_condition(diagnosis_map)
    
    print(f"\n📊 Conditions found:")
    for condition, files in sorted(condition_files.items()):
        xray_type = XRAY_SOURCE_MAP.get(condition, 'NORMAL')
        print(f"   • {condition}: {len(files)} audio files → X-ray type: {xray_type}")
    
    # Create output directories
    print("\n📁 Creating output directories...")
    for condition in condition_files.keys():
        audio_dir = AUDIO_BY_CONDITION / condition.upper().replace(" ", "_")
        xray_dir = XRAY_BY_CONDITION / condition.upper().replace(" ", "_")
        audio_dir.mkdir(parents=True, exist_ok=True)
        xray_dir.mkdir(parents=True, exist_ok=True)
    
    # Get all available X-ray files
    xray_pneumonia = list((XRAY_SOURCE / "train" / "PNEUMONIA").glob("*.jpeg"))
    xray_normal = list((XRAY_SOURCE / "train" / "NORMAL").glob("*.jpeg"))
    
    print(f"\n🩻 X-ray source files:")
    print(f"   Pneumonia: {len(xray_pneumonia)} images available")
    print(f"   Normal: {len(xray_normal)} images available")
    
    # Extract samples
    print(f"\n🎧 Extracting {SAMPLES_PER_CONDITION} samples per condition...")
    audio_count = 0
    xray_count = 0
    
    for condition, files in condition_files.items():
        audio_dir = AUDIO_BY_CONDITION / condition.upper().replace(" ", "_")
        xray_dir = XRAY_BY_CONDITION / condition.upper().replace(" ", "_")
        
        # Select audio samples
        sample_count = min(SAMPLES_PER_CONDITION, len(files))
        selected_audio = random.sample(files, sample_count)
        
        # Determine which X-ray source to use
        xray_source_type = XRAY_SOURCE_MAP.get(condition, 'NORMAL')
        xray_pool = xray_pneumonia if xray_source_type == 'PNEUMONIA' else xray_normal
        
        # Select X-ray samples (same count as audio)
        selected_xray = random.sample(xray_pool, min(sample_count, len(xray_pool)))
        
        # Copy audio files
        for wav_file in selected_audio:
            dest_file = audio_dir / wav_file.name
            shutil.copy2(wav_file, dest_file)
            audio_count += 1
        
        # Copy X-ray files with condition prefix
        for i, xray_file in enumerate(selected_xray):
            # Rename to include condition for clarity
            new_name = f"{condition.lower()}_{i+1}_{xray_file.name}"
            dest_file = xray_dir / new_name
            shutil.copy2(xray_file, dest_file)
            xray_count += 1
        
        print(f"   ✅ {condition}: {sample_count} audio + {len(selected_xray)} X-ray samples")
    
    # Summary
    print("\n" + "=" * 60)
    print(f"✅ Extraction complete!")
    print(f"   Total audio samples: {audio_count}")
    print(f"   Total X-ray samples: {xray_count}")
    print(f"   Output directory: {OUTPUT_DIR}")
    print("=" * 60)
    
    # Show final directory structure
    print("\n📂 Audio samples by condition:")
    for condition_dir in sorted(AUDIO_BY_CONDITION.iterdir()):
        if condition_dir.is_dir():
            count = len(list(condition_dir.glob("*.wav")))
            print(f"   {condition_dir.name}/: {count} files")
    
    print("\n📂 X-ray samples by condition:")
    for condition_dir in sorted(XRAY_BY_CONDITION.iterdir()):
        if condition_dir.is_dir():
            count = len(list(condition_dir.glob("*.jpeg")))
            print(f"   {condition_dir.name}/: {count} files")


if __name__ == "__main__":
    extract_samples()
