from django.conf import settings
from django.db import models

from apps.catalog.models import Product


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", "Создан"
        PAID = "PAID", "Оплачен"
        PROCESSING = "PROCESSING", "Обрабатывается"
        SHIPPED = "SHIPPED", "Отправлен"
        COMPLETED = "COMPLETED", "Завершён"
        CANCELLED = "CANCELLED", "Отменён"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
        verbose_name="пользователь",
    )
    status = models.CharField(
        "статус", max_length=20, choices=Status.choices, default=Status.NEW
    )
    created_at = models.DateTimeField("дата создания", auto_now_add=True)
    updated_at = models.DateTimeField("дата обновления", auto_now=True)

    class Meta:
        verbose_name = "заказ"
        verbose_name_plural = "заказы"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Заказ #{self.id} ({self.user.email})"

    @property
    def total(self):
        return sum((item.price * item.quantity for item in self.items.all()), 0)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="заказ",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
        verbose_name="товар",
    )
    product_name = models.CharField("название товара", max_length=200)
    price = models.DecimalField("цена на момент покупки", max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField("количество")

    def __str__(self):
        return f"{self.product_name} × {self.quantity}"