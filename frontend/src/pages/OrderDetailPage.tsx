import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/api/client";
import { STATUS_LABELS } from "./OrdersPage";

interface OrderItem {
  id: number;
  product_name: string;
  price: string;
  quantity: number;
}
interface Order {
  id: number;
  status: string;
  created_at: string;
  total: string;
  items: OrderItem[];
}

const cell: React.CSSProperties = { border: "1px solid #ddd", padding: 8, textAlign: "left" };

export default function OrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: async () => (await api.get(`/orders/${id}/`)).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["order", id] });
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const pay = useMutation({
    mutationFn: () => api.post(`/orders/${id}/pay/`),
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: () => api.post(`/orders/${id}/cancel/`),
    onSuccess: invalidate,
  });

  if (isLoading) return <p style={{ padding: 16 }}>Загрузка…</p>;
  if (isError || !data) return <p style={{ padding: 16 }}>Заказ не найден</p>;

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <Link to="/orders">← К моим заказам</Link>
      <h1>Заказ #{data.id}</h1>
      <p>
        Статус: <b>{STATUS_LABELS[data.status] || data.status}</b>
      </p>
      <p style={{ color: "#888" }}>{new Date(data.created_at).toLocaleString()}</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr>
            <th style={cell}>Товар</th>
            <th style={cell}>Цена</th>
            <th style={cell}>Кол-во</th>
            <th style={cell}>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((i) => (
            <tr key={i.id}>
              <td style={cell}>{i.product_name}</td>
              <td style={cell}>{i.price} ₽</td>
              <td style={cell}>{i.quantity}</td>
              <td style={cell}>{(Number(i.price) * i.quantity).toFixed(2)} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 16 }}>Итого: {data.total} ₽</h2>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {data.status === "NEW" && (
          <button onClick={() => pay.mutate()} disabled={pay.isPending}>
            Оплатить
          </button>
        )}
        {(data.status === "NEW" || data.status === "PAID") && (
          <button onClick={() => cancel.mutate()} disabled={cancel.isPending}>
            Отменить заказ
          </button>
        )}
      </div>
    </div>
  );
}