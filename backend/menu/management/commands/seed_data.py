from django.core.management.base import BaseCommand
from menu.models import Category, Product

class Command(BaseCommand):
    help = 'Seeds authentic Mehmon Restaurant initial categories and gourmet products'

    def handle(self, *args, **options):
        if Category.objects.exists() or Product.objects.exists():
            self.stdout.write("Database already contains categories or products, skipping seed_data.")
            return

        self.stdout.write("Seeding Mehmon Restaurant menu data...")

        # Categories
        cat_data = [
            {
                'name_uz': 'Asosiy Taomlar',
                'name_ru': 'Главные Блюда',
                'name_en': 'Main Courses',
                'sort_order': 1
            },
            {
                'name_uz': 'Kaboblar & Gril',
                'name_ru': 'Шашлыки и Гриль',
                'name_en': 'Kebabs & Grill',
                'sort_order': 2
            },
            {
                'name_uz': 'Salatlar & Gazaklar',
                'name_ru': 'Салаты и Закуски',
                'name_en': 'Salads & Starters',
                'sort_order': 3
            },
            {
                'name_uz': 'Sho\'rvalar',
                'name_ru': 'Супы',
                'name_en': 'Soups',
                'sort_order': 4
            },
            {
                'name_uz': 'Desertlar & Ichimliklar',
                'name_ru': 'Десерты и Напитки',
                'name_en': 'Desserts & Drinks',
                'sort_order': 5
            },
        ]

        categories = {}
        for item in cat_data:
            cat, created = Category.objects.get_or_create(
                name_uz=item['name_uz'],
                defaults={
                    'name_ru': item['name_ru'],
                    'name_en': item['name_en'],
                    'sort_order': item['sort_order'],
                    'is_active': True,
                }
            )
            categories[item['name_uz']] = cat
            status_text = "Created" if created else "Found"
            self.stdout.write(f"{status_text} category: {cat.name_uz}")

        # Products
        products_data = [
            {
                'category': categories['Asosiy Taomlar'],
                'name_uz': 'To\'y Oshi "Mehmon Maxsus"',
                'name_ru': 'Праздничный Плов "Мехмон"',
                'name_en': 'Royal Festive Pilaf "Mehmon"',
                'description_uz': 'Lazer guruchi, saralangan qo\'zichoq go\'shti, sariq sabzi, noxat, mayiz, bedana tuxumi va kazy bilan bezatilgan shohona osh.',
                'description_ru': 'Рис лазер, отборная ягнятина, желтая морковь, нут, изюм, перепелиные яйца и казы.',
                'description_en': 'Premium Laser rice, tender selected lamb, yellow carrots, chickpeas, raisins, quail eggs, and homemade kazy.',
                'price': 68000,
                'portion_weight': 450,
                'calories': 680,
                'protein': 32.5,
                'fat': 28.0,
                'carbs': 74.0,
                'image_url': 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Asosiy Taomlar'],
                'name_uz': 'Qozon Kabob "Xon Saroyi"',
                'name_ru': 'Казан-Кабоб "Ханский"',
                'name_en': 'Kazan Kebab "Khan Style"',
                'description_uz': 'Qizartirib qovurilgan mayin qo\'zichoq qovurg\'alari, oltin rangli kartoshka va xushbo\'y piyoz qo\'shimchasi.',
                'description_ru': 'Нежные бараньи ребрышки, запеченный золотистый картофель с маринованным луком и зеленью.',
                'description_en': 'Crisp and juicy braised lamb ribs served with golden baby potatoes and fresh spiced onions.',
                'price': 85000,
                'portion_weight': 400,
                'calories': 740,
                'protein': 38.0,
                'fat': 45.0,
                'carbs': 35.0,
                'image_url': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Kaboblar & Gril'],
                'name_uz': 'Qo\'y Go\'shtidan Gijduvon Kabobi',
                'name_ru': 'Гиждуванский Люля-Шашлык',
                'name_en': 'Gijduvan Lamb Lyulya Kebab',
                'description_uz': 'An\'anaviy retsept bo\'yicha olovda pishirilgan sersuv qiyma kabob, lavash va sumax piyoz bilan.',
                'description_ru': 'Сочный люля-кебаб из нежного рубленого мяса баранины, жаренный на углях, с лавашем и сумахом.',
                'description_en': 'Traditional wood-charcoal minced lamb kebab served with soft lavash and sumac onions.',
                'price': 32000,
                'portion_weight': 180,
                'calories': 390,
                'protein': 26.0,
                'fat': 31.0,
                'carbs': 3.5,
                'image_url': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Kaboblar & Gril'],
                'name_uz': 'Bifsteks Ribay Gril',
                'name_ru': 'Стейк Рибай на Гриле',
                'name_en': 'Grilled Prime Ribeye Steak',
                'description_uz': 'Marmar mol go\'shtidan pishirilgan shirali ribay steyki, sarimsoqli sariyog\' va rozmarin novdasi bilan.',
                'description_ru': 'Мраморная говядина зернового откорма, сливочно-чесночное масло, веточка розмарина.',
                'description_en': 'Dry-aged marbled ribeye grilled over open flame, basted with garlic herb butter.',
                'price': 145000,
                'portion_weight': 350,
                'calories': 610,
                'protein': 48.0,
                'fat': 42.0,
                'carbs': 0.0,
                'image_url': 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Salatlar & Gazaklar'],
                'name_uz': 'Achchiq-Chuchuk "Samarqand"',
                'name_ru': 'Салат Ачик-Чучук',
                'name_en': 'Fresh Achichuk Tomato Salad',
                'description_uz': 'Yusupov pomidorlari, yupqa to\'g\'ralgan Shirin piyoz, rayhon va qizil qalampir.',
                'description_ru': 'Спелые сочные томаты, сладкий ялтинский лук, свежий базилик и острый перчик.',
                'description_en': 'Thinly sliced heirloom sweet tomatoes, sweet onions, fresh purple basil, and chili.',
                'price': 22000,
                'portion_weight': 220,
                'calories': 75,
                'protein': 2.0,
                'fat': 0.5,
                'carbs': 14.0,
                'image_url': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Salatlar & Gazaklar'],
                'name_uz': 'Bratzola & Burrata Salati',
                'name_ru': 'Салат с Бурратой и Рукколой',
                'name_en': 'Burrata & Truffle Pesto Salad',
                'description_uz': 'Mayin italyan burrata pishlog\'i, cherri pomidorlar, rukola va balsamik sous.',
                'description_ru': 'Итальянская сливочная буррата, томаты черри, руккола, кедровые орешки и бальзамик.',
                'description_en': 'Creamy burrata cheese, confit cherry tomatoes, wild arugula, pine nuts, and balsamic glaze.',
                'price': 58000,
                'portion_weight': 280,
                'calories': 380,
                'protein': 18.5,
                'fat': 29.0,
                'carbs': 11.0,
                'image_url': 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Sho\'rvalar'],
                'name_uz': 'Shahrixoncha Ko\'za Sho\'rva',
                'name_ru': 'Куза Шурпа в Глиняном Горшочке',
                'name_en': 'Clay-Pot Koza Shurpa',
                'description_uz': 'Sopol ko\'zada uzoq dimlangan yosh qo\'zi go\'shti, shirin noxat, butun sabzi va kartoshkali tiniq bulon.',
                'description_ru': 'Наваристый прозрачный бульон с молодой бараниной, нутом и овощами, томленый в глиняном горшке.',
                'description_en': 'Slow-simmered rich clear lamb broth with chickpeas, carrots, baby turnips in an authentic clay pot.',
                'price': 48000,
                'portion_weight': 420,
                'calories': 360,
                'protein': 28.0,
                'fat': 21.0,
                'carbs': 16.0,
                'image_url': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Desertlar & Ichimliklar'],
                'name_uz': 'Pista Qatlamasi & Asalli Paxlava',
                'name_ru': 'Фисташковая Пахлава с Медом',
                'name_en': 'Pistachio Honey Baklava',
                'description_uz': 'Qarsildoq qatlama xamir, maydalangan yashil pista va tog\' asali qiyomi bilan.',
                'description_ru': 'Хрустящее слоеное тесто с отборными фисташками и сиропом из горного меда.',
                'description_en': 'Delicate golden phyllo layers filled with Turkish pistachios and mountain flower honey.',
                'price': 34000,
                'portion_weight': 150,
                'calories': 420,
                'protein': 7.5,
                'fat': 24.0,
                'carbs': 48.0,
                'image_url': 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
            },
            {
                'category': categories['Desertlar & Ichimliklar'],
                'name_uz': 'Tog\' O\'tlaridan Rayhonli Choy',
                'name_ru': 'Чай с Горными Травами и Базиликом',
                'name_en': 'Mountain Herbal Basil Infusion',
                'description_uz': 'Zarafshon tog\' rayhoni, yalpiz, qora choy, limon va asal bilan maxsus choynakda.',
                'description_ru': 'Ароматный горный чай с фиолетовым базиликом, мятой, лимоном и капелькой меда.',
                'description_en': 'Handpicked mountain basil, fresh mint, premium loose black tea, fresh lemon slices, and honey.',
                'price': 25000,
                'portion_weight': 800,
                'calories': 45,
                'protein': 0.5,
                'fat': 0.0,
                'carbs': 11.0,
                'image_url': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
            }
        ]

        for p_data in products_data:
            prod, created = Product.objects.get_or_create(
                name_uz=p_data['name_uz'],
                defaults=p_data
            )
            status_text = "Created" if created else "Found"
            self.stdout.write(f"{status_text} product: {prod.name_uz}")

        self.stdout.write(self.style.SUCCESS("Successfully seeded Mehmon Restaurant menu!"))
