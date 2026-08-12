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

    const unread = data.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;

    captured.current = true;
    setHighlight(new Set(unread));

    Promise.all(unread.map((id) => api.post(`/notifications/${id}/read/`)));

    setTimeout(() => {
      setHighlight(new Set());
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }, 3000);
  }, [data, qc]);

  if (isLoading) return <p className="state">Загрузка…</p>;
  if (isError) return <p className="state">Ошибка загрузки</p>;
  if (!data || data.length === 0)
    return (
      <div className="page">
        <h1 className="page-title centered">Уведомления</h1>
        <p className="state">Уведомлений нет</p>
      </div>
    );

  return (
    <div className="page">
      <h1 className="page-title centered">Уведомления</h1>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {data.map((n) => {
          const isNew = highlight.has(n.id);
          return (
            <div key={n.id} className={isNew ? "notif notif-new" : "notif"}>
              <div className="notif-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <div className="notif-text">{n.text}</div>
                <div className="row-sub">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {isNew && <span className="notif-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
