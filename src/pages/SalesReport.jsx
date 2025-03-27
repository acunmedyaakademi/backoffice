import { useEffect, useState } from "react";
import { supabase } from "../main";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
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