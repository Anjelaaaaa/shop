import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/api/client";
import { STATUS_LABELS } from "./OrdersPage";

interface Order {
  id: number;
  user_email: string;
  status: string;
  created_at: string;
  total: string;
}

const MANAGER_STATUSES = ["PROCESSING", "SHIPPED", "COMPLETED"];

export default function ManageOrdersPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<Order[]>({
    queryKey: ["manage-orders"],
    queryFn: async () => (await api.get("/orders/")).data,
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/orders/${id}/status/`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manage-orders"] }),
    onError: (e: any) =>
      alert(e?.response?.data?.detail || "Не удалось сменить статус"),
  });

  if (isLoading) return <p className="state">Загрузка…</p>;
  if (isError) return <p className="state">Ошибка загрузки</p>;
  if (!data || data.length === 0)
    return (
      <div className="page">
        <h1 className="page-title">Управление заказами</h1>
        <p className="state">Заказов пока нет</p>
      </div>
    );

  return (
    <div className="page">
      <h1 className="page-title">Управление заказами</h1>

      <div className="panel glass" style={{ padding: 8 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Покупатель</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Сменить статус</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.user_email}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{o.total} ₽</td>
                  <td><span className="status-pill">{STATUS_LABELS[o.status] || o.status}</span></td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {MANAGER_STATUSES.map((s) => (
                      <button
                        key={s}
                        className="btn btn-ghost btn-sm"
                        onClick={() => changeStatus.mutate({ id: o.id, status: s })}
                        style={{ marginRight: 6 }}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
