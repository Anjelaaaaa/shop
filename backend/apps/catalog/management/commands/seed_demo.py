from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    def handle(self, *args, **options):
        users = [
            ("admin@shop.com", "ADMIN", True, "Admin", ""),
            ("manager@shop.com", "MANAGER", False, "Manager", ""),
            ("anjik14.01@gmail.com", "USER", False, "Анжелика", "Оноприенко"),
        ]
        for email, role, is_super, first_name, last_name in users:
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"Пользователь {email} уже есть")
                continue
            if is_super:
                User.objects.create_superuser(
                    email=email, password="cjif34f8y57gjtn", first_name=first_name
                )
            else:
                User.objects.create_user(
                    email=email,
                    password="cjif34f8y57gjtn",
                    role=role,
                    first_name=first_name,
                    last_name=last_name,
                )
            self.stdout.write(f"Создан пользователь {email} ({role})")

        call_command("loaddata", "catalog.json")
        self.stdout.write(self.style.SUCCESS("Данные загружены"))
