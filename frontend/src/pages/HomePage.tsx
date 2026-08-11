import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../shared/api/client";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  description: string;
  category_name: string;
  price: string;
  stock: number;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ordering, setOrdering] = useState("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories/")).data,
  });

  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products", search, category, ordering],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (ordering) params.ordering = ordering;
      const res = await api.get("/products/", { params });
      return res.data;
    },
  });

  return (
    <div style={{ padding: 16 }}>
      <h1>Каталог</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          placeholder="Поиск по названию…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, flex: 1, minWidth: 200 }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 8 }}>
          <option value="">Все категории</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)} style={{ padding: 8 }}>
          <option value="">Без сортировки</option>
          <option value="price">Цена: по возрастанию</option>
          <option value="-price">Цена: по убыванию</option>
          <option value="-created_at">Сначала новые</option>
        </select>
      </div>

      {isLoading && <p>Загрузка каталога…</p>}
      {isError && <p>Не удалось загрузить товары</p>}
      {data && data.length === 0 && <p>Товары не найдены</p>}

      {data && data.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
        {data.map((p) => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              textDecoration: "none",
              color: "inherit",
            }}
          >
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 4 }}
                />
              ) : (
                <div style={{ width: "100%", height: 140, background: "#f0f0f0", borderRadius: 4 }} />
              )}
              <h3 style={{ margin: "8px 0 4px" }}>{p.name}</h3>
              <p style={{ color: "#888", fontSize: 13, margin: 0 }}>{p.category_name}</p>
              <p style={{ fontWeight: "bold", margin: "8px 0 0" }}>{p.price} ₽</p>
              <p style={{ fontSize: 13, color: p.stock > 0 ? "green" : "red", margin: "4px 0 0" }}>
                {p.stock > 0 ? `В наличии: ${p.stock}` : "Нет в наличии"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}