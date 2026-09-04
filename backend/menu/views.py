import logging

from django.db import transaction
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

logger = logging.getLogger(__name__)


def parse_id_list(raw):
    """
    Normalises a request payload's ``ids`` into a list of positive integers.
    Returns None when the payload is not a usable list of ids.
    """
    if not isinstance(raw, (list, tuple)) or not raw:
        return None
    parsed = []
    for item in raw:
        try:
            value = int(item)
        except (TypeError, ValueError):
            return None
        if value <= 0:
            return None
        parsed.append(value)
    return parsed


class BulkDeleteMixin:
    """
    Shared, staff-only bulk delete endpoints. Bulk destruction is intentionally
    stricter than ordinary writes: it requires a staff account, not just any token.
    """

    bulk_delete_model = None
    bulk_delete_label = 'items'

    def get_permissions(self):
        if self.action in ('delete_all', 'delete_selected'):
            return [IsAdminUser()]
        return super().get_permissions()

    @action(detail=False, methods=['delete', 'post'], url_path='delete-all')
    def delete_all(self, request):
        model = self.bulk_delete_model
        with transaction.atomic():
            # Count first: Model.delete() reports cascaded rows too, which made the
            # old message claim far more deletions than the user actually asked for.
            count = model.objects.count()
            model.objects.all().delete()
        logger.warning(
            "Bulk delete-all on %s by user %s removed %s rows",
            model.__name__, request.user, count,
        )
        return Response(
            {
                'deleted': count,
                'message': f"Successfully deleted all {self.bulk_delete_label} ({count} items).",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='delete-selected')
    def delete_selected(self, request):
        ids = parse_id_list(request.data.get('ids'))
        if ids is None:
            return Response(
                {'detail': "O'chirish uchun ID ro'yxati (butun sonlar) yuborilishi shart."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        model = self.bulk_delete_model
        with transaction.atomic():
            queryset = model.objects.filter(id__in=ids)
            count = queryset.count()
            queryset.delete()
        logger.warning(
            "Bulk delete-selected on %s by user %s removed %s rows",
            model.__name__, request.user, count,
        )
        return Response(
            {
                'deleted': count,
                'message': f"Successfully deleted {count} {self.bulk_delete_label}.",
            },
            status=status.HTTP_200_OK,
        )


class CategoryViewSet(BulkDeleteMixin, viewsets.ModelViewSet):
    """
    CRUD API for Categories. Reading is public; writing requires a valid token.
    """
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name_uz', 'name_ru', 'name_en']
    ordering_fields = ['sort_order', 'id', 'created_at']
    ordering = ['sort_order', 'id']

    bulk_delete_model = Category
    bulk_delete_label = 'categories'

    def get_queryset(self):
        # Annotated so serializing N categories stays a single query.
        return Category.objects.annotate(products_count=Count('products'))


class ProductViewSet(BulkDeleteMixin, viewsets.ModelViewSet):
    """
    CRUD API for Products with image upload, duplication and filtering.
    Reading is public; writing requires a valid token.
    """
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active', 'is_recommended']
    search_fields = [
        'name_uz', 'name_ru', 'name_en',
        'description_uz', 'description_ru', 'description_en'
    ]
    ordering_fields = ['is_recommended', 'price', 'created_at', 'portion_weight', 'calories']
    ordering = ['-is_recommended', '-created_at']

    bulk_delete_model = Product
    bulk_delete_label = 'products'

    def get_queryset(self):
        qs = Product.objects.select_related('category')
        # Legacy alias kept for older clients that send ?category_id= instead of ?category=
        cat_id = self.request.query_params.get('category_id')
        if cat_id and cat_id.isdigit():
            qs = qs.filter(category_id=int(cat_id))
        return qs

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        Duplicate a product (Nusxa ko'chirish).

        Names are copied verbatim with a suffix so the two rows are distinguishable
        in the admin list, and translation is skipped: the source row is already
        translated, so re-running it would only add a network round-trip.
        """
        original = self.get_object()

        def copy_name(value):
            if not value:
                return value
            return f"{value} (Nusxa)"[:200]

        new_product = Product(
            category=original.category,
            name_uz=copy_name(original.name_uz),
            name_ru=copy_name(original.name_ru),
            name_en=copy_name(original.name_en),
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
        # Mark the translatable fields as already settled so save() skips translation.
        new_product._remember_translatable()
        new_product.save()

        serializer = self.get_serializer(new_product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
