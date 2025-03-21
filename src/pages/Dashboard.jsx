import { Link } from "../Router";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Link href="/add-product" className="add-product-btn">
        Ürün ekle
      </Link>
      <Link href="/sales-reports" className="sales-reports-btn">
        Satış raporları
      </Link>
      <Link href="/stock" className="stocks-btn">
        Stock
      </Link>
    </div>
  );
}
