import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../shared/api/client";
import { useCart } from "../features/cart/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  category_name: string;
  price: string;
  stock: number;
  image_url: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const { data, isLoading, isError } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => (await api.get(`/products/${id}/`)).data,
  });

  if (isLoading) return <p style={{ padding: 16 }}>Загрузка…</p>;
  if (isError || !data) return <p style={{ padding: 16 }}>Товар не найден</p>;

  return (
    <div style={{ padding: 16, maxWidth: 800 }}>
      <Link to="/">← Назад в каталог</Link>
      <h1>{data.name}</h1>
      <p style={{ color: "#888" }}>{data.category_name}</p>
      {data.image_url && (
        <img
          src={data.image_url}
          alt={data.name}
          style={{ maxWidth: 320, borderRadius: 8, display: "block", margin: "12px 0" }}
        />
      )}
      <p style={{ fontSize: 24, fontWeight: "bold" }}>{data.price} ₽</p>
      <p style={{ color: data.stock > 0 ? "green" : "red" }}>
        {data.stock > 0 ? `В наличии: ${data.stock}` : "Нет в наличии"}
      </p>
        {data.stock > 0 && (
            <button
            onClick={() =>
                addItem({
                id: data.id,
                name: data.name,
                price: data.price,
                image_url: data.image_url,
                stock: data.stock,
                })
            }
            style={{ padding: "10px 20px", margin: "12px 0", cursor: "pointer" }}
            >
            В корзину
            </button>
        )}
      <p style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>{data.description}</p>
    </div>
  );
}