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

  if (isLoading) return <p className="state">Загрузка…</p>;
  if (isError || !data) return <p className="state">Товар не найден</p>;

  return (
    <div className="detail">
      <Link to="/" className="back-link">← Назад в каталог</Link>

      <div className="detail-card glass">
        <div className="detail-media">
          {data.image_url ? <img src={data.image_url} alt={data.name} /> : null}
        </div>

        <div className="detail-info">
          <span className="card-cat">{data.category_name}</span>
          <h1>{data.name}</h1>
          <p className="card-price">{data.price} ₽</p>
          <span className={data.stock > 0 ? "badge badge-in" : "badge badge-out"}>
            {data.stock > 0 ? `В наличии: ${data.stock}` : "Нет в наличии"}
          </span>

          <div style={{ marginTop: 16 }}>
            {data.stock > 0 && (
              <button
                className="btn btn-primary"
                onClick={() =>
                  addItem({
                    id: data.id,
                    name: data.name,
                    price: data.price,
                    image_url: data.image_url,
                    stock: data.stock,
                  })
                }
              >
                В корзину
              </button>
            )}
          </div>

          <p className="detail-desc">{data.description}</p>
        </div>
      </div>
    </div>
  );
}
