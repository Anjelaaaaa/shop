import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

interface FormValues {
  first_name: string;
  last_name: string;
  phone: string;
}

function maskPhone(value: string): string {
  let d = value.replace(/\D/g, "");        
  if (!d) return "";
  if (d[0] === "8") d = "7" + d.slice(1); 
  if (d[0] !== "7") d = "7" + d;           
  d = d.slice(0, 11);                        
  const p = d.slice(1);                  
  let out = "+7";
  if (p.length > 0) out += " (" + p.slice(0, 3);
  if (p.length > 3) out += ") " + p.slice(3, 6);
  if (p.length > 6) out += "-" + p.slice(6, 8);
  if (p.length > 8) out += "-" + p.slice(8, 10);
  return out;
}

export default function ProfilePage() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me/")).data,
  });

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: { first_name: "", last_name: "", phone: "" },
  });

  useEffect(() => {
    if (data) {
      reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone ? maskPhone(data.phone) : "",
      });
    }
  }, [data, reset]);

  const save = useMutation({
    mutationFn: (values: FormValues) => api.patch("/users/me/", values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });

  if (isLoading) return <p className="state">Загрузка профиля…</p>;
  if (isError || !data) return <p className="state">Не удалось загрузить профиль</p>;

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <h1 className="page-title centered">Профиль</h1>

      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="panel glass form-card">
        <div className="form-row">
          <label>Email</label>
          <input value={data.email} disabled />
        </div>
        <div className="form-row">
          <label>Роль</label>
          <input value={data.role} disabled />
        </div>
        <div className="form-row">
          <label>Имя</label>
          <input {...register("first_name")} />
        </div>
        <div className="form-row">
          <label>Фамилия</label>
          <input {...register("last_name")} />
        </div>
        <div className="form-row">
          <label>Телефон</label>
          <input
            {...register("phone")}
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            onChange={(e) => setValue("phone", maskPhone(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label>Дата регистрации</label>
          <input value={new Date(data.created_at).toLocaleDateString()} disabled />
        </div>

        {save.isSuccess && <p style={{ color: "#10916a", fontSize: 14, marginBottom: 12 }}>Сохранено ✓</p>}
        {save.isError && <p className="form-err" style={{ marginBottom: 12 }}>Не удалось сохранить</p>}

        <button type="submit" disabled={save.isPending}>
          {save.isPending ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}