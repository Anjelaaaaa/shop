import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/api/client";

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  is_published: boolean;
  category_name: string;
}

const cell: React.CSSProperties = { border: "1px solid #ddd", padding: 8, textAlign: "left" };

export default function ManageProductsPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["manage-products"],
    queryFn: async () => (await api.get("/products/")).data,
  });

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manage-products"] }),
  });

  if (isLoading) return <p style={{ padding: 16 }}>Загрузка…</p>;
  if (isError) return <p style={{ padding: 16 }}>Ошибка загрузки</p>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Управление товарами</h1>
      <Link to="/manage/products/new">+ Создать товар</Link>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr>
            <th style={cell}>Название</th>
            <th style={cell}>Категория</th>
            <th style={cell}>Цена</th>
            <th style={cell}>Остаток</th>
            <th style={cell}>Опубликован</th>
            <th style={cell}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((p) => (
            <tr key={p.id}>
              <td style={cell}>{p.name}</td>
              <td style={cell}>{p.category_name}</td>
              <td style={cell}>{p.price} ₽</td>
              <td style={cell}>{p.stock}</td>
              <td style={cell}>{p.is_published ? "да" : "нет"}</td>
              <td style={cell}>
                <Link to={`/manage/products/${p.id}`}>Изменить</Link>{" "}
                <button
                  onClick={() => {
                    if (confirm(`Удалить «${p.name}»?`)) del.mutate(p.id);
                  }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}