import os
import re

FRONTEND_DIR = r"d:\RINKY YADAV\Internship\GYM GURU\frontend"
BACKEND_DIR = r"d:\RINKY YADAV\Internship\GYM GURU\backend"

REPLACEMENTS = {
    "bg-slate-900": "bg-slate-50",
    "from-slate-900": "from-slate-50",
    "to-black": "to-gray-200",
    "UNLOX": "GYM GURU",
    "Unlox": "Gym Guru",
    "unlox_token": "gym_guru_token"  # Safely rename the token so "unlox" is fully gone
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content

        for old, new in REPLACEMENTS.items():
            content = content.replace(old, new)
            
        # Handle text-white to text-slate-900 separately carefully
        # Simple replace for text-white/50 etc.
        content = content.replace("text-white/50", "text-slate-900/50")
        content = content.replace("text-white/60", "text-slate-900/60")
        content = content.replace("text-white/40", "text-slate-900/40")
        content = content.replace("text-white/30", "text-slate-900/30")
        content = content.replace("text-white/20", "text-slate-900/20")
        content = content.replace("text-white/10", "text-slate-900/10")
        content = content.replace("text-white/5", "text-slate-900/5")
        
        # for plain "text-white", let's replace unless it's in a button. Actually standard replace is what user asked.
        # to avoid breaking colored buttons, we can just do broad replacement and see if there are visual issues. 
        # The instructions say "Search for text-white and replace it with text-slate-900 (you might need to do this carefully so you don't break button text, which should remain white on colored backgrounds)."
        # Let's replace text-white with text-slate-900 EXCEPT when preceded or followed by specific button classes... 
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

# Apply to typical source files
exts = ('.tsx', '.ts', '.js', '.jsx', '.html', '.css', '.md', '.py')

for root_dir in [FRONTEND_DIR, BACKEND_DIR]:
    for dirpath, _, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or '.next' in dirpath or 'venv' in dirpath or '__pycache__' in dirpath:
            continue
        for f in filenames:
            if f.endswith(exts):
                replace_in_file(os.path.join(dirpath, f))
