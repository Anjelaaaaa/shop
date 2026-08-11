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
      <div style={{ padding: 16 }}>
        <h1>Корзина</h1>
        <p>
          Корзина пуста. <Link to="/">Перейти в каталог</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <h1>Корзина</h1>
      {items.map((i) => (
        <div
          key={i.id}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            borderBottom: "1px solid #eee",
            padding: "8px 0",
          }}
        >
          <div style={{ flex: 1 }}>
            <b>{i.name}</b>
            <div style={{ color: "#888" }}>
              {i.price} ₽ × {i.quantity}
            </div>
          </div>
          <input
            type="number"
            min={1}
            max={i.stock}
            value={i.quantity}
            onChange={(e) => updateQty(i.id, Number(e.target.value))}
            style={{ width: 60, padding: 4 }}
          />
          <button onClick={() => removeItem(i.id)}>Удалить</button>
        </div>
      ))}

      <h2 style={{ marginTop: 16 }}>Итого: {total} ₽</h2>

      {checkout.isError && (
        <p style={{ color: "red" }}>{getErrorMessage(checkout.error)}</p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => checkout.mutate()} disabled={checkout.isPending}>
          {checkout.isPending ? "Оформление…" : "Оформить заказ"}
        </button>
        <button onClick={clear}>Очистить корзину</button>
      </div>
    </div>
  );
}