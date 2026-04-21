import os
import glob

files = glob.glob('frontend/**/*.tsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We want to replace text-white with text-slate-900 
    # except when it is inside buttons like `bg-emerald-500 text-white` or `bg-blue-500 text-white`.
    # Also keep `text-white` in `hover:text-white` untouched so hover effects remain visible on dark active elements or glass.
    # Note: earlier we replaced `text-white/50` to `text-slate-900/50` but kept `text-white` untouched.
    
    # simple replacements:
    new_content = content.replace('text-white ', 'text-slate-900 ')
    new_content = new_content.replace('text-white"', 'text-slate-900"')
    
    # Restore specific button styles that might have been hit
    new_content = new_content.replace('bg-emerald-500 text-slate-900', 'bg-emerald-500 text-white') # if we want emerald to have white text instead of slate-900. Wait, emerald-500 looks better with slate-900 for contrast.
    new_content = new_content.replace('bg-blue-500 text-slate-900', 'bg-blue-500 text-white')
    new_content = new_content.replace('hover:text-slate-900', 'hover:text-slate-900') # hover:text-white was probably nicer on dark mode, but in light mode hover:text-slate-900 is fine.
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
