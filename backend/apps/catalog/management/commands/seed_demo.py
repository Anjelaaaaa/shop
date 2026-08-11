from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.catalog.models import Category, Product

User = get_user_model()


class Command(BaseCommand):
    help = "Наполняет базу демо-данными: пользователи, категории, товары."

    def handle(self, *args, **options):
        users = [
            ("admin@shop.com", "ADMIN", True),
            ("manager@shop.com", "MANAGER", False),
            ("buyer@shop.com", "USER", False),
        ]
        for email, role, is_super in users:
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"Пользователь {email} уже есть")
                continue
            if is_super:
                User.objects.create_superuser(email=email, password="demo12345")
            else:
                User.objects.create_user(
                    email=email, password="demo12345", role=role,
                    first_name="Demo", last_name=role.capitalize(),
                )
            self.stdout.write(f"Создан пользователь {email} ({role})")

        cat_tonal, _ = Category.objects.get_or_create(name="Тональные средства")
        cat_care, _ = Category.objects.get_or_create(name="Уход за кожей")

        products = [
            ("Тональный крем Natural", "Лёгкое покрытие на каждый день.", cat_tonal, "1290.00", 40),
            ("BB-крем Hydra", "Увлажняющий BB-крем с SPF.", cat_tonal, "990.00", 55),
            ("Сыворотка Glow", "Сыворотка с витамином C.", cat_care, "1750.00", 30),
            ("Крем для лица Soft", "Питательный дневной крем.", cat_care, "820.00", 60),
        ]
        for name, desc, category, price, stock in products:
            _, created = Product.objects.get_or_create(
                name=name,
                defaults=dict(
                    description=desc, category=category, price=price,
                    stock=stock, is_published=True,
                ),
            )
            if created:
                self.stdout.write(f"Создан товар {name}")

        self.stdout.write(self.style.SUCCESS("Демо-данные загружены."))