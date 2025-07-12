import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Load data from localStorage or use default
  const loadData = () => {
    try {
      const savedProducts = localStorage.getItem('woocommerce_products');
      const savedHistory = localStorage.getItem('woocommerce_history');
      const savedCategories = localStorage.getItem('woocommerce_categories');
      
      return {
        products: savedProducts ? JSON.parse(savedProducts) : [
          {
            id: 1,
            sku: 'TEE-001',
            name: 'Classic Cotton T-Shirt',
            description: 'Made from 100% premium cotton, this classic t-shirt offers superior comfort and durability. Available in multiple colors and sizes.',
            shortDescription: 'Comfortable cotton t-shirt perfect for everyday wear',
            price: '19.99',
            categories: 'Clothing > T-Shirts',
            tags: 'cotton,casual,comfort,everyday',
            brand: 'ComfortWear',
            seoDescription: 'Buy premium cotton t-shirts online. Super comfortable, durable, and available in multiple sizes.',
            focusKeyword: 'cotton t-shirt'
          }
        ],
        history: savedHistory ? JSON.parse(savedHistory) : [
          {
            id: 1,
            action: 'Added',
            product: 'Classic Cotton T-Shirt (TEE-001)',
            timestamp: new Date().toLocaleString()
          }
        ],
        categories: savedCategories ? JSON.parse(savedCategories) : [
          'Clothing > T-Shirts',
          'Clothing > Shirts', 
          'Clothing > Pants',
          'Electronics > Phones',
          'Electronics > Laptops',
          'Home & Garden > Furniture',
          'Home & Garden > Plants',
          'Sports > Fitness',
          'Sports > Yoga',
          'Books > Technology',
          'Books > Fiction',
          'Food & Beverage > Coffee',
          'Food & Beverage > Tea',
          'Accessories > Wallets',
          'Accessories > Bags'
        ]
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return { products: [], history: [], categories: [] };
    }
  };

  const initialData = loadData();
  const [products, setProducts] = useState(initialData.products);
  const [history, setHistory] = useState(initialData.history);
  const [categories, setCategories] = useState(initialData.categories);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryMode, setCategoryMode] = useState('select'); // 'select' or 'custom'
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    categories: '',
    tags: '',
    brand: '',
    seoDescription: '',
    focusKeyword: ''
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('woocommerce_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('woocommerce_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('woocommerce_categories', JSON.stringify(categories));
  }, [categories]);

  const addToCategories = (newCategory) => {
    if (newCategory && newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()].sort());
    }
  };

  const addToHistory = (action, productName, sku = '') => {
    const historyItem = {
      id: Date.now(),
      action: action,
      product: sku ? `${productName} (${sku})` : productName,
      timestamp: new Date().toLocaleString()
    };
    setHistory(prev => [historyItem, ...prev]);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      categories: '',
      tags: '',
      brand: '',
      seoDescription: '',
      focusKeyword: ''
    });
    setIsEditing(false);
    setEditingProduct(null);
    setCategoryMode('select');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setCategoryMode('custom');
      setFormData(prev => ({
        ...prev,
        categories: ''
      }));
    } else {
      setCategoryMode('select');
      setFormData(prev => ({
        ...prev,
        categories: value
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.sku || !formData.name || !formData.price) {
      alert('Please fill in SKU, Name, and Price (required fields)');
      return;
    }

    // Add category to the categories list if it's new
    addToCategories(formData.categories);

    if (isEditing) {
      setProducts(prev => prev.map(product => 
        product.id === editingProduct.id 
          ? { ...formData, id: editingProduct.id }
          : product
      ));
      addToHistory('Updated', formData.name, formData.sku);
    } else {
      const newProduct = {
        ...formData,
        id: Date.now()
      };
      setProducts(prev => [...prev, newProduct]);
      addToHistory('Added', formData.name, formData.sku);
    }
    
    resetForm();
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingProduct(product);
    setIsEditing(true);
    // Set category mode based on whether the category exists in our list
    if (categories.includes(product.categories)) {
      setCategoryMode('select');
    } else {
      setCategoryMode('custom');
    }
  };

  const handleDelete = (id) => {
    const product = products.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      setProducts(prev => prev.filter(product => product.id !== id));
      addToHistory('Deleted', product.name, product.sku);
    }
  };

  const handleDeleteAll = () => {
    if (products.length === 0) {
      alert('No products to delete!');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ALL ${products.length} products? This action cannot be undone!`)) {
      const count = products.length;
      setProducts([]);
      addToHistory('Deleted All', `${count} products`);
      resetForm();
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the history? This action cannot be undone!')) {
      setHistory([]);
    }
  };

  const clearCategories = () => {
    if (categories.length === 0) {
      alert('No categories to clear!');
      return;
    }
    if (window.confirm(`Are you sure you want to clear all ${categories.length} saved categories? This won't affect existing products.`)) {
      setCategories([]);
      addToHistory('Cleared Categories', `${categories.length} categories`);
    }
  };

  const exportCategories = () => {
    if (categories.length === 0) {
      alert('No categories to export!');
      return;
    }

    const content = categories.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `woocommerce-categories-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    addToHistory('Exported Categories', `${categories.length} categories to text file`);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please select a .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const newCategories = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .filter(line => !line.startsWith('#')); // Allow comments

        if (newCategories.length === 0) {
          alert('No valid categories found in the file');
          return;
        }

        const action = window.confirm(
          `Found ${newCategories.length} categories in the file.\n\n` +
          `Click OK to REPLACE current categories\n` +
          `Click Cancel to ADD to current categories`
        );

        if (action) {
          // Replace
          setCategories([...new Set(newCategories)].sort());
          addToHistory('Imported Categories (Replace)', `${newCategories.length} categories from ${file.name}`);
        } else {
          // Add/Merge
          const merged = [...new Set([...categories, ...newCategories])].sort();
          setCategories(merged);
          addToHistory('Imported Categories (Add)', `${newCategories.length} categories from ${file.name}`);
        }

        // Clear the file input
        event.target.value = '';
        
      } catch (error) {
        alert('Error reading file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    if (products.length === 0) {
      alert('No products to export!');
      return;
    }

    const headers = [
      'SKU',
      'Name', 
      'Description',
      'Short description',
      'Regular price',
      'Categories',
      'Tags',
      'Meta: rank_math_description',
      'Meta: rank_math_focus_keyword',
      'Meta: _yoast_wpseo_primary_product_brand'
    ];

    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        `"${product.sku}"`,
        `"${product.name}"`,
        `"${product.description}"`,
        `"${product.shortDescription}"`,
        product.price,
        `"${product.categories}"`,
        `"${product.tags}"`,
        `"${product.seoDescription}"`,
        `"${product.focusKeyword}"`,
        `"${product.brand}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `woocommerce-products-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    addToHistory('Exported', `${products.length} products to CSV`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)', padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>WooCommerce Product Manager</h1>
            <p style={{ color: '#bfdbfe', marginTop: '4px', margin: 0 }}>Manage your products with auto-save and export to CSV for bulk import</p>
            <div style={{ marginTop: '8px', color: '#bfdbfe', fontSize: '14px' }}>
              💾 Auto-saves to browser storage • 📊 {products.length} products stored • 📂 {categories.length} categories saved
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{ backgroundColor: '#7c3aed', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                📋 {showHistory ? 'Hide History' : 'Show History'} ({history.length})
              </button>
              <button
                onClick={exportCSV}
                style={{ backgroundColor: '#059669', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                ⬇️ Export CSV
              </button>
              <button
                onClick={handleDeleteAll}
                style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🗑️ Delete All Products
              </button>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  style={{ backgroundColor: '#ea580c', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  🧹 Clear History
                </button>
              )}
            </div>
            
            {/* Category Management */}
            <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>📂 Category Management:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📁 Import Categories
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={exportCategories}
                  style={{ backgroundColor: '#0891b2', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  💾 Export Categories
                </button>
                {categories.length > 0 && (
                  <button
                    onClick={clearCategories}
                    style={{ backgroundColor: '#6366f1', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    📂 Clear Categories ({categories.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div style={{ padding: '24px', backgroundColor: '#fefce8', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>📋 Activity History</h3>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {history.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No activity yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {history.map((item) => (
                      <div key={item.id} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span>
                            <strong style={{ color: '#2563eb' }}>{item.action}</strong> {item.product}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add/Edit Form */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              {isEditing ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="e.g., TEE-001"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="e.g., Classic Cotton T-Shirt"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Regular Price *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="19.99"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="Brief product summary"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="e.g., ComfortWear"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Categories</label>
                <select
                  value={categoryMode === 'select' ? formData.categories : 'custom'}
                  onChange={handleCategoryChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', marginBottom: '8px' }}
                >
                  <option value="">Select a category...</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                  <option value="custom">✏️ Enter custom category</option>
                </select>
                {categoryMode === 'custom' && (
                  <input
                    type="text"
                    name="categories"
                    value={formData.categories}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="e.g., Clothing > T-Shirts"
                  />
                )}
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  💡 Use ">" for subcategories (e.g., "Clothing > T-Shirts")
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="cotton,casual,comfort"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Focus Keyword</label>
                <input
                  type="text"
                  name="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="e.g., cotton t-shirt"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                  placeholder="Detailed product description"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>SEO Meta Description</label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  rows="2"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                  placeholder="SEO meta description (150-160 characters)"
                  maxLength="160"
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {formData.seoDescription.length}/160 characters
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSubmit}
                  style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                >
                  💾 {isEditing ? 'Update Product' : 'Add Product'}
                </button>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    style={{ backgroundColor: '#6b7280', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                📦 Products ({products.length})
              </h2>
            </div>

            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>🛍️ No products yet</p>
                <p style={{ margin: 0 }}>Add your first product using the form above!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>SKU</th>
                      <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Name</th>
                      <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Price</th>
                      <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Categories</th>
                      <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Brand</th>
                      <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>Focus Keyword</th>
                      <th style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} style={{ backgroundColor: 'white' }}>
                        <td style={{ border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px' }}>{product.sku}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px' }}>{product.name}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px' }}>${product.price}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px' }}>{product.categories}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px' }}>{product.brand}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '8px 12px', fontSize: '14px' }}>{product.focusKeyword}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '8px 12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px', backgroundColor: '#f3f4f6', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            💾 All data is automatically saved to your browser's local storage
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;