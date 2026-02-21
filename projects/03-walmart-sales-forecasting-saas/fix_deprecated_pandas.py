#!/usr/bin/env python3
"""
Fix deprecated pandas fillna(method=) syntax across the codebase
"""

import re
import os
import sys

def fix_fillna_method(file_path):
    """Replace deprecated fillna(method='bfill') with bfill()"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace fillna(method='bfill') with bfill()
        content = re.sub(
            r'\.fillna\(method=[\'"]bfill[\'"]\)',
            '.bfill()',
            content
        )
        
        # Replace fillna(method='ffill') with ffill()
        content = re.sub(
            r'\.fillna\(method=[\'"]ffill[\'"]\)',
            '.ffill()',
            content
        )
        
        # Replace fillna(method='ffill', limit=X) with ffill(limit=X)
        content = re.sub(
            r'\.fillna\(method=[\'"]ffill[\'"],\s*limit=(\d+)\)',
            r'.ffill(limit=\1)',
            content
        )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Find and fix all deprecated fillna calls"""
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    fixed_count = 0
    for root, dirs, files in os.walk(backend_dir):
        # Skip __pycache__ and venv
        dirs[:] = [d for d in dirs if d not in ['__pycache__', 'venv', '.venv', 'node_modules']]
        
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                if fix_fillna_method(file_path):
                    fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} files")
    return 0 if fixed_count >= 0 else 1

if __name__ == '__main__':
    sys.exit(main())
