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
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown aç/kapat
  const [selectedCategory, setSelectedCategory] = useState("Kategori Seç"); // Seçilen kategori adı

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

  const handleCategorySelect = (id, name) => {
    setProduct({ ...product, category_id: id });
    setSelectedCategory(name);
    setDropdownOpen(false);
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
      setSelectedCategory("Kategori Seç");
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-title">
        <h5>ÜRÜN EKLE</h5>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Ürün Adı" value={product.name} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Fiyat" value={product.price} onChange={handleChange} required />
        <input type="number" name="stock" placeholder="Stok" value={product.stock} onChange={handleChange} required />

        {/* Özel Dropdown Menü */}
        <div className="custom-dropdown">
          <button type="button" className="dropdown-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {selectedCategory}
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="dropdown-option"
                  onClick={() => handleCategorySelect(category.id, category.name)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {previewUrl && (
          <div style={{ marginTop: "10px" }}>
            <img src={previewUrl} alt="Önizleme" style={{ width: "200px", height: "auto", borderRadius: "10px" }} />
          </div>
        )}

        <label className='select-img'>
          Görsel Seç
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        <button type="submit" className='add-product-btn'>Ürün Ekle</button>
      </form>
    </div>
  );
}
