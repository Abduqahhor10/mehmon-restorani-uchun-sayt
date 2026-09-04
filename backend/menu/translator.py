import urllib.request
import urllib.parse
import json
import re
import logging
import threading
from concurrent.futures import ThreadPoolExecutor

from django.conf import settings

logger = logging.getLogger(__name__)

# Bounded cache of *successful* translations only. A failed lookup must not be
# memoised, otherwise a single network blip would permanently pin a dish to its
# untranslated name for the lifetime of the process.
_TRANSLATION_CACHE = {}
_TRANSLATION_CACHE_MAX = 2048
_TRANSLATION_CACHE_LOCK = threading.Lock()

GTX_TIMEOUT = 1.5
DICT_TIMEOUT = 1.0
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'

# Common food & category dictionary for instantaneous, 0-latency translations
FOOD_DICT = {
    # Categories
    'asosiy taomlar': {'uz': "Asosiy Taomlar", 'ru': "Главные Блюда", 'en': "Main Courses"},
    'главные блюда': {'uz': "Asosiy Taomlar", 'ru': "Главные Блюда", 'en': "Main Courses"},
    'main courses': {'uz': "Asosiy Taomlar", 'ru': "Главные Блюда", 'en': "Main Courses"},
    'kaboblar': {'uz': "Kaboblar", 'ru': "Шашлыки", 'en': "Kebabs"},
    'kaboblar & gril': {'uz': "Kaboblar & Gril", 'ru': "Шашлыки и Гриль", 'en': "Kebabs & Grill"},
    'шашлыки и гриль': {'uz': "Kaboblar & Gril", 'ru': "Шашлыки и Гриль", 'en': "Kebabs & Grill"},
    'salatlar & gazaklar': {'uz': "Salatlar & Gazaklar", 'ru': "Салаты и Закуски", 'en': "Salads & Starters"},
    'салаты и закуски': {'uz': "Salatlar & Gazaklar", 'ru': "Салаты и Закуски", 'en': "Salads & Starters"},
    "sho'rvalar": {'uz': "Sho'rvalar", 'ru': "Супы", 'en': "Soups"},
    'супы': {'uz': "Sho'rvalar", 'ru': "Супы", 'en': "Soups"},
    'desertlar & ichimliklar': {'uz': "Desertlar & Ichimliklar", 'ru': "Десерты и Напитки", 'en': "Desserts & Drinks"},
    'десерты и напитки': {'uz': "Desertlar & Ichimliklar", 'ru': "Десерты и Напитки", 'en': "Desserts & Drinks"},
    'desertlar': {'uz': "Desertlar", 'ru': "Десерты", 'en': "Desserts"},
    'десерты': {'uz': "Desertlar", 'ru': "Десерты", 'en': "Desserts"},
    'ichimliklar': {'uz': "Ichimliklar", 'ru': "Напитки", 'en': "Drinks"},
    'напитки': {'uz': "Ichimliklar", 'ru': "Напитки", 'en': "Drinks"},
    'issiq taomlar': {'uz': "Issiq Taomlar", 'ru': "Горячие Блюда", 'en': "Hot Dishes"},
    'горячие блюда': {'uz': "Issiq Taomlar", 'ru': "Горячие Блюда", 'en': "Hot Dishes"},
    'sovuq gazaklar': {'uz': "Sovuq Gazaklar", 'ru': "Холодные Закуски", 'en': "Cold Snacks"},
    'холодные закуски': {'uz': "Sovuq Gazaklar", 'ru': "Холодные Закуски", 'en': "Cold Snacks"},
    'baliq taomlari': {'uz': "Baliq Taomlari", 'ru': "Рыбные Блюда", 'en': "Fish Dishes"},
    'рыбные блюда': {'uz': "Baliq Taomlari", 'ru': "Рыбные Блюда", 'en': "Fish Dishes"},

    # Common Dishes
    'чечевичный суп': {'uz': "Yasmiq Sho'rva", 'ru': "Чечевичный Суп", 'en': "Lentil Soup"},
    'суп': {'uz': "Sho'rva", 'ru': "Суп", 'en': "Soup"},
    'sho\'rva': {'uz': "Sho'rva", 'ru': "Суп", 'en': "Soup"},
    'плов': {'uz': "Osh", 'ru': "Плов", 'en': "Pilaf"},
    'osh': {'uz': "Osh", 'ru': "Плов", 'en': "Pilaf"},
    'to\'y oshi': {'uz': "To'y Oshi", 'ru': "Свадебный Плов", 'en': "Festive Pilaf"},
    'лагман': {'uz': "Lag'mon", 'ru': "Лагман", 'en': "Lagman"},
    "lag'mon": {'uz': "Lag'mon", 'ru': "Лагман", 'en': "Lagman"},
    'манты': {'uz': "Manti", 'ru': "Манты", 'en': "Mantu"},
    'manti': {'uz': "Manti", 'ru': "Манты", 'en': "Mantu"},
    'самса': {'uz': "Somsa", 'ru': "Самса", 'en': "Samosa"},
    'сомса': {'uz': "Somsa", 'ru': "Самса", 'en': "Samosa"},
    'somsa': {'uz': "Somsa", 'ru': "Самса", 'en': "Samosa"},
    'шашлык': {'uz': "Shashlik", 'ru': "Шашлык", 'en': "Kebab"},
    'shashlik': {'uz': "Shashlik", 'ru': "Шашлык", 'en': "Kebab"},
    'kabob': {'uz': "Kabob", 'ru': "Шашлык", 'en': "Kebab"},
    'qozon kabob': {'uz': "Qozon Kabob", 'ru': "Казан-Кабоб", 'en': "Kazan Kebab"},
    'казан-кабоб': {'uz': "Qozon Kabob", 'ru': "Казан-Кабоб", 'en': "Kazan Kebab"},
    'люля кебаб': {'uz': "Lula Kabob", 'ru': "Люля Кебаб", 'en': "Lula Kebab"},
    'lula kabob': {'uz': "Lula Kabob", 'ru': "Люля Кебаб", 'en': "Lula Kebab"},
    'салат': {'uz': "Salat", 'ru': "Салат", 'en': "Salad"},
    'salat': {'uz': "Salat", 'ru': "Салат", 'en': "Salad"},
    'achchiq-chuchuk': {'uz': "Achchiq-Chuchuk", 'ru': "Аччик-Чучук", 'en': "Achichuk Salad"},
    'чай': {'uz': "Choy", 'ru': "Чай", 'en': "Tea"},
    'choy': {'uz': "Choy", 'ru': "Чай", 'en': "Tea"},
    'ko\'k choy': {'uz': "Ko'k Choy", 'ru': "Зеленый Чай", 'en': "Green Tea"},
    'qora choy': {'uz': "Qora Choy", 'ru': "Черный Чай", 'en': "Black Tea"},
    'kofe': {'uz': "Kofe", 'ru': "Кофе", 'en': "Coffee"},
    'хлеб': {'uz': "Non", 'ru': "Хлеб", 'en': "Bread"},
    'non': {'uz': "Non", 'ru': "Хлеб", 'en': "Bread"},
    'лепешка': {'uz': "Non", 'ru': "Лепешка", 'en': "Traditional Bread"},
}

