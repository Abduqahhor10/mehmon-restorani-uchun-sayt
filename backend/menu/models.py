from django.db import models
from .translator import auto_translate_category, auto_translate_product, format_title_case

class Category(models.Model):
    name_uz = models.CharField(max_length=150, blank=True, default='', verbose_name="Kategoriya nomi (UZ)")
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

    def save(self, *args, **kwargs):
        if self.name_uz:
            self.name_uz = format_title_case(self.name_uz)
        if self.name_ru:
            self.name_ru = format_title_case(self.name_ru)
        if self.name_en:
            self.name_en = format_title_case(self.name_en)
        try:
            auto_translate_category(self)
        except Exception:
            pass
        if self.name_uz:
            self.name_uz = format_title_case(self.name_uz)
        if self.name_ru:
            self.name_ru = format_title_case(self.name_ru)
        if self.name_en:
            self.name_en = format_title_case(self.name_en)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name_uz or self.name_ru or self.name_en or f'Category #{self.id}'}"


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        related_name='products',
        on_delete=models.CASCADE,
        verbose_name="Kategoriya"
    )
    # Multilingual Names
    name_uz = models.CharField(max_length=200, blank=True, default='', verbose_name="Taom nomi (UZ)")
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

    # Status and Flags
    is_recommended = models.BooleanField(default=False, verbose_name="Tavsiya etiladi (Chef's Special)")
    is_active = models.BooleanField(default=True, verbose_name="Mavjud / Faol")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['-is_recommended', '-created_at']

    def save(self, *args, **kwargs):
        if self.name_uz:
            self.name_uz = format_title_case(self.name_uz)
        if self.name_ru:
            self.name_ru = format_title_case(self.name_ru)
        if self.name_en:
            self.name_en = format_title_case(self.name_en)
        try:
            auto_translate_product(self)
        except Exception:
            pass
        if self.name_uz:
            self.name_uz = format_title_case(self.name_uz)
        if self.name_ru:
            self.name_ru = format_title_case(self.name_ru)
        if self.name_en:
            self.name_en = format_title_case(self.name_en)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name_uz or self.name_ru or self.name_en} ({self.price} UZS)"

    @property
    def effective_image_url(self):
        """Returns media file url or external image_url fallback."""
        if self.image:
            return self.image.url
        return self.image_url or ""
