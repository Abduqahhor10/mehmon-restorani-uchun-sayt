from django.contrib import admin
from django.db.models import Count

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name_uz', 'name_ru', 'name_en', 'products_count', 'sort_order', 'is_active')
    list_editable = ('sort_order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name_uz', 'name_ru', 'name_en')
    ordering = ('sort_order', 'id')

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(products_count=Count('products'))

    @admin.display(ordering='products_count', description='Taomlar soni')
    def products_count(self, obj):
        return obj.products_count


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name_uz', 'category', 'price', 'portion_weight',
        'calories', 'is_recommended', 'is_active', 'created_at',
    )
    list_editable = ('price', 'is_recommended', 'is_active')
    list_filter = ('category', 'is_active', 'is_recommended', 'created_at')
    list_select_related = ('category',)
    search_fields = ('name_uz', 'name_ru', 'name_en', 'description_uz')
    autocomplete_fields = ('category',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('category', 'price', 'is_recommended', 'is_active')}),
        ('Nomlar', {'fields': ('name_uz', 'name_ru', 'name_en')}),
        ('Tavsiflar', {'fields': ('description_uz', 'description_ru', 'description_en')}),
        ('Ozuqaviy qiymati', {'fields': ('portion_weight', 'calories', 'protein', 'fat', 'carbs')}),
        ('Rasm', {'fields': ('image', 'image_url')}),
        ('Vaqt belgilari', {'fields': ('created_at', 'updated_at')}),
    )
