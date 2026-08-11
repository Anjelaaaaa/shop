from django.db import transaction
from rest_framework import serializers

from apps.catalog.models import Product
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "price", "quantity")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = ("id", "user_email", "status", "created_at", "updated_at", "items", "total")


class OrderCreateItemSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    items = OrderCreateItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Заказ не может быть пустым.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        items_data = validated_data["items"]

        with transaction.atomic():
            order = Order.objects.create(user=user)
            for item in items_data:
                try:
                    product = Product.objects.select_for_update().get(pk=item["product"])
                except Product.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Товар с id={item['product']} не найден."
                    )

                qty = item["quantity"]
                if qty > product.stock:
                    raise serializers.ValidationError(
                        f"Недостаточно товара «{product.name}»: "
                        f"доступно {product.stock}, запрошено {qty}."
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    price=product.price,
                    quantity=qty,
                )
                product.stock -= qty
                product.save()

        return order