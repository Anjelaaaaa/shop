import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../shared/api/client";
import { Link } from "react-router-dom";
import { Dropdown } from "../components/Dropdown";

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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories/")).data,
  });

  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products", search, category, ordering, minPrice, maxPrice, inStock],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (ordering) params.ordering = ordering;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (inStock) params.in_stock = "true";
      const res = await api.get("/products/", { params });
      return res.data;
    },
  });

  return (
    <div className="page">
      <h1 className="page-title">Каталог</h1>
      <p className="page-subtitle">Косметика, которая подчёркивает твою красоту</p>

      <div className="toolbar">
        <input
          className="field field-search"
          placeholder="Поиск по названию…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="field"
          type="number"
          min="0"
          placeholder="Цена от"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ width: 110 }}
        />
        <input
          className="field"
          type="number"
          min="0"
          placeholder="Цена до"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ width: 110 }}
        />
        <label className="stock-filter">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          Только в наличии
        </label>
        <Dropdown
          value={category}
          onChange={setCategory}
          options={[
            { value: "", label: "Все категории" },
            ...(categories?.map((c) => ({ value: String(c.id), label: c.name })) ?? []),
          ]}
          placeholder="Все категории"
        />
        <Dropdown
          value={ordering}
          onChange={setOrdering}
          options={[
            { value: "", label: "Без сортировки" },
            { value: "price", label: "Цена: по возрастанию" },
            { value: "-price", label: "Цена: по убыванию" },
            { value: "-created_at", label: "Сначала новые" },
          ]}
          placeholder="Без сортировки"
        />
      </div>

      {isLoading && <p className="state">Загрузка каталога…</p>}
      {isError && <p className="state">Не удалось загрузить товары</p>}
      {data && data.length === 0 && <p className="state">Товары не найдены</p>}

      {data && data.length > 0 && (
        <div className="grid">
          {data.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="card">
              <div className="card-media">
                {p.image_url ? <img src={p.image_url} alt={p.name} /> : null}
                <span className={p.stock > 0 ? "stock-tag stock-in" : "stock-tag stock-out"}>
                  {p.stock > 0 ? "В наличии" : "Нет в наличии"}
                </span>
              </div>
              <div className="card-body">
                <span className="card-cat">{p.category_name}</span>
                <span className="card-name">{p.name}</span>
                <span className="card-price">{p.price} ₽</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
