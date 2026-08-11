from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.orders.models import Order
from .models import Notification


@receiver(post_save, sender=Order)
def order_notification(sender, instance, created, **kwargs):
    if created:
        text = f"Заказ #{instance.id} создан."
    else:
        text = f"Статус заказа #{instance.id}: {instance.get_status_display()}."
    Notification.objects.create(user=instance.user, text=text)