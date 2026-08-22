import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      brand: {
        name: 'MEHMON',
        restaurant: 'RESTAURANT',
        slogan: 'Shohona lazzat va mehmondo\'stlik maskani'
      },
      nav: {
        search_placeholder: 'Taomlarni qidirish...',
        all_categories: 'Barchasi',
        portion: 'Porsiya',
        calories: 'Kaloriya',
        protein: 'Oqsil',
        fat: 'Yog\'',
        carbs: 'Uglevod',
        nutritional_value: 'Ozuqaviy qiymati',
        price_currency: 'so\'m',
        no_products_found: 'Afsuski, bunday taom topilmadi',
        try_other_search: 'Qidiruv so\'zini o\'zgartirib ko\'ring yoki boshqa kategoriyani tanlang',
        details: 'Tafsilotlar',
        hide_details: 'Yopish',
        loading: 'Taomlar yuklanmoqda...',
        items_count: 'ta taom',
      },
      footer: {
        copyright: 'Created by @Sunnataliyev and @AnakinSkaywalker'
      }
    }
  },
  ru: {
    translation: {
      brand: {
        name: 'MEHMON',
        restaurant: 'RESTAURANT',
        slogan: 'Место изысканного вкуса и гостеприимства'
      },
      nav: {
        search_placeholder: 'Поиск блюд...',
        all_categories: 'Все',
        portion: 'Порция',
        calories: 'Калории',
        protein: 'Белки',
        fat: 'Жиры',
        carbs: 'Углеводы',
        nutritional_value: 'Пищевая ценность',
        price_currency: 'сум',
        no_products_found: 'К сожалению, ничего не найдено',
        try_other_search: 'Попробуйте изменить запрос или выберите другую категорию',
        details: 'Подробнее',
        hide_details: 'Скрыть',
        loading: 'Загрузка меню...',
        items_count: 'блюд',
      },
      footer: {
        copyright: 'Created by @Sunnataliyev and @AnakinSkaywalker'
      }
    }
  },
  en: {
    translation: {
      brand: {
        name: 'MEHMON',
        restaurant: 'RESTAURANT',
        slogan: 'Exquisite taste & authentic hospitality'
      },
      nav: {
        search_placeholder: 'Search dishes...',
        all_categories: 'All',
        portion: 'Portion',
        calories: 'Calories',
        protein: 'Protein',
        fat: 'Fat',
        carbs: 'Carbs',
        nutritional_value: 'Nutritional Value',
        price_currency: 'UZS',
        no_products_found: 'No dishes found',
        try_other_search: 'Try another search query or pick a different category',
        details: 'Details',
        hide_details: 'Hide',
        loading: 'Loading dishes...',
        items_count: 'dishes',
      },
      footer: {
        copyright: 'Created by @Sunnataliyev and @AnakinSkaywalker'
      }
    }
  }
};

const savedLang = localStorage.getItem('mehmon_lang') || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
