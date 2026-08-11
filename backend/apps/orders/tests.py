from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Category, Product

User = get_user_model()


class OrderTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Тест")
        self.product = Product.objects.create(
            name="Товар", category=self.category,
            price="100.00", stock=10, is_published=True,
        )
        self.user = User.objects.create_user(email="u@shop.com", password="x")
        self.other = User.objects.create_user(email="o@shop.com", password="x")

    def _order(self, qty):
        return self.client.post(
            "/api/orders/",
            {"items": [{"product": self.product.id, "quantity": qty}]},
            format="json",
        )

    def test_create_order_decrements_stock(self):
        self.client.force_authenticate(self.user)
        resp = self._order(3)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)  # 10 - 3

    def test_cannot_order_more_than_stock(self):
        self.client.force_authenticate(self.user)
        resp = self._order(999)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)  # остаток не тронут

    def test_cancel_returns_stock(self):
        self.client.force_authenticate(self.user)
        order_id = self._order(4).data["id"]
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 6)
        self.client.post(f"/api/orders/{order_id}/cancel/")
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)  # вернулся

    def test_cannot_access_other_users_order(self):
        self.client.force_authenticate(self.user)
        order_id = self._order(1).data["id"]
        self.client.force_authenticate(self.other)  # другой пользователь
        resp = self.client.get(f"/api/orders/{order_id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)