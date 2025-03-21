import { useState } from "react";
import { supabase } from "../main"; // Supabase bağlantısını içeri al

const Stock = () => {
  const [loading, setLoading] = useState(false);

  const updateStock = async () => {
    setLoading(true);

    try {
      // 1️⃣ "ready" olan siparişleri al (status_id = 3)
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("status_id", 3);

      if (orderError) throw orderError;
      if (!orders.length) {
        alert("Stoktan düşülecek hazır sipariş yok.");
        setLoading(false);
        return;
      }

      // 2️⃣ Sipariş detaylarından hangi ürünlerin alındığını öğren
      const orderIds = orders.map(order => order.id);
      const { data: orderDetails, error: detailsError } = await supabase
        .from("order_details") // Sipariş detaylarını içeren tablo
        .select("product_id, quantity")
        .in("order_id", orderIds);

      if (detailsError) throw detailsError;

      // 3️⃣ Stokları güncelle
      for (const { product_id, quantity } of orderDetails) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", product_id)
          .single();

        if (productError) throw productError;

        // Eğer stok yeterliyse güncelle
        if (product.stock >= quantity) {
          await supabase
            .from("products")
            .update({ stock: product.stock - quantity })
            .eq("id", product_id);
        } else {
          console.warn(`Yetersiz stok: Ürün ID ${product_id}`);
        }
      }

      alert("Stok güncellendi.");
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={updateStock} disabled={loading}>
        {loading ? "Güncelleniyor..." : "Stok Güncelle"}
      </button>
    </div>
  );
};

export default Stock;
