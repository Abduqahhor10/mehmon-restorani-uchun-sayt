from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = [
            'id',
            'name_uz',
            'name_ru',
            'name_en',
            'sort_order',
            'is_active',
            'products_count',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'name_uz': {'required': False, 'allow_blank': True},
            'name_ru': {'required': False, 'allow_blank': True},
            'name_en': {'required': False, 'allow_blank': True},
        }


class ProductSerializer(serializers.ModelSerializer):
    category_name_uz = serializers.CharField(source='category.name_uz', read_only=True)
    category_name_ru = serializers.CharField(source='category.name_ru', read_only=True)
    category_name_en = serializers.CharField(source='category.name_en', read_only=True)
    effective_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_name_uz',
            'category_name_ru',
            'category_name_en',
            'name_uz',
            'name_ru',
            'name_en',
            'description_uz',
            'description_ru',
            'description_en',
            'price',
            'portion_weight',
            'calories',
            'protein',
            'fat',
            'carbs',
            'image',
            'image_url',
            'effective_image_url',
            'is_recommended',
            'is_active',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'name_uz': {'required': False, 'allow_blank': True},
            'name_ru': {'required': False, 'allow_blank': True},
            'name_en': {'required': False, 'allow_blank': True},
            'description_uz': {'required': False, 'allow_blank': True},
            'description_ru': {'required': False, 'allow_blank': True},
            'description_en': {'required': False, 'allow_blank': True},
            'image': {'required': False, 'allow_null': True},
            'image_url': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def get_effective_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or ""

