import { useState, useEffect } from 'react';
import { supabase } from "../main";

export default function AddProductPage() {
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    img: '',
    price: '',
    stock: '',
    category_id: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = '';

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products') 
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Görsel yüklenirken hata oluştu:', uploadError);
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('products')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const productData = {
      ...product,
      img: imageUrl
    };

    const { data, error } = await supabase.from('products').insert([productData]);

    if (error) {
      console.error('Ürün eklenirken hata oluştu:', error);
    } else {
      console.log('Ürün başarıyla eklendi:', productData);
      setProduct({ name: '', img: '', price: '', stock: '', category_id: '' });
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="add-product-page">
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Ürün Adı" value={product.name} onChange={handleChange} required />

        {/* Dosya yükleme butonu, input gizlendi */}
        <label style={{ cursor: "pointer", padding: "10px", background: "#007bff", color: "#fff", borderRadius: "5px", display: "inline-block" }}>
          Görsel Seç
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        {/* Önizleme Alanı */}
        {previewUrl && (
          <div style={{ marginTop: "10px" }}>
            <img src={previewUrl} alt="Önizleme" style={{ width: "200px", height: "auto", borderRadius: "10px" }} />
          </div>
        )}

        <input type="number" name="price" placeholder="Fiyat" value={product.price} onChange={handleChange} required />
        <input type="number" name="stock" placeholder="Stok" value={product.stock} onChange={handleChange} required />

        <select name="category_id" value={product.category_id} onChange={handleChange} required>
          <option value="">Kategori Seç</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button type="submit">Ürün Ekle</button>
      </form>
    </div>
  );
};
