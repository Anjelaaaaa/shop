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

  if (isLoading) return <p className="state">Загрузка…</p>;
  if (isError) return <p className="state">Ошибка загрузки</p>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 className="page-title">Управление товарами</h1>
        <Link to="/manage/products/new" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
          + Создать товар
        </Link>
      </div>

      {!data || data.length === 0 ? (
        <p className="state">Товаров пока нет</p>
      ) : (
      <div className="panel glass" style={{ padding: 8 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Опубликован</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category_name}</td>
                  <td>{p.price} ₽</td>
                  <td>{p.stock}</td>
                  <td>{p.is_published ? "да" : "нет"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link to={`/manage/products/${p.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: "none", marginRight: 6 }}>Изменить</Link>
                    <button
                      className="btn btn-danger btn-sm"
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
      </div>
      )}
    </div>
  );
}
