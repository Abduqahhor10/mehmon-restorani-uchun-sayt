from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name_uz', 'name_ru', 'name_en', 'sort_order', 'is_active')
    list_editable = ('sort_order', 'is_active')
    search_fields = ('name_uz', 'name_ru', 'name_en')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name_uz', 'category', 'price', 'portion_weight', 'calories', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name_uz', 'name_ru', 'name_en', 'description_uz')
    list_editable = ('price', 'is_active')
