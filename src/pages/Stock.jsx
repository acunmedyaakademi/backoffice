import { useEffect, useState } from "react";
import { supabase } from "../main";
console.log("📌 Stock bileşeni render edildi!");

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateStock = async () => {
      setLoading(true);
      console.log("🔄 Stok güncelleme işlemi başladı...");

      // 1. Status ID'si 3 olan siparişleri al
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("status_id", 3);

      if (ordersError) {
        console.error("❌ Siparişler çekilemedi:", ordersError.message);
        setLoading(false);
        return;
      }

      console.log("📦 Teslim edilen siparişler:", orders);

      const orderIds = orders.map(order => order.id);
      if (orderIds.length === 0) {
        console.log("⚠️ Teslim edilen sipariş yok.");
        setLoading(false);
        return;
      }

      // 2. order_details tablosundan sadece ilgili siparişlere ait product_id'leri ve miktarları çek
      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from("order_details")
        .select("product_id, order_id")
        .in("order_id", orderIds); // Sadece ilgili siparişleri getir

      if (orderDetailsError) {
        console.error("❌ Sipariş detayları çekilemedi:", orderDetailsError.message);
        setLoading(false);
        return;
      }

      console.log("📦 Sipariş detaylarından çekilen ürün ID'leri:", orderDetails);

      // Ürün ID'lerini siparişlerde kaç kere geçtiğini hesaplayarak azaltma miktarını belirle
      const productCountMap = {};
      orderDetails.forEach(detail => {
        productCountMap[detail.product_id] = (productCountMap[detail.product_id] || 0) + 1;
      });

      console.log("🛒 Stok güncelleme için ürün adetleri:", productCountMap);

      // 3. Stokları güncelle (yalnızca ilgili ürünleri azalt)
      for (const productId in productCountMap) {
        // Mevcut stok miktarını al
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        if (productError) {
          console.error(`❌ Ürün ID ${productId} stok bilgisi alınamadı:`, productError.message);
          continue;
        }

        const currentStock = productData.stock;
        const newStock = Math.max(0, currentStock - productCountMap[productId]); // Stok 0 altına düşmesin

        // Stok miktarını güncelle
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", productId);

        if (updateError) {
          console.error(`❌ Ürün ID ${productId} stok güncellenemedi:`, updateError.message);
        } else {
          console.log(`✅ Ürün ID ${productId} stok güncellendi: ${currentStock} ➝ ${newStock}`);
        }
      }

      // 4. Güncellenmiş stok verisini tekrar çek
      const { data: updatedProducts, error: productsError } = await supabase
        .from("products")
        .select("*");

      if (productsError) {
        console.error("❌ Ürünler tekrar çekilemedi:", productsError.message);
      } else {
        console.log("📦 Güncellenmiş ürün listesi:", updatedProducts);
        setProducts(updatedProducts);
      }

      setLoading(false);
    };

    updateStock();
  }, []); // Sayfa yüklendiğinde sadece 1 kez çalışır

  return (
    <div>
      <h2>Stok Listesi</h2>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <button onClick={() => window.location.reload()}>Sayfayı Yenile</button>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ürün Adı</th>
                <th>Stok</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
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
    </div>
  );
};

export default Stock;
