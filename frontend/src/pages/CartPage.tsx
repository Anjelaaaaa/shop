import { Link } from "react-router-dom";
import { useCart } from "../features/cart/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQty, clear, total } = useCart();

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
      <button onClick={clear} style={{ marginTop: 8 }}>
        Очистить корзину
      </button>
    </div>
  );
}