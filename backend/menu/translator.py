import urllib.request
import urllib.parse
import json
import logging

logger = logging.getLogger(__name__)

def translate_text(text, target_lang='uz', source_lang='auto'):
    """
    Translates text to target_lang using Google Translate GTX endpoint.
    """
    if not text or not str(text).strip():
        return ''
    cleaned = str(text).strip()
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={source_lang}&tl={target_lang}&dt=t&q=" + urllib.parse.quote(cleaned)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            parts = [part[0] for part in data[0] if part and len(part) > 0 and part[0]]
            return ''.join(parts).strip()
    except Exception as e:
        logger.warning(f"Translation error for '{cleaned}' -> {target_lang}: {e}")
        return cleaned

def auto_translate_category(category):
    """
    Auto-translates empty category names based on the filled one.
    """
    uz = (category.name_uz or '').strip()
    ru = (category.name_ru or '').strip()
    en = (category.name_en or '').strip()

    # Determine primary text and source language
    # Case 1: Only Russian is provided (or uz/en are identical copies of ru)
    if ru and (not uz or uz == ru) and (not en or en == ru):
        category.name_uz = translate_text(ru, 'uz', 'ru')
        category.name_en = translate_text(ru, 'en', 'ru')
        category.name_ru = ru
    # Case 2: Only Uzbek is provided
    elif uz and (not ru or ru == uz) and (not en or en == uz):
        category.name_ru = translate_text(uz, 'ru', 'uz')
        category.name_en = translate_text(uz, 'en', 'uz')
        category.name_uz = uz
    # Case 3: Only English is provided
    elif en and (not uz or uz == en) and (not ru or ru == en):
        category.name_uz = translate_text(en, 'uz', 'en')
        category.name_ru = translate_text(en, 'ru', 'en')
        category.name_en = en
    else:
        if not category.name_uz:
            category.name_uz = translate_text(category.name_ru or category.name_en, 'uz')
        if not category.name_ru:
            category.name_ru = translate_text(category.name_uz or category.name_en, 'ru')
        if not category.name_en:
            category.name_en = translate_text(category.name_uz or category.name_ru, 'en')

def auto_translate_product(product):
    """
    Auto-translates empty product names and descriptions based on the filled one.
    """
    name_uz = (product.name_uz or '').strip()
    name_ru = (product.name_ru or '').strip()
    name_en = (product.name_en or '').strip()

    # Names auto-translation
    if name_ru and (not name_uz or name_uz == name_ru) and (not name_en or name_en == name_ru):
        product.name_uz = translate_text(name_ru, 'uz', 'ru')
        product.name_en = translate_text(name_ru, 'en', 'ru')
        product.name_ru = name_ru
    elif name_uz and (not name_ru or name_ru == name_uz) and (not name_en or name_en == name_uz):
        product.name_ru = translate_text(name_uz, 'ru', 'uz')
        product.name_en = translate_text(name_uz, 'en', 'uz')
        product.name_uz = name_uz
    elif name_en and (not name_uz or name_uz == name_en) and (not name_ru or name_ru == name_en):
        product.name_uz = translate_text(name_en, 'uz', 'en')
        product.name_ru = translate_text(name_en, 'ru', 'en')
        product.name_en = name_en
    else:
        if not product.name_uz:
            product.name_uz = translate_text(product.name_ru or product.name_en, 'uz')
        if not product.name_ru:
            product.name_ru = translate_text(product.name_uz or product.name_en, 'ru')
        if not product.name_en:
            product.name_en = translate_text(product.name_uz or product.name_ru, 'en')

    # Descriptions auto-translation
    desc_uz = (product.description_uz or '').strip()
    desc_ru = (product.description_ru or '').strip()
    desc_en = (product.description_en or '').strip()

    if desc_ru and (not desc_uz or desc_uz == desc_ru) and (not desc_en or desc_en == desc_ru):
        product.description_uz = translate_text(desc_ru, 'uz', 'ru')
        product.description_en = translate_text(desc_ru, 'en', 'ru')
        product.description_ru = desc_ru
    elif desc_uz and (not desc_ru or desc_ru == desc_uz) and (not desc_en or desc_en == desc_uz):
        product.description_ru = translate_text(desc_uz, 'ru', 'uz')
        product.description_en = translate_text(desc_uz, 'en', 'uz')
        product.description_uz = desc_uz
    elif desc_en and (not desc_uz or desc_uz == desc_en) and (not desc_ru or desc_ru == desc_en):
        product.description_uz = translate_text(desc_en, 'uz', 'en')
        product.description_ru = translate_text(desc_en, 'ru', 'en')
        product.description_en = desc_en
    else:
        if not product.description_uz and (product.description_ru or product.description_en):
            product.description_uz = translate_text(product.description_ru or product.description_en, 'uz')
        if not product.description_ru and (product.description_uz or product.description_en):
            product.description_ru = translate_text(product.description_uz or product.description_en, 'ru')
        if not product.description_en and (product.description_uz or product.description_ru):
            product.description_en = translate_text(product.description_uz or product.description_ru, 'en')