def format_title_case(text: str) -> str:
    """
    Capitalizes the first letter of each word and converts the rest to lowercase.
    Preserves Uzbek special apostrophes (o', g', etc.), Russian, English, hyphens, and quotes.
    """
    if not text:
        return ''
    cleaned = re.sub(r'\s+', ' ', str(text).strip())
    if not cleaned:
        return ''
    lower = cleaned.lower()
    return re.sub(r'(^|[\s\-/([{\"\«\“])([^\s\-/([{\"\«\“])', lambda m: m.group(1) + m.group(2).upper(), lower)

def _cache_get(key):
    with _TRANSLATION_CACHE_LOCK:
        return _TRANSLATION_CACHE.get(key)


def _cache_put(key, value):
    with _TRANSLATION_CACHE_LOCK:
        if len(_TRANSLATION_CACHE) >= _TRANSLATION_CACHE_MAX:
            _TRANSLATION_CACHE.clear()
        _TRANSLATION_CACHE[key] = value


def translate_text(text, target_lang='uz', source_lang='auto'):
    """
    Translates text with a local food dictionary first, then two Google endpoints.

    Short timeouts keep database writes responsive. Only successful translations are
    cached, so a transient network failure does not permanently freeze a bad result.
    Returns the input unchanged when every strategy fails.
    """
    if not text or not str(text).strip():
        return ''
    cleaned = str(text).strip()

    # Check food dictionary first (0ms)
    lowered = cleaned.lower()
    if lowered in FOOD_DICT:
        dict_val = FOOD_DICT[lowered].get(target_lang)
        if dict_val:
            return dict_val

    if not getattr(settings, 'AUTO_TRANSLATE', True):
        return cleaned

    cache_key = (lowered, target_lang, source_lang)
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    # Strategy 1: Google Translate GTX endpoint
    try:
        url = (
            "https://translate.googleapis.com/translate_a/single"
            f"?client=gtx&sl={source_lang}&tl={target_lang}&dt=t&q="
            + urllib.parse.quote(cleaned)
        )
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=GTX_TIMEOUT) as response:
            data = json.loads(response.read().decode('utf-8'))
            parts = [part[0] for part in data[0] if part and len(part) > 0 and part[0]]
            res = ''.join(parts).strip()
            if res:
                _cache_put(cache_key, res)
                return res
    except Exception as e:
        logger.debug("Google GTX translation skipped/error: %s", e)

    # Strategy 2: Google Dict endpoint
    try:
        url2 = (
            "https://clients5.google.com/translate_a/t"
            f"?client=dict-chrome-ex&sl={source_lang}&tl={target_lang}&q="
            + urllib.parse.quote(cleaned)
        )
        req2 = urllib.request.Request(url2, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req2, timeout=DICT_TIMEOUT) as response2:
            data2 = json.loads(response2.read().decode('utf-8'))
            if isinstance(data2, list) and data2:
                res2 = data2[0]
                if isinstance(res2, list) and res2:
                    res2 = res2[0]
                res2 = str(res2).strip()
                if res2:
                    _cache_put(cache_key, res2)
                    return res2
    except Exception as e2:
        logger.debug("Google Dict translation skipped/error: %s", e2)

    return cleaned

