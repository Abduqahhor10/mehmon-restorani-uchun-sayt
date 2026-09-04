from django.conf import settings
from rest_framework import serializers

from .models import Category, Product

ALLOWED_IMAGE_CONTENT_TYPES = {
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/gif',
}


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

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

    def get_products_count(self, obj):
        # The list/retrieve queryset annotates this; fall back to a query for
        # freshly created or updated instances that carry no annotation.
        annotated = getattr(obj, 'products_count', None)
        if annotated is not None:
            return annotated
        return obj.products.count()

    def validate(self, attrs):
        # A category needs at least one name; the rest are auto-translated on save.
        merged = {
            field: attrs.get(field, getattr(self.instance, field, '') if self.instance else '')
            for field in ('name_uz', 'name_ru', 'name_en')
        }
        if not any((value or '').strip() for value in merged.values()):
            raise serializers.ValidationError(
                {'name_uz': "Kamida bitta tilda kategoriya nomi kiritilishi shart."}
            )
        return attrs


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
            'image_url': {'required': False, 'allow_blank': True},
        }

    def get_effective_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.image_url or ""

    def validate_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Narx manfiy bo'lishi mumkin emas.")
        return value

    def validate_image(self, value):
        if not value:
            return value

        max_size = getattr(settings, 'MAX_UPLOAD_IMAGE_SIZE', 10 * 1024 * 1024)
        size = getattr(value, 'size', 0) or 0
        if size > max_size:
            raise serializers.ValidationError(
                f"Rasm hajmi juda katta ({size // (1024 * 1024)} MB). "
                f"Ruxsat etilgan maksimal hajm: {max_size // (1024 * 1024)} MB."
            )

        content_type = getattr(value, 'content_type', None)
        if content_type and content_type.lower() not in ALLOWED_IMAGE_CONTENT_TYPES:
            raise serializers.ValidationError(
                "Faqat JPEG, PNG, WEBP yoki GIF formatidagi rasmlar qabul qilinadi."
            )
        return value

    def validate(self, attrs):
        merged = {
            field: attrs.get(field, getattr(self.instance, field, '') if self.instance else '')
            for field in ('name_uz', 'name_ru', 'name_en')
        }
        if not any((value or '').strip() for value in merged.values()):
            raise serializers.ValidationError(
                {'name_uz': "Kamida bitta tilda taom nomi kiritilishi shart."}
            )
        return attrs
