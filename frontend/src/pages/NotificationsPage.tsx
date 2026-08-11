import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/api/client";

interface Notification {
  id: number;
  text: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [highlight, setHighlight] = useState<Set<number>>(new Set());
  const captured = useRef(false);

  const { data, isLoading, isError } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications/")).data,
  });

  useEffect(() => {
    if (!data || captured.current) return;
    captured.current = true;

    const unread = data.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;

    setHighlight(new Set(unread));

    const timer = setTimeout(() => {
      Promise.all(unread.map((id) => api.post(`/notifications/${id}/read/`))).then(
        () => qc.invalidateQueries({ queryKey: ["notifications"] }),
      );
      setHighlight(new Set());
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, qc]);

  if (isLoading) return <p style={{ padding: 16 }}>Загрузка…</p>;
  if (isError) return <p style={{ padding: 16 }}>Ошибка загрузки</p>;
  if (!data || data.length === 0)
    return <p style={{ padding: 16 }}>Уведомлений нет</p>;

  return (
    <div style={{ padding: 16, maxWidth: 600 }}>
      <h1>Уведомления</h1>
      {data.map((n) => {
        const isNew = highlight.has(n.id);
        return (
          <div
            key={n.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              background: isNew ? "#dbeafe" : "#fff",
              transition: "background 0.8s ease",
            }}
          >
            <div>{n.text}</div>
            <div style={{ color: "#888", fontSize: 12 }}>
              {new Date(n.created_at).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}