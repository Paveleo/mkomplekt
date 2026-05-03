from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class RegisterSerializer(LoginSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class UserPublicSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    full_name = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    phone = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    is_admin = serializers.BooleanField()


class ProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class CartItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField()


class CreateOrderSerializer(serializers.Serializer):
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class CategoryPayloadSerializer(serializers.Serializer):
    title = serializers.CharField()
    parent_id = serializers.UUIDField(required=False, allow_null=True)
    image_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    slug = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    sort = serializers.IntegerField(required=False, allow_null=True)


class ReviewPayloadSerializer(serializers.Serializer):
    name = serializers.CharField()
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    role = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    body = serializers.CharField()
    is_published = serializers.BooleanField(required=False)
    sort = serializers.IntegerField(required=False, allow_null=True)
    remove_avatar = serializers.BooleanField(required=False)
    remove_image = serializers.BooleanField(required=False)


class TwoGisReviewImportSerializer(serializers.Serializer):
    source_url = serializers.URLField()
    limit = serializers.IntegerField(required=False, min_value=1, max_value=500)


class MediaAutoparseSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=["missing", "all"], required=False, default="missing")
    limit = serializers.IntegerField(required=False, min_value=1, max_value=200, default=25)
    published_only = serializers.BooleanField(required=False, default=False)


class SortSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    sort = serializers.IntegerField()


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.CharField()


class ContactRequestCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    message = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        name = (attrs.get("name") or "").strip()
        if not name:
            raise serializers.ValidationError({"detail": "NAME_REQUIRED"})
        email = (attrs.get("email") or "").strip()
        phone = (attrs.get("phone") or "").strip()
        if not email and not phone:
            raise serializers.ValidationError({"detail": "EMAIL_OR_PHONE_REQUIRED"})
        attrs["email"] = email or None
        attrs["phone"] = phone or None
        attrs["message"] = (attrs.get("message") or "").strip() or None
        attrs["name"] = name
        return attrs


class ContactRequestStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
