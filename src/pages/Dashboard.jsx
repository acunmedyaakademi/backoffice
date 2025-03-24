import { Link } from "../Router";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Link href="/add-product" className="add-product-btn">
        Ürün Ekle
      </Link>
      <Link href="/sales-reports" className="sales-reports-btn">
        Satış Raporları
      </Link>
      <Link href="/stock" className="stocks-btn">
        Stok Durumu
      </Link>
    </div>
  );
}
