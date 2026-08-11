import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/api/client";

interface Category {
  id: number;
  name: string;
}

interface FormValues {
  name: string;
  description: string;
  category: number | "";
  price: string;
  stock: number;
  image_url: string;
  is_published: boolean;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      stock: 0,
      image_url: "",
      is_published: false,
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories/")).data,
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}/`).then((res) => {
        reset({
          name: res.data.name,
          description: res.data.description,
          category: res.data.category,
          price: res.data.price,
          stock: res.data.stock,
          image_url: res.data.image_url,
          is_published: res.data.is_published,
        });
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await api.patch(`/products/${id}/`, values);
      } else {
        await api.post("/products/", values);
      }
      qc.invalidateQueries({ queryKey: ["manage-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate("/manage/products");
    } catch (err: any) {

      const data = err.response?.data;
      if (data && typeof data === "object") {
        Object.entries(data).forEach(([field, msgs]) => {
          setError(field as keyof FormValues, {
            message: Array.isArray(msgs) ? msgs.join(" ") : String(msgs),
          });
        });
      }
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 500 }}>
      <h1>{isEdit ? "Редактировать товар" : "Создать товар"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
        <label>
          Название
          <input {...register("name", { required: "Введите название" })} style={{ width: "100%" }} />
          {errors.name && <span style={{ color: "red" }}>{errors.name.message}</span>}
        </label>

        <label>
          Описание
          <textarea {...register("description")} rows={4} style={{ width: "100%" }} />
        </label>

        <label>
          Категория
          <select {...register("category", { required: "Выберите категорию" })} style={{ width: "100%" }}>
            <option value="">— выбрать —</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <span style={{ color: "red" }}>{errors.category.message}</span>}
        </label>

        <label>
          Цена
          <input
            {...register("price", {
              required: "Введите цену",
              min: { value: 0, message: "Цена не может быть отрицательной" },
            })}
            type="number"
            step="0.01"
            style={{ width: "100%" }}
          />
          {errors.price && <span style={{ color: "red" }}>{errors.price.message}</span>}
        </label>

        <label>
          Количество на складе
          <input
            {...register("stock", {
              required: "Введите количество",
              min: { value: 0, message: "Не может быть отрицательным" },
              valueAsNumber: true,
            })}
            type="number"
            style={{ width: "100%" }}
          />
          {errors.stock && <span style={{ color: "red" }}>{errors.stock.message}</span>}
        </label>

        <label>
          URL изображения
          <input {...register("image_url")} style={{ width: "100%" }} />
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input {...register("is_published")} type="checkbox" />
          Опубликован
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}