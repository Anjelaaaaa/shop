import { useQuery } from "@tanstack/react-query";
import { api } from "../shared/api/client";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  created_at: string;
}

export default function ProfilePage() {
  const { data, isLoading, isError } = useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/users/me/");
      return res.data;
    },
  });

  if (isLoading) return <p style={{ padding: 16 }}>Загрузка профиля…</p>;
  if (isError) return <p style={{ padding: 16 }}>Не удалось загрузить профиль</p>;

  return (
    <div style={{ padding: 16 }}>
        <h1>Профиль</h1>
        <p><b>Email:</b> {data?.email}</p>
        <p><b>Имя:</b> {data?.first_name || "—"}</p>
        <p><b>Фамилия:</b> {data?.last_name || "—"}</p>
        <p><b>Роль:</b> {data?.role}</p>
        <p><b>Телефон:</b> {data?.phone || "—"}</p>
        <p><b>Дата регистрации:</b> {data?.created_at ? new Date(data.created_at).toLocaleDateString() : "—"}</p>
    </div>
  );
}