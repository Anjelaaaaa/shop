import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header style={{ padding: "16px", borderBottom: "1px solid #ccc" }}>
        <nav style={{ display: "flex", gap: "16px" }}>
          <Link to="/">Каталог</Link>
          <Link to="/login">Вход</Link>
        </nav>
      </header>
      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
