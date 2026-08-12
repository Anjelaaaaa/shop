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

  if (isLoading) return <p className="state">Загрузка профиля…</p>;
  if (isError) return <p className="state">Не удалось загрузить профиль</p>;

  const rows: [string, string][] = [
    ["Email", data?.email || "—"],
    ["Имя", data?.first_name || "—"],
    ["Фамилия", data?.last_name || "—"],
    ["Роль", data?.role || "—"],
    ["Телефон", data?.phone || "—"],
    ["Дата регистрации", data?.created_at ? new Date(data.created_at).toLocaleDateString() : "—"],
  ];

  return (
    <div className="page">
      <h1 className="page-title centered">Профиль</h1>
      <div className="panel glass" style={{ maxWidth: 520 }}>
        {rows.map(([label, value]) => (
          <div key={label} className="row-line">
            <span className="grow row-sub">{label}</span>
            <span className="row-title">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
