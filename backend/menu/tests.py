from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Category, Product
from .translator import format_title_case

User = get_user_model()


# Every test runs with outbound translation disabled: the suite must never depend
# on network access, and the dictionary path still exercises the formatting logic.
@override_settings(AUTO_TRANSLATE=False)
class MenuAPITestCase(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username='admin', password='sup3r-s3cret', is_staff=True
        )
        self.plain = User.objects.create_user(username='waiter', password='sup3r-s3cret')
        self.category = Category.objects.create(name_uz='Sho\'rvalar', sort_order=1)
        self.product = Product.objects.create(
            category=self.category,
            name_uz='Mastava',
            price=Decimal('45000.00'),
            portion_weight=350,
            calories=420,
        )

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')


class PublicReadAccessTests(MenuAPITestCase):
    def test_menu_is_readable_without_a_token(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_categories_are_readable_without_a_token(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['products_count'], 1)

    def test_products_count_is_annotated_in_a_single_query(self):
        for index in range(5):
            Category.objects.create(name_uz=f'Kategoriya {index}')
        # One query for the category list; the count comes from the annotation.
        with self.assertNumQueries(1):
            response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, 200)


class WriteProtectionTests(MenuAPITestCase):
    def test_anonymous_cannot_create_a_product(self):
        response = self.client.post('/api/products/', {
            'category': self.category.id,
            'name_uz': 'Yangi Taom',
            'price': '10000',
        })
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Product.objects.count(), 1)

    def test_anonymous_cannot_delete_a_product(self):
        response = self.client.delete(f'/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, 401)
        self.assertTrue(Product.objects.filter(pk=self.product.pk).exists())

    def test_anonymous_cannot_wipe_the_menu(self):
        response = self.client.post('/api/products/delete-all/')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Product.objects.count(), 1)

    def test_anonymous_cannot_wipe_the_categories(self):
        response = self.client.post('/api/categories/delete-all/')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Category.objects.count(), 1)

    def test_non_staff_token_cannot_bulk_delete(self):
        self.authenticate(self.plain)
        response = self.client.post('/api/products/delete-all/')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Product.objects.count(), 1)

    def test_staff_token_can_create_a_product(self):
        self.authenticate(self.staff)
        response = self.client.post('/api/products/', {
            'category': self.category.id,
            'name_uz': 'Yangi Taom',
            'price': '10000',
        })
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(Product.objects.count(), 2)


class AuthEndpointTests(MenuAPITestCase):
    def test_login_returns_a_token_for_staff(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'admin', 'password': 'sup3r-s3cret',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'admin')

    def test_login_rejects_a_wrong_password(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'admin', 'password': 'wrong',
        })
        self.assertEqual(response.status_code, 401)

    def test_login_rejects_a_non_staff_account(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'waiter', 'password': 'sup3r-s3cret',
        })
        self.assertEqual(response.status_code, 403)

    def test_me_requires_a_valid_token(self):
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 401)
        self.authenticate(self.staff)
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 200)

    def test_logout_invalidates_the_token(self):
        self.authenticate(self.staff)
        self.assertEqual(self.client.post('/api/auth/logout/').status_code, 204)
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 401)


