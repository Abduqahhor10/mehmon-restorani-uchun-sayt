from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from .translator import auto_translate_category, auto_translate_product, format_title_case


class AutoTranslatedModel(models.Model):
    """
    Base model that only runs the (network-bound) auto-translation when one of the
    translatable fields actually changed. Toggling ``is_active`` or reordering a
    category no longer triggers outbound Google Translate calls.
    """

    TRANSLATABLE_FIELDS = ()

    class Meta:
        abstract = True

    @classmethod
    def from_db(cls, db, field_names, values):
        instance = super().from_db(db, field_names, values)
        instance._loaded_translatable = {
            name: values[field_names.index(name)]
            for name in cls.TRANSLATABLE_FIELDS
            if name in field_names
        }
        return instance

    def translatable_fields_changed(self):
        loaded = getattr(self, '_loaded_translatable', None)
        if loaded is None:
            # Newly constructed instance, or loaded with deferred fields: play it safe.
            return True
        return any(
            getattr(self, name) != loaded.get(name)
            for name in self.TRANSLATABLE_FIELDS
        )

    def _remember_translatable(self):
        self._loaded_translatable = {
            name: getattr(self, name) for name in self.TRANSLATABLE_FIELDS
        }


class Category(AutoTranslatedModel):
    TRANSLATABLE_FIELDS = ('name_uz', 'name_ru', 'name_en')

    name_uz = models.CharField(max_length=150, blank=True, default='', verbose_name="Kategoriya nomi (UZ)")
    name_ru = models.CharField(max_length=150, blank=True, default='', verbose_name="Название категории (RU)")
    name_en = models.CharField(max_length=150, blank=True, default='', verbose_name="Category Name (EN)")
    sort_order = models.PositiveIntegerField(default=0, verbose_name="Tartib raqami")
    is_active = models.BooleanField(default=True, db_index=True, verbose_name="Faol holati")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['sort_order', 'id']

    def save(self, *args, **kwargs):
        if self.translatable_fields_changed():
            auto_translate_category(self)
        for field in self.TRANSLATABLE_FIELDS:
            setattr(self, field, format_title_case(getattr(self, field) or ''))
        super().save(*args, **kwargs)
        self._remember_translatable()

    def __str__(self):
        return self.name_uz or self.name_ru or self.name_en or f'Category #{self.pk}'


class Product(AutoTranslatedModel):
    TRANSLATABLE_FIELDS = (
        'name_uz', 'name_ru', 'name_en',
        'description_uz', 'description_ru', 'description_en',
    )
    TITLE_FIELDS = ('name_uz', 'name_ru', 'name_en')

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
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Narxi (UZS)"
    )
    portion_weight = models.PositiveIntegerField(
        default=300,
        help_text="Porsiya og'irligi grammda (masalan, 350)",
        verbose_name="Porsiya vazni (g)"
    )

    # Nutritional Facts
    calories = models.PositiveIntegerField(default=0, verbose_name="Kaloriya (kcal)")
    protein = models.DecimalField(
        max_digits=6, decimal_places=1, default=Decimal('0.0'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Oqsil / Protein (g)"
    )
    fat = models.DecimalField(
        max_digits=6, decimal_places=1, default=Decimal('0.0'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Yog' / Fat (g)"
    )
    carbs = models.DecimalField(
        max_digits=6, decimal_places=1, default=Decimal('0.0'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Uglevod / Carbs (g)"
    )

    # Media
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Rasm")
    image_url = models.URLField(
        max_length=500, blank=True, default='',
        verbose_name="Tashqi rasm havolasi (ixtiyoriy)"
    )

    # Status and Flags
    is_recommended = models.BooleanField(default=False, verbose_name="Tavsiya etiladi (Chef's Special)")
    is_active = models.BooleanField(default=True, db_index=True, verbose_name="Mavjud / Faol")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['-is_recommended', '-created_at']

    def save(self, *args, **kwargs):
        if self.translatable_fields_changed():
            auto_translate_product(self)
        for field in self.TITLE_FIELDS:
            setattr(self, field, format_title_case(getattr(self, field) or ''))
        super().save(*args, **kwargs)
        self._remember_translatable()

    def __str__(self):
        name = self.name_uz or self.name_ru or self.name_en or f'Product #{self.pk}'
        return f"{name} ({self.price} UZS)"

    @property
    def effective_image_url(self):
        """Returns the uploaded media url, falling back to the external image_url."""
        if self.image:
            return self.image.url
        return self.image_url or ""
