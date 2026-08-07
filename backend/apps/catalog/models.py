from django.db import models


class Category(models.Model):
    name = models.CharField("название", max_length=100, unique=True)

    class Meta:
        verbose_name = "категория"
        verbose_name_plural = "категории"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField("название", max_length=200)
    description = models.TextField("описание", blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="категория",
    )
    price = models.DecimalField("цена", max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField("количество на складе", default=0)
    is_published = models.BooleanField("опубликован", default=False)
    image_url = models.URLField("изображение", blank=True)
    created_at = models.DateTimeField("дата создания", auto_now_add=True)
    updated_at = models.DateTimeField("дата обновления", auto_now=True)

    class Meta:
        verbose_name = "товар"
        verbose_name_plural = "товары"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name