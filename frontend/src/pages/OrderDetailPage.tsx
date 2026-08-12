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

  if (isLoading) return <p className="state">Загрузка…</p>;
  if (isError || !data) return <p className="state">Заказ не найден</p>;

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <Link to="/orders" className="back-link">← К моим заказам</Link>

      <div className="panel glass">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>Заказ #{data.id}</h1>
            <div className="row-sub">{new Date(data.created_at).toLocaleString()}</div>
          </div>
          <span className="status-pill">{STATUS_LABELS[data.status] || data.status}</span>
        </div>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Цена</th>
                <th>Кол-во</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.product_name}</td>
                  <td>{i.price} ₽</td>
                  <td>{i.quantity}</td>
                  <td>{(Number(i.price) * i.quantity).toFixed(2)} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="total-line">Итого: {data.total} ₽</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {data.status === "NEW" && (
            <button className="btn btn-primary" onClick={() => pay.mutate()} disabled={pay.isPending}>
              Оплатить
            </button>
          )}
          {(data.status === "NEW" || data.status === "PAID") && (
            <button className="btn btn-ghost" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
              Отменить заказ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
