import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
    <div className="page" style={{ maxWidth: 560 }}>
      <Link to="/manage/products" className="back-link">← К товарам</Link>
      <h1 className="page-title centered">{isEdit ? "Редактировать товар" : "Создать товар"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="panel glass form-card">
        <div className="form-row">
          <label>Название</label>
          <input {...register("name", { required: "Введите название" })} />
          {errors.name && <span className="form-err">{errors.name.message}</span>}
        </div>

        <div className="form-row">
          <label>Описание</label>
          <textarea {...register("description")} rows={4} />
        </div>

        <div className="form-row">
          <label>Категория</label>
          <select {...register("category", { required: "Выберите категорию" })}>
            <option value="">— выбрать —</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category && <span className="form-err">{errors.category.message}</span>}
        </div>

        <div className="form-row">
          <label>Цена</label>
          <input
            {...register("price", {
              required: "Введите цену",
              min: { value: 0, message: "Цена не может быть отрицательной" },
            })}
            type="number"
            step="0.01"
          />
          {errors.price && <span className="form-err">{errors.price.message}</span>}
        </div>

        <div className="form-row">
          <label>Количество на складе</label>
          <input
            {...register("stock", {
              required: "Введите количество",
              min: { value: 0, message: "Не может быть отрицательным" },
              valueAsNumber: true,
            })}
            type="number"
          />
          {errors.stock && <span className="form-err">{errors.stock.message}</span>}
        </div>

        <div className="form-row">
          <label>URL изображения</label>
          <input {...register("image_url")} />
        </div>

        <div className="form-row checkbox-row">
          <input {...register("is_published")} type="checkbox" id="pub" />
          <label htmlFor="pub" style={{ margin: 0 }}>Опубликован</label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