def auto_detect_and_translate(text, is_title=True):
    """
    Given a single input text in Uzbek, Russian, or English,
    automatically detects the script and returns formatted (uz, ru, en) in parallel.
    """
    if not text or not str(text).strip():
        return '', '', ''
    cleaned = format_title_case(text) if is_title else str(text).strip()
    
    try:
        # Check if text contains Cyrillic characters (Russian)
        if re.search(r'[а-яА-ЯёЁ]', cleaned):
            ru = cleaned
            with ThreadPoolExecutor(max_workers=2) as executor:
                fut_uz = executor.submit(translate_text, ru, 'uz', 'ru')
                fut_en = executor.submit(translate_text, ru, 'en', 'ru')
                uz = fut_uz.result()
                en = fut_en.result()
            if is_title:
                return format_title_case(uz or ru), format_title_case(ru), format_title_case(en or ru)
            return (uz or ru), ru, (en or ru)
        else:
            # Latin characters (Uzbek / English)
            uz = cleaned
            with ThreadPoolExecutor(max_workers=2) as executor:
                fut_ru = executor.submit(translate_text, uz, 'ru', 'uz')
                fut_en = executor.submit(translate_text, uz, 'en', 'uz')
                ru = fut_ru.result()
                en = fut_en.result()
            if is_title:
                return format_title_case(uz), format_title_case(ru or uz), format_title_case(en or uz)
            return uz, (ru or uz), (en or uz)
    except Exception as e:
        logger.warning(f"Translation detection error: {e}")
        return cleaned, cleaned, cleaned

