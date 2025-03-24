import { useEffect, useState } from "react";
import { supabase } from "../main";

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [stockToAdd, setStockToAdd] = useState(1);

  // 1. Ürünleri her zaman göster
  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("❌ Ürünler çekilemedi:", error.message);
    } else {
      setProducts(data);
    }
  };

  useEffect(() => {
    const updateStock = async () => {
      setLoading(true);
      console.log("🔄 Stok güncelleme işlemi başladı...");

      // 2. Daha önce işlenen sipariş ID'lerini al
      const storedOrderIds = JSON.parse(
        localStorage.getItem("processedOrderIds") || "[]"
      );

      // 3. status_id = 3 olan siparişleri al
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("status_id", 3);

      if (ordersError) {
        console.error("❌ Siparişler çekilemedi:", ordersError.message);
        await fetchProducts();
        setLoading(false);
        return;
      }

      // 4. Daha önce işlenmemiş siparişleri filtrele
      const newOrders = orders.filter(
        (order) => !storedOrderIds.includes(order.id)
      );
      if (newOrders.length === 0) {
        console.log("⚠️ Yeni işlenmemiş sipariş yok.");
        await fetchProducts(); // Yine de ürünleri göster
        setLoading(false);
        return;
      }

      const newOrderIds = newOrders.map((order) => order.id);
      console.log("🆕 Yeni sipariş ID'leri:", newOrderIds);

      // 5. Sipariş detaylarından ürünleri al
      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from("order_details")
        .select("product_id, order_id")
        .in("order_id", newOrderIds);

      if (orderDetailsError) {
        console.error(
          "❌ Sipariş detayları çekilemedi:",
          orderDetailsError.message
        );
        await fetchProducts();
        setLoading(false);
        return;
      }

      // 6. Hangi üründen kaç tane azaltılacak
      const productCountMap = {};
      orderDetails.forEach((detail) => {
        productCountMap[detail.product_id] =
          (productCountMap[detail.product_id] || 0) + 1;
      });

      // 7. Stokları güncelle
      for (const productId in productCountMap) {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        if (productError) {
          console.error(
            `❌ Ürün ID ${productId} stok bilgisi alınamadı:`,
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
            `❌ Ürün ID ${productId} stok güncellenemedi:`,
            updateError.message
          );
        } else {
          console.log(
            `✅ Ürün ID ${productId} stok güncellendi: ${currentStock} ➝ ${newStock}`
          );
        }
      }

      // 8. İşlenmiş sipariş ID’lerini localStorage’a kaydet
      const updatedOrderIds = [...storedOrderIds, ...newOrderIds];
      localStorage.setItem(
        "processedOrderIds",
        JSON.stringify(updatedOrderIds)
      );

      await fetchProducts(); // Güncellenmiş ürünleri getir
      setLoading(false);
    };

    updateStock();
  }, []);

  const handleStockAdd = async () => {
    if (!selectedProductId || stockToAdd <= 0) {
      alert("Lütfen geçerli bir ürün ve miktar seçin.");
      return;
    }

    // Mevcut stok miktarını al
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", selectedProductId)
      .single();

    if (productError) {
      console.error("Stok verisi alınamadı:", productError.message);
      return;
    }

    const newStock = productData.stock + Number(stockToAdd);

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", selectedProductId);

    if (updateError) {
      console.error("Stok artırılamadı:", updateError.message);
    } else {
      console.log("✅ Stok başarıyla artırıldı.");
      setShowDialog(false);
      setSelectedProductId("");
      setStockToAdd(1);
      fetchProducts(); // Güncellenmiş veriyi getir
    }
  };

  return (
    <div>
      <h2>Stok Listesi</h2>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <button onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </button>
          <button
            onClick={() => setShowDialog(true)}
            style={{ marginBottom: "20px" }}
          >
            ➕ Stok Ekle
          </button>
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
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>Stok Ekle</h3>
            <label>
              Ürün Seç:
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Eklenecek Miktar:
              <input
                type="number"
                min="1"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
              />
            </label>
            <div style={{ marginTop: "10px" }}>
              <button onClick={handleStockAdd}>Ekle</button>
              <button
                onClick={() => setShowDialog(false)}
                style={{ marginLeft: "10px" }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
