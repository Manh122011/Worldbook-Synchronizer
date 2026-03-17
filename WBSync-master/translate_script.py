import os
import re
import time
from deep_translator import GoogleTranslator

import sys

# Ensure stdout uses utf-8 to avoid charmap decode errors on windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

translator = GoogleTranslator(source='auto', target='vi')

def get_chinese_phrases(text):
    phrases = []
    
    # Extract tight phrases that contain Chinese.
    # We want to grab contiguous blocks of Chinese characters, possibly mixed with
    # spaces, punctuation, or ascii words, but NOT spanning multiple lines.
    # regex matches:
    # 1. Starting with Chinese
    # 2. Middle can be Chinese, ascii, space (no newline), punctuation
    # 3. Ending with Chinese
    # OR
    # 4. A single Chinese character
    
    matches = re.finditer(r'[\u4e00-\u9fff][\u4e00-\u9fff，。！？、【】；：“”‘’《》a-zA-Z0-9 \t_]*[\u4e00-\u9fff]|[\u4e00-\u9fff]', text)
    for m in matches:
        phrase = m.group(0).strip()
        if phrase and len(phrase) < 2000: # safety limit
            phrases.append(phrase)

    # Clean and filter
    valid_phrases = []
    for p in phrases:
        p = p.strip()
        if not p: continue
        valid_phrases.append(p)
            
    return list(set(valid_phrases))

def process_file(file_path):
    print(f"--- Processing {file_path} ---")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    phrases = get_chinese_phrases(content)
    if not phrases:
        print("No Chinese phrases found.")
        return
        
    print(f"Found {len(phrases)} phrases.")
    
    # Sort phrases by length descending to avoid partial replacement (e.g. replacing 'aa' before 'aabb')
    phrases.sort(key=len, reverse=True)
    
    for p in phrases:
        try:
            vi_text = translator.translate(p)
            if vi_text:
                # Basic string formatting protection
                vi_text = vi_text.replace("'", "'").replace('"', '"')
                content = content.replace(p, vi_text)
                print(f"Translated: {p[:20]}... -> {vi_text[:20]}...")
            time.sleep(0.1) # Avoid rate limits
        except Exception as e:
            print(f"Error translating: '{p[:20]}': {e}")
            time.sleep(1)
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

import glob
files = []
files.extend(glob.glob('*.html'))
files.extend(glob.glob('src/*.js'))
files.extend(glob.glob('src/features/*.js'))
files.extend(glob.glob('*.json'))
files.extend(glob.glob('*.js'))

for f in set(files): # unique
    # skip translate script
    if 'translate_script.py' in f: continue
    # don't translate libs if they exist, though here it's src/
    process_file(f)
print("ALL DONE!")
