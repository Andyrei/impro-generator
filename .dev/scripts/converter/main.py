import pandas as pd
import time
import sys
import os
from deep_translator import GoogleTranslator


def calculate_smart_difficulty(text, filename):
    text_up = str(text).upper()
    word_list = text_up.split()
    
    # 1. Base score by Category
    if "CHARACTER" in filename.upper():   score = 30
    elif "LOCATION" in filename.upper():  score = 25
    elif "RELATION" in filename.upper():  score = 40
    elif "TOPIC" in filename.upper():     score = 45
    else:                                  score = 30

    # 2. Word length (longer = harder to guess)
    avg_len = sum(len(w) for w in word_list) / len(word_list)
    if avg_len >= 10:   score += 20
    elif avg_len >= 7:  score += 10
    elif avg_len <= 3:  score -= 10

    # 3. Multi-word entries are harder
    if len(word_list) == 1:   score += 0
    elif len(word_list) == 2: score += 10
    else:                      score += 20

    # 4. Special characters (e.g. "Sword & Shield", "North/South")
    if "/" in text or "&" in text: score += 15

    # 5. Abstract suffix patterns (works for ANY category)
    abstract_suffixes = ('TION', 'NESS', 'MENT', 'ITY', 'ISM', 'ANCE', 'ENCE', 'OSOPHY')
    concrete_suffixes = ('ER', 'MAN', 'BOY', 'GIRL', 'LAND', 'TOWN', 'CITY')
    
    for w in word_list:
        if any(w.endswith(s) for s in abstract_suffixes): score += 15
        if any(w.endswith(s) for s in concrete_suffixes): score -= 10

    return int(max(10, min(100, score)))


def process_and_automate(input_path, output_folder):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    # Extract just the filename (e.g., 'Character.csv')
    filename = os.path.basename(input_path)
    
    print(f"Reading {input_path}...")
    # Using 'on_bad_lines' to skip rows that might have extra commas
    df = pd.read_csv(
        input_path, 
        header=None, 
        names=['en'], 
        on_bad_lines='warn',
        quotechar='"',
        quoting=0,  # QUOTE_MINIMAL — respects quoted fields
        engine='python'  # more flexible parser
    )

    # Deduplicate case-insensitively to avoid losing e.g. "vampire" vs "Vampire"
    df['eng_lower'] = df['en'].str.lower().str.strip()
    df = df.drop_duplicates(subset='eng_lower').drop(columns='eng_lower')
    # strip spaces
    df['en'] = df['en'].str.strip()
    df = df.dropna().reset_index(drop=True)
    
    df['id'] = df.index + 1
    df['difficulty'] = df['en'].apply(lambda x: calculate_smart_difficulty(x, filename))
    
    total = len(df)
    print(f"Translating {total} items...")
    translator = GoogleTranslator(source='en', target='it')
    
    results = []
    for i, val in enumerate(df['en'], start=1):
        try:
            time.sleep(0.05)
            translated = translator.translate(val)
        except Exception as e:
            print(f"  [!] Failed to translate '{val}': {e}")
            translated = val
        results.append(translated)

        # Progress bar
        bar_len = 30
        filled = int(bar_len * i / total)
        bar = '█' * filled + '░' * (bar_len - filled)
        percent = i / total * 100
        print(f"\r  [{bar}] {i}/{total} ({percent:.1f}%) — {val[:20]:<20}", end='', flush=True)

    df['it'] = results
    print(f"\n\nTranslation complete!")
    
    # Ensure output directory exists
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created directory: {output_folder}")

    # Final Save Path: assets/wordlist/Character.csv
    out_path = os.path.join(output_folder, "AUTOGEN_"+filename)
    
    df[['id', 'en', 'it', 'difficulty']].to_csv(out_path, index=False)
    print(f"Successfully saved to: {out_path}\n")

# --- TERMINAL EXECUTION BLOCK ---
if __name__ == "__main__":
    # Define your output target
    OUTPUT_DIR = "../../../assets/wordlist"

    if len(sys.argv) > 1:
        files_to_process = sys.argv[1:]
        for f in files_to_process:
            process_and_automate(f, OUTPUT_DIR)
        print("All tasks completed.")
    else:
        print("Usage: python script.py assets/ThirdPartyWorldlist/Character.csv")