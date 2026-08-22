from django.db import models

class Category(models.Model):
    name_uz = models.CharField(max_length=150, verbose_name="Kategoriya nomi (UZ)")
    name_ru = models.CharField(max_length=150, blank=True, default='', verbose_name="Название категории (RU)")
    name_en = models.CharField(max_length=150, blank=True, default='', verbose_name="Category Name (EN)")
    sort_order = models.PositiveIntegerField(default=0, verbose_name="Tartib raqami")
    is_active = models.BooleanField(default=True, verbose_name="Faol holati")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.name_uz}"


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        related_name='products',
        on_delete=models.CASCADE,
        verbose_name="Kategoriya"
    )
    # Multilingual Names (only name_uz is required)
    name_uz = models.CharField(max_length=200, verbose_name="Taom nomi (UZ)")
    name_ru = models.CharField(max_length=200, blank=True, default='', verbose_name="Название блюда (RU)")
    name_en = models.CharField(max_length=200, blank=True, default='', verbose_name="Dish Name (EN)")

    # Multilingual Descriptions
    description_uz = models.TextField(blank=True, default='', verbose_name="Tavsif (UZ)")
    description_ru = models.TextField(blank=True, default='', verbose_name="Описание (RU)")
    description_en = models.TextField(blank=True, default='', verbose_name="Description (EN)")

    # Price & Serving
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Narxi (UZS)")
    portion_weight = models.PositiveIntegerField(
        default=300,
        help_text="Porsiya og'irligi grammda (masalan, 350)",
        verbose_name="Porsiya vazni (g)"
    )

    # Nutritional Facts
    calories = models.PositiveIntegerField(default=0, verbose_name="Kaloriya (kcal)")
    protein = models.DecimalField(max_digits=6, decimal_places=1, default=0.0, verbose_name="Oqsil / Protein (g)")
    fat = models.DecimalField(max_digits=6, decimal_places=1, default=0.0, verbose_name="Yog' / Fat (g)")
    carbs = models.DecimalField(max_digits=6, decimal_places=1, default=0.0, verbose_name="Uglevod / Carbs (g)")

    # Media
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Rasm")
    image_url = models.URLField(max_length=500, blank=True, null=True, default='', verbose_name="Tashqi rasm havolasi (ixtiyoriy)")


    is_active = models.BooleanField(default=True, verbose_name="Mavjud / Faol")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name_uz} ({self.price} UZS)"

    @property
    def effective_image_url(self):
        """Returns media file url or external image_url fallback."""
        if self.image:
            return self.image.url
        return self.image_url or ""
