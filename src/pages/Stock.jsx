import { useEffect, useRef, useState } from "react";
import { supabase } from "../main";

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [stockToAdd, setStockToAdd] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredProducts([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("ürünler çekilemedi", error.message);
    } else {

      let sortedProducts = data.sort((a, b) => b.stock - a.stock);
      setProducts(sortedProducts);
    }
  };

  useEffect(() => {
    const updateStock = async () => {
      setLoading(true);
      console.log("stok güncelleme işlemi başladı");

      const storedOrderIds = JSON.parse(
        localStorage.getItem("processedOrderIds") || "[]"
      );


      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("status_id", 3);

      if (ordersError) {
        console.error("siparişler çekilemedi", ordersError.message);
        await fetchProducts();
        setLoading(false);
        return;
      }

      const newOrders = orders.filter(
        (order) => !storedOrderIds.includes(order.id)
      );
      if (newOrders.length === 0) {
        console.log("yeni işlenmemiş sipariş yok");
        await fetchProducts(); 
        setLoading(false);
        return;
      }

      const newOrderIds = newOrders.map((order) => order.id);
      console.log("yeni sipariş ID'leri", newOrderIds);


      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from("order_details")
        .select("product_id, order_id")
        .in("order_id", newOrderIds);

      if (orderDetailsError) {
        console.error(
          "sipariş detayları çekilemedi",
          orderDetailsError.message
        );
        await fetchProducts();
        setLoading(false);
        return;
      }

      const productCountMap = {};
      orderDetails.forEach((detail) => {
        productCountMap[detail.product_id] =
          (productCountMap[detail.product_id] || 0) + 1;
      });

      for (const productId in productCountMap) {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        if (productError) {
          console.error(
            `${productId} stok bilgisi alınamadı`,
            productError.message
          );
          continue;
        }

        const currentStock = productData.stock;
        const newStock = Math.max(0, currentStock - productCountMap[productId]);

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", productId);

        if (updateError) {
          console.error(
            `${productId} stok güncellenemedi:`,
            updateError.message
          );
        } else {
          console.log(
            ` ${productId} stok güncellendi ${currentStock} - ${newStock}`
          );
        }
      }

      const updatedOrderIds = [...storedOrderIds, ...newOrderIds];
      localStorage.setItem(
        "processedOrderIds",
        JSON.stringify(updatedOrderIds)
      );

      await fetchProducts(); 
      setLoading(false);
    };

    updateStock();
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
      setProductSearch("");
      fetchProducts();
    }
  };

  return (
    <div>
      <h2>Stok Listesi</h2>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <div className="stockButtons">
            <button className="reloadBtn" onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </button>
            <button
              onClick={() => setShowDialog(true)}
              className="stockControlBtn"
            >
              📦 Stok Kontrolü
            </button>
          </div>

          <table
            border="1"
            cellPadding="10"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Ürün Adı</th>
                <th>Stok</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {showDialog && (
        <div className="dialog-backdrop" onClick={() => setShowDialog(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()} 
          >
            <h3>Stok Ekle</h3>
            <div ref={dropdownRef}>
              <label>
                <h6>Ürün Ara:</h6>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProductSearch(value);
                    const results = products.filter((p) =>
                      p.name.toLowerCase().includes(value.toLowerCase())
                    );
                    setFilteredProducts(results);
                  }}
                  placeholder="Ürün adı girin..."
                />
              </label>

              {filteredProducts.length > 0 && (
                <div className="search-results">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="dropdown-option"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setProductSearch(p.name);
                        setFilteredProducts([]);
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <label>
              <h6>Miktar:</h6>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