class BulkDeleteTests(MenuAPITestCase):
    def test_delete_all_categories_reports_only_categories(self):
        self.authenticate(self.staff)
        Product.objects.create(category=self.category, name_uz='Ikkinchi', price=1)
        response = self.client.post('/api/categories/delete-all/')
        self.assertEqual(response.status_code, 200)
        # Two products cascade away, but the user asked about the single category.
        self.assertEqual(response.data['deleted'], 1)
        self.assertEqual(Product.objects.count(), 0)

    def test_delete_selected_rejects_a_non_list_payload(self):
        self.authenticate(self.staff)
        response = self.client.post('/api/products/delete-selected/', {'ids': 'all'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Product.objects.count(), 1)

    def test_delete_selected_rejects_non_numeric_ids(self):
        self.authenticate(self.staff)
        response = self.client.post(
            '/api/products/delete-selected/', {'ids': [self.product.id, 'oops']}, format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Product.objects.count(), 1)

    def test_delete_selected_removes_only_the_given_ids(self):
        self.authenticate(self.staff)
        keeper = Product.objects.create(category=self.category, name_uz='Qoladi', price=1)
        response = self.client.post(
            '/api/products/delete-selected/', {'ids': [self.product.id]}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['deleted'], 1)
        self.assertEqual(list(Product.objects.values_list('pk', flat=True)), [keeper.pk])


class DuplicateTests(MenuAPITestCase):
    def test_duplicate_copies_nutrition_and_marks_the_name(self):
        self.authenticate(self.staff)
        response = self.client.post(f'/api/products/{self.product.id}/duplicate/')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Product.objects.count(), 2)
        copy = Product.objects.exclude(pk=self.product.pk).get()
        self.assertEqual(copy.portion_weight, 350)
        self.assertEqual(copy.calories, 420)
        self.assertIn('Nusxa', copy.name_uz)

    def test_duplicate_does_not_call_the_translator(self):
        self.authenticate(self.staff)
        with patch('menu.models.auto_translate_product') as translate:
            self.client.post(f'/api/products/{self.product.id}/duplicate/')
        translate.assert_not_called()


class ValidationTests(MenuAPITestCase):
    def test_product_requires_at_least_one_name(self):
        self.authenticate(self.staff)
        response = self.client.post('/api/products/', {
            'category': self.category.id, 'name_uz': '', 'price': '5000',
        })
        self.assertEqual(response.status_code, 400)

    def test_negative_price_is_rejected(self):
        self.authenticate(self.staff)
        response = self.client.post('/api/products/', {
            'category': self.category.id, 'name_uz': 'Manfiy', 'price': '-100',
        })
        self.assertEqual(response.status_code, 400)

    def test_image_url_can_be_cleared_with_a_blank_string(self):
        self.authenticate(self.staff)
        self.product.image_url = 'https://example.com/osh.jpg'
        self.product.save()
        response = self.client.patch(
            f'/api/products/{self.product.id}/', {'image_url': ''}, format='json'
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.product.refresh_from_db()
        self.assertEqual(self.product.image_url, '')


class TranslationTriggerTests(MenuAPITestCase):
    def test_toggling_is_active_does_not_retranslate(self):
        product = Product.objects.get(pk=self.product.pk)
        with patch('menu.models.auto_translate_product') as translate:
            product.is_active = False
            product.save()
        translate.assert_not_called()

    def test_changing_the_name_retranslates(self):
        product = Product.objects.get(pk=self.product.pk)
        with patch('menu.models.auto_translate_product') as translate:
            product.name_uz = 'Boshqa Nom'
            product.save()
        translate.assert_called_once()

    def test_category_reordering_does_not_retranslate(self):
        category = Category.objects.get(pk=self.category.pk)
        with patch('menu.models.auto_translate_category') as translate:
            category.sort_order = 9
            category.save()
        translate.assert_not_called()


class FormatTitleCaseTests(TestCase):
    def test_preserves_uzbek_apostrophes(self):
        self.assertEqual(format_title_case("TO'Y OSHI"), "To'y Oshi")
        self.assertEqual(format_title_case("sho'rva"), "Sho'rva")

    def test_capitalises_after_hyphens_and_collapses_whitespace(self):
        self.assertEqual(format_title_case('qozon-kabob'), 'Qozon-Kabob')
        self.assertEqual(format_title_case('  issiq   taomlar '), 'Issiq Taomlar')

    def test_handles_cyrillic(self):
        self.assertEqual(format_title_case('горячие блюда'), 'Горячие Блюда')

    def test_handles_empty_input(self):
        self.assertEqual(format_title_case(''), '')
        self.assertEqual(format_title_case(None), '')
