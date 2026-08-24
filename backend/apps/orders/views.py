from django.db import transaction
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order
from apps.catalog.models import Product
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related("items")
        if user.role in ("MANAGER", "ADMIN"):
            return qs
        return qs.filter(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def _serialized(self, order):
        return OrderSerializer(order, context=self.get_serializer_context()).data

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(self._serialized(order), status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.status != Order.Status.NEW:
            return Response(
                {"detail": "Оплатить можно только заказ в статусе «Создан»."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = Order.Status.PAID
        order.save()
        return Response(self._serialized(order))

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in (Order.Status.NEW, Order.Status.PAID):
            return Response(
                {"detail": "Отменить можно только заказ в статусе «Создан» или «Оплачен»."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            for item in order.items.all():
                if item.product_id:
                    product = Product.objects.select_for_update().get(pk=item.product_id)
                    product.stock += item.quantity
                    product.save()
            order.status = Order.Status.CANCELLED
            order.save()
        return Response(self._serialized(order))

    @action(detail=True, methods=["patch"], url_path="status")
    def change_status(self, request, pk=None):
        user = request.user
        if user.role not in ("MANAGER", "ADMIN"):
            return Response({"detail": "Недостаточно прав."}, status=status.HTTP_403_FORBIDDEN)
        order = self.get_object()
        new_status = request.data.get("status")
        allowed = {Order.Status.PROCESSING, Order.Status.SHIPPED, Order.Status.COMPLETED}
        if new_status not in allowed:
            return Response(
                {"detail": "Менеджер может перевести заказ только в «Обрабатывается», «Отправлен» или «Завершён»."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status in (Order.Status.CANCELLED, Order.Status.COMPLETED):
            return Response(
                {"detail": "Отменённый или завершённый заказ изменить нельзя."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = new_status
        order.save()
        return Response(self._serialized(order))