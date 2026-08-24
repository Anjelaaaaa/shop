from rest_framework import serializers

from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("id", "email", "password", "first_name", "last_name")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="profile.phone", allow_blank=True, required=False)
    created_at = serializers.DateTimeField(source="profile.created_at", read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role", "phone", "created_at")
        read_only_fields = ("id", "email", "role", "created_at")

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})

        instance = super().update(instance, validated_data)

        if "phone" in profile_data:
            instance.profile.phone = profile_data["phone"]
            instance.profile.save()

        return instance