from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Categories.
    Filterable by is_active, ordered by sort_order.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name_uz', 'name_ru', 'name_en']
    ordering_fields = ['sort_order', 'id', 'created_at']
    ordering = ['sort_order', 'id']

    @action(detail=False, methods=['delete', 'post'], url_path='delete-all')
    def delete_all(self, request):
        """
        Delete all categories and their related products.
        """
        count, _ = Category.objects.all().delete()
        return Response(
            {"message": f"Successfully deleted all categories ({count} items affected)."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='delete-selected')
    def delete_selected(self, request):
        """
        Delete selected categories by IDs.
        """
        ids = request.data.get('ids', [])
        if isinstance(ids, list) and ids:
            count, _ = Category.objects.filter(id__in=ids).delete()
            return Response(
                {"message": f"Successfully deleted {count} categories."},
                status=status.HTTP_200_OK
            )
        return Response({"error": "No IDs provided"}, status=status.HTTP_400_BAD_REQUEST)


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Products with image upload, duplication and filtering.
    """
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = [
        'name_uz', 'name_ru', 'name_en',
        'description_uz', 'description_ru', 'description_en'
    ]
    ordering_fields = ['is_recommended', 'price', 'created_at', 'portion_weight', 'calories']
    ordering = ['-is_recommended', '-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # If client requested category filter through query param
        cat_id = self.request.query_params.get('category_id')
        if cat_id and cat_id.isdigit():
            qs = qs.filter(category_id=int(cat_id))
        return qs

    @action(detail=False, methods=['delete', 'post'], url_path='delete-all')
    def delete_all(self, request):
        """
        Delete all products from the database.
        """
        count, _ = Product.objects.all().delete()
        return Response(
            {"message": f"Successfully deleted all products ({count} items)."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='delete-selected')
    def delete_selected(self, request):
        """
        Delete selected products by IDs.
        """
        ids = request.data.get('ids', [])
        if isinstance(ids, list) and ids:
            count, _ = Product.objects.filter(id__in=ids).delete()
            return Response(
                {"message": f"Successfully deleted {count} products."},
                status=status.HTTP_200_OK
            )
        return Response({"error": "No IDs provided"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        Action to duplicate a product (Nusxa ko'chirish).
        """
        original = self.get_object()
        new_product = Product.objects.create(
            category=original.category,
            name_uz=original.name_uz,
            name_ru=original.name_ru,
            name_en=original.name_en,
            description_uz=original.description_uz,
            description_ru=original.description_ru,
            description_en=original.description_en,
            price=original.price,
            portion_weight=original.portion_weight,
            calories=original.calories,
            protein=original.protein,
            fat=original.fat,
            carbs=original.carbs,
            image=original.image,
            image_url=original.image_url,
            is_recommended=original.is_recommended,
            is_active=original.is_active,
        )
        serializer = self.get_serializer(new_product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

