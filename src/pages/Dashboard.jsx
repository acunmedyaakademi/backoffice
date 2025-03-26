import { Link } from "../Router";
import DashboardSvg from "../Svg";

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* <Link href="/add-product" className="add-product-btn">
        Ürün Ekle
      </Link>
      <Link href="/sales-reports" className="sales-reports-btn">
        Satış Raporları
      </Link>
      <Link href="/stock" className="stocks-btn">
        Stok Durumu
      </Link> */}
      <div className="sideBar">
        <div className="sideBarOption">
          <h6>Home</h6>
          <div className="optionText">
          <DashboardSvg />
          <p>Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
