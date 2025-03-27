import { useEffect, useState } from "react";
import { supabase } from "../main";
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

export default function SalesReport() {
  const [topSales, setTopSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase
        .from("order_details")
        .select("product_id, products (name)");

      if (error) {
        console.error("Satışları çekerken hata oluştu:", error);
        return;
      }

      const groupedSales = data.reduce((acc, sale) => {
        const productName = sale.products?.name || "Bilinmeyen Ürün";
        acc[productName] = (acc[productName] || 0) + 1;
        return acc;
      }, {});

      const sortedSales = Object.entries(groupedSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopSales(sortedSales);
    };

    fetchSales();
  }, []);

  return (
    <div className="sales-container">
      <div className="pie-chart">
        <h3>Top 5 Best-Selling Products</h3>
        <PieChart
          width={800}
          height={400}
          className="custom-pie-chart"
        >
          <Pie
            data={topSales}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="quantity"
            className="custom-pie"
          >
            {topSales.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"][index % 5]}
                className={`custom-pie-cell-${index}`}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              color: '#333'
            }}
          />
        </PieChart>
      </div>
      <WeeklyTopSales />
      <CategorySalesReport />
    </div>
  );
}

function WeeklyTopSales() {
  const [weeklySales, setWeeklySales] = useState([]);

  useEffect(() => {
    const fetchWeeklySales = async () => {
      const sevenDaysAgo = dayjs().subtract(7, "day").toISOString();

      const { data, error } = await supabase
        .from("order_details")
        .select("product_id, products (name), created_at")
        .gte("created_at", sevenDaysAgo);

      if (error) {
        console.error("Haftalık satışları çekerken hata oluştu:", error);
        return;
      }

      const groupedSales = data.reduce((acc, sale) => {
        const productName = sale.products?.name || "Bilinmeyen Ürün";
        acc[productName] = (acc[productName] || 0) + 1;
        return acc;
      }, {});

      const sortedSales = Object.entries(groupedSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 7);

      setWeeklySales(sortedSales);
    };

    fetchWeeklySales();
  }, []);

  return (
    <div className="most-sales-products">
      <h3>Weekly Best-Selling Products</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={weeklySales}
          className="custom-bar-chart"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <XAxis
            dataKey="name"
            interval={0}
            className="custom-x-axis"
          />
          <YAxis className="custom-y-axis" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
          <Bar
            dataKey="quantity"
            fill="#82ca9d"
            className="custom-bar"
            strokeWidth={2}
            stroke="#008000"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategorySalesReport() {
  const [categorySales, setCategorySales] = useState([]);

  useEffect(() => {
    const fetchCategorySales = async () => {
      // order_details tablosundan product_id'leri alıyoruz
      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from('order_details')
        .select('product_id');

      if (orderDetailsError) {
        console.error("Satış verilerini çekerken hata oluştu:", orderDetailsError);
        return;
      }

      // products tablosundan product_id ve category_id alıyoruz
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, category_id');

      if (productsError) {
        console.error("Ürün verilerini çekerken hata oluştu:", productsError);
        return;
      }

      // order_details ve products verilerini birleştirip kategori bazında satışları grupladık
      const categorySalesMap = {};

      // orderDetails içindeki her ürün için category_id'yi bulup kategoriye göre satış miktarını hesaplıyoruz
      orderDetails.forEach(order => {
        // order_details'deki her satırdaki product_id'yi kullanarak category_id'yi buluyoruz
        const product = products.find(p => p.id === order.product_id);

        if (product) {
          const categoryId = product.category_id;

          // Kategoriyi map üzerinde toplayalım
          if (categorySalesMap[categoryId]) {
            categorySalesMap[categoryId] += 1; // Her product_id için bir tane satış ekliyoruz
          } else {
            categorySalesMap[categoryId] = 1; // İlk kez görülen kategori için satış başlatıyoruz
          }
        }
      });

      // kategori idlerini kategori isimlerine dönüştürüp veriyi formatlıyoruz
      // kategorilerin isimlerini almak için products tablosunu yeniden kullanıyoruz
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) {
        console.error("Kategori verilerini çekerken hata oluştu:", categoriesError);
        return;
      }

      // kategori idlerini kategori isimlerine çeviriyoruz
      const formattedData = categories.map(category => ({
        name: category.name, // kategori adı
        quantity: categorySalesMap[category.id] || 0 // kategoriye ait satış miktarı
      }));

      setCategorySales(formattedData);
    };

    fetchCategorySales();
  }, []);

  return (
    <div className="category-sales-container">
      <h3>Kategorilere Göre Satış Dağılımı</h3>

      {/* Çizgi Grafik */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={categorySales}>
          <Line
            type="monotone"
            dataKey="quantity"
            stroke="#8884d8"
            strokeWidth={2}
          />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}