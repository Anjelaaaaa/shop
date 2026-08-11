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
const cell: React.CSSProperties = { border: "1px solid #ddd", padding: 8, textAlign: "left" };

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

  if (isLoading) return <p style={{ padding: 16 }}>Загрузка…</p>;
  if (isError) return <p style={{ padding: 16 }}>Ошибка загрузки</p>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Управление заказами</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cell}>#</th>
            <th style={cell}>Покупатель</th>
            <th style={cell}>Дата</th>
            <th style={cell}>Сумма</th>
            <th style={cell}>Статус</th>
            <th style={cell}>Сменить статус</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((o) => (
            <tr key={o.id}>
              <td style={cell}>{o.id}</td>
              <td style={cell}>{o.user_email}</td>
              <td style={cell}>{new Date(o.created_at).toLocaleDateString()}</td>
              <td style={cell}>{o.total} ₽</td>
              <td style={cell}>{STATUS_LABELS[o.status] || o.status}</td>
              <td style={cell}>
                {MANAGER_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus.mutate({ id: o.id, status: s })}
                    style={{ marginRight: 4 }}
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
  );
}