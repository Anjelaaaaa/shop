from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register(self):
        resp = self.client.post(
            "/api/auth/register/",
            {"email": "new@shop.com", "password": "test12345",
             "first_name": "Иван", "last_name": "Иванов"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="new@shop.com").exists())

    def test_login(self):
        User.objects.create_user(email="u@shop.com", password="test12345")
        resp = self.client.post(
            "/api/auth/token/",
            {"email": "u@shop.com", "password": "test12345"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)