def auto_translate_category(category):
    """
    Auto-translates category names based on input, formats to title case,
    and corrects Cyrillic/Latin mix-ups. Safe against network timeouts.
    """
    try:
        uz = format_title_case(category.name_uz or '')
        ru = format_title_case(category.name_ru or '')
        en = format_title_case(category.name_en or '')

        # If name_uz is actually Russian (has Cyrillic)
        if uz and re.search(r'[а-яА-ЯёЁ]', uz) and not ru:
            ru = uz
            uz = ''

        primary_text = uz or ru or en
        if not primary_text:
            return

        # If only one language is filled or if uz/ru/en need synchronization
        if not uz or not ru or not en or (uz == ru and re.search(r'[а-яА-ЯёЁ]', uz)):
            t_uz, t_ru, t_en = auto_detect_and_translate(primary_text, is_title=True)
            category.name_uz = format_title_case(t_uz or primary_text)
            category.name_ru = format_title_case(t_ru or primary_text)
            category.name_en = format_title_case(t_en or primary_text)
        else:
            category.name_uz = format_title_case(uz)
            category.name_ru = format_title_case(ru)
            category.name_en = format_title_case(en)
    except Exception as err:
        logger.warning(f"Category auto-translation error: {err}")
        # Always ensure primary name is saved
        fallback = category.name_uz or category.name_ru or category.name_en or ''
        if not category.name_uz:
            category.name_uz = fallback
        if not category.name_ru:
            category.name_ru = fallback
        if not category.name_en:
            category.name_en = fallback

def auto_translate_product(product):
    """
    Auto-translates product names and descriptions, formats names to title case,
    and corrects Cyrillic/Latin mix-ups. Safe against network timeouts.
    """
    try:
        name_uz = format_title_case(product.name_uz or '')
        name_ru = format_title_case(product.name_ru or '')
        name_en = format_title_case(product.name_en or '')

        # If name_uz contains Cyrillic and name_ru is empty
        if name_uz and re.search(r'[а-яА-ЯёЁ]', name_uz) and not name_ru:
            name_ru = name_uz
            name_uz = ''

        primary_name = name_uz or name_ru or name_en
        if primary_name:
            if not name_uz or not name_ru or not name_en or (name_uz == name_ru and re.search(r'[а-яА-ЯёЁ]', name_uz)):
                t_uz, t_ru, t_en = auto_detect_and_translate(primary_name, is_title=True)
                product.name_uz = format_title_case(t_uz or primary_name)
                product.name_ru = format_title_case(t_ru or primary_name)
                product.name_en = format_title_case(t_en or primary_name)
            else:
                product.name_uz = format_title_case(name_uz)
                product.name_ru = format_title_case(name_ru)
                product.name_en = format_title_case(name_en)

        # Descriptions auto-translation
        desc_uz = (product.description_uz or '').strip()
        desc_ru = (product.description_ru or '').strip()
        desc_en = (product.description_en or '').strip()

        if desc_uz and re.search(r'[а-яА-ЯёЁ]', desc_uz) and not desc_ru:
            desc_ru = desc_uz
            desc_uz = ''

        primary_desc = desc_uz or desc_ru or desc_en
        if primary_desc:
            if not desc_uz or not desc_ru or not desc_en:
                t_uz, t_ru, t_en = auto_detect_and_translate(primary_desc, is_title=False)
                product.description_uz = t_uz or primary_desc
                product.description_ru = t_ru or primary_desc
                product.description_en = t_en or primary_desc
    except Exception as err:
        logger.warning(f"Product auto-translation error: {err}")
        # Always ensure primary name is saved
        fallback = product.name_uz or product.name_ru or product.name_en or ''
        if not product.name_uz:
            product.name_uz = fallback
        if not product.name_ru:
            product.name_ru = fallback
        if not product.name_en:
            product.name_en = fallback
