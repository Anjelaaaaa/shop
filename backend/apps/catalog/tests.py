from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Category

User = get_user_model()


class ProductPermissionTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Тест")
        self.manager = User.objects.create_user(email="m@shop.com", password="x", role="MANAGER")
        self.user = User.objects.create_user(email="u@shop.com", password="x")

    def _payload(self):
        return {"name": "Товар", "category": self.category.id,
                "price": "100.00", "stock": 5, "is_published": True}

    def test_manager_can_create_product(self):
        self.client.force_authenticate(self.manager)
        resp = self.client.post("/api/products/", self._payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_user_cannot_create_product(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post("/api/products/", self._payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)