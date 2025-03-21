import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Router } from "./Router.jsx";
import LoginRegister from "./pages/LoginRegister.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { createClient } from "@supabase/supabase-js";
import AddProductPage from "./pages/AddProductPage.jsx";
import Stock from "./pages/Stock.jsx";
import SalesReport from "./pages/SalesReport.jsx";

export const supabase = createClient(
  "https://sxkbwpcardxrhfuqzvzc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4a2J3cGNhcmR4cmhmdXF6dnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzQ3MjAsImV4cCI6MjA1ODA1MDcyMH0.f6pWVT3SGve_Xmcs_m2lH0YDX9anp3hI915eNgjfgTI"
);

const routes = [
  {
    url: "/",
    component: <LoginRegister key="login" />,
  },
  {
    url: "/dashboard",
    component: <Dashboard />,
  },
  {
    url: "/add-product",
    component: <AddProductPage />,
  },
  {
    url: "/stock", // 👈 yeni rota
    component: <Stock />
  },
  {
    url: "/sales-reports",
    component: <SalesReport />,
  },
];

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Router routes={routes}>
    <App />
  </Router>
  // </StrictMode>,
);
