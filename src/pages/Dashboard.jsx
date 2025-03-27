import { useEffect, useState } from "react";
import { Link } from "../Router";
import { DashboardSvg, ProductsSvg, SalesReportsSvg, StocksSvg } from "../Svg";
import AddProductPage from "./AddProductPage";
import SalesReport from "./SalesReport";
import { supabase } from "../main";

export default function Dashboard() {
  const [showDialog, setShowDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [stockToAdd, setStockToAdd] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState("");

  function OpenAddDialog(productId) {
    setSelectedProductId(productId);
    setShowDialog(true);
  }

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("ürünler çekilemedi", error.message);
      } else {
        setProducts(data);
      }
    };
    fetchProducts();
  }, []);

  const handleStockChange = async (type) => {
    if (!selectedProductId || stockToAdd <= 0) {
      alert("lütfen geçerli ürün ve miktar girin.");
      return;
    }

    const { data: productData, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", selectedProductId)
      .single();

    if (error) {
      console.error("stok verisi alınamadı", error.message);
      return;
    }

    let newStock =
      type === "add"
        ? productData.stock + Number(stockToAdd)
        : Math.max(0, productData.stock - Number(stockToAdd));

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", selectedProductId);

    if (updateError) {
      console.error("stok güncellenemedi", updateError.message);
    } else {
      console.log("stok güncellendi", newStock);
      setShowDialog(false);
      setSelectedProductId("");
      setStockToAdd(1);
    }
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  return (
    <div className="dashboard">
      <div className="sideBar">
        <h5>MUTFO</h5>
        <div className="sideBarOption">
          <h6>Home</h6>
          <div
            className={`optionText ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            <DashboardSvg />
            <p>Dashboard</p>
          </div>
        </div>
        <div className="sideBarOption">
          <h6>Pages</h6>
          <div
            className={`optionText ${activePage === "foods" ? "active" : ""}`}
            onClick={() => setActivePage("foods")}
          >
            <ProductsSvg />
            <p>Foods</p>
          </div>
          <div
            className={`optionText ${activePage === "stocks" ? "active" : ""}`}
            onClick={() => setActivePage("stocks")}
          >
            <StocksSvg />
            <p>Stocks</p>
          </div>
          <div
            className={`optionText ${
              activePage === "salesReports" ? "active" : ""
            }`}
            onClick={() => setActivePage("salesReports")}
          >
            <SalesReportsSvg />
            <p>Sales Reports</p>
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="modal-overlay" onClick={() => setShowDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {activePage === "foods" ? (
              <AddProductPage />
            ) : (
              <>
                <label>
                  <h6>Miktar</h6>
                  <input
                    type="number"
                    min="1"
                    value={stockToAdd}
                    onChange={(e) => setStockToAdd(e.target.value)}
                  />
                </label>

                <div className="dialogBtns">
                  <button
                    className="addBtn"
                    onClick={() => handleStockChange("add")}
                  >
                    Ekle
                  </button>
                  <button
                    className="cancelBtn"
                    onClick={() => handleStockChange("remove")}
                  >
                    Çıkar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activePage === "foods" && (
        <div className="productsContainer">
          <h2>FOODS</h2>
          <button className="addProductBtn" onClick={OpenAddDialog}>
            ADD PRODUCT
          </button>
          <div className="products">
            {products.map((p) => (
              <div className="productBox" key={p.id}>
                <img src={p.img} alt="" />
                <p>{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePage === "stocks" && (
        <div className="stocksContainer">
          <h2>STOCKS</h2>
          <div className="products">
            {products.map((p) => (
              <div className="productBox" key={p.id}>
                <img src={p.img} alt="" />
                <p>{p.name}</p>
                <div className="stockQuantity">
                  <p>Quantity: {p.stock}</p>
                  <button
                    className="addStockBtn"
                    onClick={() => OpenAddDialog(p.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePage === "salesReports" && (
        <div className="sales-reports-container">
          <h2>SALES REPORTS</h2>
          <SalesReport />
        </div>
      )}

      {activePage === "dashboard" && (
        <div className="dashboard-container">
          <h2>
            Hoş geldin
            {user?.email ? `, ${user.email}` : ""}
            👋
          </h2>
          <img
            src="/img/dashboard.png"
            alt="png"
            style={{ width: "300px", height: "auto" }}
          />
        </div>
      )}
    </div>
  );
}
