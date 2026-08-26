import urllib.request
import urllib.parse
import json
import re
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

def auto_detect_and_translate(text):
    """
    Given a single input text in Uzbek or Russian,
    automatically detects the script and returns (uz, ru, en).
    """
    if not text or not str(text).strip():
        return '', '', ''
    cleaned = str(text).strip()
    
    # If text contains Cyrillic characters (Russian)
    if re.search(r'[а-яА-ЯёЁ]', cleaned):
        ru = cleaned
        uz = translate_text(ru, 'uz', 'ru')
        en = translate_text(ru, 'en', 'ru')
        return (uz or ru), ru, (en or ru)
    else:
        # Latin characters (Uzbek / English)
        uz = cleaned
        ru = translate_text(uz, 'ru', 'uz')
        en = translate_text(uz, 'en', 'uz')
        return uz, (ru or uz), (en or uz)

def auto_translate_category(category):
    """
    Auto-translates category names based on single or partial input.
    """
    uz = (category.name_uz or '').strip()
    ru = (category.name_ru or '').strip()
    en = (category.name_en or '').strip()

    primary_text = uz or ru or en
    if not primary_text:
        return

    # If only one language is filled, auto-generate all 3
    if (uz and not ru and not en) or (ru and not uz and not en) or (en and not uz and not ru):
        t_uz, t_ru, t_en = auto_detect_and_translate(primary_text)
        category.name_uz = t_uz
        category.name_ru = t_ru
        category.name_en = t_en
    else:
        if not category.name_uz:
            category.name_uz = translate_text(category.name_ru or category.name_en, 'uz')
        if not category.name_ru:
            category.name_ru = translate_text(category.name_uz or category.name_en, 'ru')
        if not category.name_en:
            category.name_en = translate_text(category.name_uz or category.name_ru, 'en')

def auto_translate_product(product):
    """
    Auto-translates product names and descriptions based on single or partial input.
    """
    name_uz = (product.name_uz or '').strip()
    name_ru = (product.name_ru or '').strip()
    name_en = (product.name_en or '').strip()

    primary_name = name_uz or name_ru or name_en
    if primary_name:
        if (name_uz and not name_ru and not name_en) or (name_ru and not name_uz and not name_en) or (name_en and not name_uz and not name_ru):
            t_uz, t_ru, t_en = auto_detect_and_translate(primary_name)
            product.name_uz = t_uz
            product.name_ru = t_ru
            product.name_en = t_en
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
    primary_desc = desc_uz or desc_ru or desc_en

    if primary_desc:
        if (desc_uz and not desc_ru and not desc_en) or (desc_ru and not desc_uz and not desc_en) or (desc_en and not desc_uz and not desc_ru):
            t_uz, t_ru, t_en = auto_detect_and_translate(primary_desc)
            product.description_uz = t_uz
            product.description_ru = t_ru
            product.description_en = t_en
        else:
            if not product.description_uz and (product.description_ru or product.description_en):
                product.description_uz = translate_text(product.description_ru or product.description_en, 'uz')
            if not product.description_ru and (product.description_uz or product.description_en):
                product.description_ru = translate_text(product.description_uz or product.description_en, 'ru')
            if not product.description_en and (product.description_uz or product.description_ru):
                product.description_en = translate_text(product.description_uz or product.description_ru, 'en')
