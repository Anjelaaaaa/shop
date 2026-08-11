import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../shared/api/client";

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

export const STATUS_LABELS: Record<string, string> = {
  NEW: "Создан",
  PAID: "Оплачен",
  PROCESSING: "Обрабатывается",
  SHIPPED: "Отправлен",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

export default function OrdersPage() {
  const { data, isLoading, isError } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders/")).data,
  });

  if (isLoading) return <p style={{ padding: 16 }}>Загрузка…</p>;
  if (isError) return <p style={{ padding: 16 }}>Ошибка загрузки заказов</p>;
  if (!data || data.length === 0)
    return (
      <p style={{ padding: 16 }}>
        У вас пока нет заказов. <Link to="/">В каталог</Link>
      </p>
    );

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <h1>Мои заказы</h1>
      {data.map((o) => (
        <Link
          key={o.id}
          to={`/orders/${o.id}`}
          style={{
            display: "block",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <b>Заказ #{o.id}</b> — {STATUS_LABELS[o.status] || o.status}
          <div style={{ color: "#888" }}>{new Date(o.created_at).toLocaleString()}</div>
          <div>Сумма: {o.total} ₽</div>
        </Link>
      ))}
    </div>
  );
}