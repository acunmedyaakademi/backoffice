import { useState } from 'react';
import { supabase } from "../main";

export default function AddProductPage() {
  const [product, setProduct] = useState({
    name: '',
    img: '',
    price: '',
    stock: '',
    category_id: ''
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('products').insert([product]);

    if (error) {
      console.error('Ürün eklenirken hata oluştu:', error);
    } else {
      console.log('Ürün başarıyla eklendi:', product);
      setProduct({ name: '', img: '', price: '', stock: '', category_id: '' }); // Formu sıfırla
    }
  };

  return (
    <div className="add-product-page">
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Ürün Adı" value={product.name} onChange={handleChange} required />
        <input type="text" name="img" placeholder="Görsel URL" value={product.img} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Fiyat" value={product.price} onChange={handleChange} required />
        <input type="number" name="stock" placeholder="Stok" value={product.stock} onChange={handleChange} required />
        <input type="number" name="category_id" placeholder="Kategori ID" value={product.category_id} onChange={handleChange} required />
        <button type="submit">Ürün Ekle</button>
      </form>
    </div>
  );
};