import { useEffect, useState } from 'react';
import { supabase } from "../main";

export default function SalesReport() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase
        .from('order_details')
        .select(`
          order_id,
          products (name, price)
        `);

      if (error) {
        console.error("Satışları çekerken hata oluştu:", error);
      } else {
        console.log("Sipariş verileri:", data);
        setSales(data);
      }
    };

    fetchSales();
  }, []);

  return (
    <div>
      <h2>Satış Raporları</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Ürün Adı</th>
            <th>Fiyat</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, index) => (
            <tr key={index}>
              <td>{sale.products?.name || "Bilinmeyen Ürün"}</td>
              <td>{sale.products?.price ? `${sale.products.price} ₺` : "Fiyat Bilinmiyor"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
