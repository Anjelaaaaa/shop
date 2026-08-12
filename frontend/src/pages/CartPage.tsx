import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCart } from "../features/cart/CartContext";
import { api } from "../shared/api/client";

function getErrorMessage(error: unknown): string {
  const data = (error as any)?.response?.data;
  if (!data) return "Не удалось оформить заказ";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.join(" ");
  if (data.detail) return String(data.detail);
  const first = Object.values(data)[0];
  return Array.isArray(first) ? first.join(" ") : String(first);
}

export default function CartPage() {
  const { items, removeItem, updateQty, clear, total } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const checkout = useMutation({
    mutationFn: async () => {
      const payload = {
        items: items.map((i) => ({ product: i.id, quantity: i.quantity })),
      };
      return (await api.post("/orders/", payload)).data;
    },
    onSuccess: () => {
      clear();
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate("/orders");
    },
  });

  if (items.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title centered">Корзина</h1>
        <p className="state">
          Корзина пуста. <Link to="/" className="link-accent">Перейти в каталог</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title centered">Корзина</h1>
      <div className="panel glass" style={{ maxWidth: 720 }}>
        {items.map((i) => (
          <div key={i.id} className="row-line">
            <div className="grow">
              <div className="row-title">{i.name}</div>
              <div className="row-sub">{i.price} ₽ × {i.quantity}</div>
            </div>
            <input
              className="qty-input"
              type="number"
              min={1}
              max={i.stock}
              value={i.quantity}
              onChange={(e) => updateQty(i.id, Number(e.target.value))}
            />
            <button className="btn btn-danger btn-sm" onClick={() => removeItem(i.id)}>Удалить</button>
          </div>
        ))}

        <div className="total-line">Итого: {total} ₽</div>

        {checkout.isError && <p className="form-err">{getErrorMessage(checkout.error)}</p>}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => checkout.mutate()} disabled={checkout.isPending}>
            {checkout.isPending ? "Оформление…" : "Оформить заказ"}
          </button>
          <button className="btn btn-ghost" onClick={clear}>Очистить корзину</button>
        </div>
      </div>
    </div>
  );
}
