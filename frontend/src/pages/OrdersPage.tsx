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

  if (isLoading) return <p className="state">Загрузка…</p>;
  if (isError) return <p className="state">Ошибка загрузки заказов</p>;
  if (!data || data.length === 0)
    return (
      <div className="page">
        <h1 className="page-title">Мои заказы</h1>
        <p className="state">
          У вас пока нет заказов. <Link to="/" className="link-accent">В каталог</Link>
        </p>
      </div>
    );

  return (
    <div className="page">
      <h1 className="page-title">Мои заказы</h1>
      {data.map((o) => (
        <Link key={o.id} to={`/orders/${o.id}`} className="tile glass">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div className="row-title">Заказ #{o.id}</div>
              <div className="row-sub">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <span className="status-pill">{STATUS_LABELS[o.status] || o.status}</span>
          </div>
          <div className="card-price" style={{ fontSize: 18, marginTop: 8 }}>{o.total} ₽</div>
        </Link>
      ))}
    </div>
  );
}
