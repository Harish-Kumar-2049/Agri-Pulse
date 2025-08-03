import React, { useState, useEffect } from 'react';
import FarmView from './FarmView';

const Dashboard = ({ user, onLogout }) => {
  // State for products (now loaded from database)
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Farmer-specific states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showFarmView, setShowFarmView] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    unit: '',
    description: '',
    category: 'Vegetables',
    image: ''
  });
  const [farmerProducts, setFarmerProducts] = useState([]);

  // Categories for navigation
  const categories = ['All Products', 'Vegetables', 'Fruits', 'Herbs', 'Organic'];

  // Predefined product images for selection
  const productImages = {
    'Vegetables': [
      'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'https://images.pexels.com/photos/1337860/pexels-photo-1337860.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg?auto=compress&cs=tinysrgb&w=300&h=200'
    ],
    'Fruits': [
      'https://images.pexels.com/photos/934066/pexels-photo-934066.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg?auto=compress&cs=tinysrgb&w=300&h=200'
    ],
    'Herbs': [
      'https://images.pexels.com/photos/4198730/pexels-photo-4198730.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'https://images.pexels.com/photos/4198428/pexels-photo-4198428.jpeg?auto=compress&cs=tinysrgb&w=300&h=200'
    ]
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
    if (user.userType === 'farmer') {
      loadFarmerProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProducts = async () => {
    try {
      console.log('Loading products from server...');
      const response = await fetch('http://localhost:5000/products');
      console.log('Products response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded products:', data);
        setProducts(data);
      } else {
        console.error('Failed to load products, status:', response.status);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadFarmerProducts = async () => {
    try {
      console.log('Loading farmer products for user:', user.id);
      const response = await fetch(`http://localhost:5000/products/farmer/${user.id}`);
      console.log('Farmer products response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded farmer products:', data);
        setFarmerProducts(data);
      } else {
        console.error('Failed to load farmer products, status:', response.status);
      }
    } catch (error) {
      console.error('Error loading farmer products:', error);
    }
  };

  // Filter products based on selected category and search query
  const filteredProducts = products.filter(product => {
    // First filter by category
    let categoryMatch = true;
    if (selectedCategory === 'All Products') categoryMatch = true;
    else if (selectedCategory === 'Organic') categoryMatch = product.category === 'Organic' || product.name.toLowerCase().includes('organic');
    else categoryMatch = product.category === selectedCategory;

    // Then filter by search query
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.farmer_name?.toLowerCase().includes(query) ||
        product.farmer_location?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
    }

    return categoryMatch && searchMatch;
  });

  // Handle form input changes
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle product submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price || !productForm.unit || !productForm.category) {
      return;
    }

    console.log('Submitting product:', {
      ...productForm,
      farmer_id: user.id,
      price: parseFloat(productForm.price)
    });

    try {
      const response = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...productForm,
          farmer_id: user.id,
          price: parseFloat(productForm.price)
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        setProductForm({
          name: '',
          price: '',
          unit: '',
          description: '',
          category: 'Vegetables',
          image: ''
        });
        setShowAddProduct(false);
        loadProducts(); // Reload all products
        loadFarmerProducts(); // Reload farmer's products
      } else {
        console.error('Server error:', responseData);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farmer_id: user.id
        }),
      });

      if (response.ok) {
        loadProducts();
        loadFarmerProducts();
      } else {
        const error = await response.json();
        console.error('Error deleting product:', error.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by the filtering above
    // You could add analytics or other logic here
  };

  // Clear search when category changes (optional behavior)
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Uncomment the line below if you want to clear search when changing categories
    // setSearchQuery('');
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleImageError = (e, productName) => {
    // Fallback to a generic grocery image if the main image fails
    const fallbackImages = {
      'Fresh Organic Tomatoes': 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'Fresh Spinach Leaves': 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'Sweet Bell Peppers': 'https://images.pexels.com/photos/128420/pexels-photo-128420.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'Organic Carrots': 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'Fresh Strawberries': 'https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'Crisp Lettuce': 'https://images.pexels.com/photos/1359654/pexels-photo-1359654.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'Organic Broccoli': 'https://images.pexels.com/photos/65174/pexels-photo-65174.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      'Sweet Corn': 'https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=300&h=200'
    };
    
    // Try fallback image first
    if (fallbackImages[productName] && e.target.src !== fallbackImages[productName]) {
      e.target.src = fallbackImages[productName];
      return;
    }
    
    // If fallback also fails, create a simple colored div
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (!parent.querySelector('.fallback-image')) {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'fallback-image';
      fallbackDiv.style.cssText = `
        width: 100%;
        height: 200px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;
      `;
      fallbackDiv.textContent = productName;
      parent.appendChild(fallbackDiv);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="nav-container">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">🌱</span>
              <span className="logo-text">AgriPulse</span>
            </div>
            {user.userType === 'customer' && (
              <form className="search-bar" onSubmit={handleSearchSubmit}>
                <input 
                  type="text" 
                  placeholder="Search for fresh groceries..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoComplete="off"
                />
                {searchQuery.trim() && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '1rem'
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
                <button type="submit" className="search-btn">🔍</button>
              </form>
            )}
          </div>
          <div className="header-right">
            <div className="user-info">
              <span>Hello, {user.name}</span>
              <small>{user.location}</small>
            </div>
            {user.userType === 'customer' && (
              <div className="cart-container">
                <div 
                  className="cart-icon"
                  onClick={() => setShowCartDropdown(!showCartDropdown)}
                >
                  🛒 <span className="cart-count">{getTotalItems()}</span>
                </div>
                
                {showCartDropdown && (
                  <div className="cart-dropdown">
                    <div className="cart-header">
                      <h3>Shopping Cart</h3>
                      <button 
                        className="close-cart"
                        onClick={() => setShowCartDropdown(false)}
                      >
                        ✕
                      </button>
                    </div>
                    
                    {cart.length === 0 ? (
                      <div className="empty-cart">
                        <p>Your cart is empty</p>
                        <span>🛒</span>
                      </div>
                    ) : (
                      <div className="cart-items">
                        {cart.map(item => (
                          <div key={item.id} className="cart-item">
                            <div className="cart-item-image">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <div className="cart-item-details">
                              <h4 className="cart-item-name">{item.name}</h4>
                              <p className="cart-item-farmer">👨‍🌾 {item.farmer_name || item.farmer}</p>
                              <div className="cart-item-price">₹{item.price} {item.unit}</div>
                            </div>
                            <div className="cart-item-controls">
                              <div className="quantity-controls">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="quantity-btn"
                                >
                                  -
                                </button>
                                <span className="quantity">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="quantity-btn"
                                >
                                  +
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="remove-btn"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="cart-footer">
                          <div className="cart-total">
                            <strong>Total: ₹{getTotalPrice()}</strong>
                          </div>
                          <button className="checkout-btn">
                            Proceed to Checkout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      {user.userType === 'farmer' ? (
        <div className="farmer-dashboard">
          <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Farmer Dashboard</h3>
                <p style={{ color: '#666' }}>Manage your products and connect with customers.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a 
                  href="http://localhost:3000/iot/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  🌱 View Farm
                </a>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Add New Product
                </button>
              </div>
            </div>

            {/* Add Product Modal */}
            {showAddProduct && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  width: '90%',
                  maxWidth: '500px',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Add New Product</h3>
                    <button 
                      onClick={() => setShowAddProduct(false)}
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddProduct}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                        placeholder="e.g., Fresh Organic Tomatoes"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Price *</label>
                        <input
                          type="number"
                          name="price"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                          required
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Unit *</label>
                        <input
                          type="text"
                          name="unit"
                          value={productForm.unit}
                          onChange={handleProductFormChange}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                          }}
                          placeholder="per lb, per piece, etc."
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Category *</label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleProductFormChange}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Herbs">Herbs</option>
                        <option value="Organic">Organic</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleProductFormChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '1rem',
                          resize: 'vertical'
                        }}
                        placeholder="Describe your product..."
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Product Image</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
                        {productImages[productForm.category]?.map((imageUrl, index) => (
                          <div
                            key={index}
                            onClick={() => setProductForm(prev => ({ ...prev, image: imageUrl }))}
                            style={{
                              border: productForm.image === imageUrl ? '3px solid #4CAF50' : '2px solid #e0e0e0',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              aspectRatio: '1',
                              background: '#f5f5f5'
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`Option ${index + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                      </div>
                      <input
                        type="url"
                        name="image"
                        value={productForm.image}
                        onChange={handleProductFormChange}
                        placeholder="Or paste image URL"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          marginTop: '0.5rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddProduct(false)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '2px solid #e0e0e0',
                          background: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}
                      >
                        Add Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Farmer's Products */}
            <div>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>Your Products ({farmerProducts.length})</h4>
              {farmerProducts.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem', 
                  background: '#f8f9fa', 
                  borderRadius: '12px',
                  color: '#666'
                }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}>🌱</span>
                  <p>You haven't added any products yet.</p>
                  <p>Click "Add New Product" to start selling!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {farmerProducts.map(product => (
                    <div key={product.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ height: '200px', overflow: 'hidden', background: '#f5f5f5' }}>
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '3rem'
                          }}>
                            🌱
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{product.name}</h4>
                        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{product.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4CAF50' }}>
                            ₹{product.price} {product.unit}
                          </span>
                          <span style={{ 
                            background: '#e8f5e8', 
                            color: '#4CAF50', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {product.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#ff6b35',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}
                        >
                          Delete Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="customer-dashboard">
          {/* Navigation Categories */}
          <div className="categories-nav">
            <div className="nav-container">
              {categories.map(category => (
                <button 
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Banner */}
          <div className="hero-banner">
            <div className="banner-content">
              <h2>Fresh from Farm to Table</h2>
              <p>Discover the freshest groceries directly from local farmers</p>
              <div className="banner-stats">
                <span>📦 Free delivery over ₹500</span>
                <span>🚚 Same day delivery</span>
                <span>🌱 100% Fresh guarantee</span>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-section">
            <h3>
              {searchQuery.trim() 
                ? `Search results for "${searchQuery}"` 
                : selectedCategory === 'All Products' ? 'Fresh Groceries' : selectedCategory
              }
              <span style={{ fontWeight: 'normal', fontSize: '1rem', color: '#666', marginLeft: '0.5rem' }}>
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
              </span>
            </h3>
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => handleImageError(e, product.name)}
                      style={{ backgroundColor: '#f0f0f0' }}
                    />
                    <div className="product-badge">Fresh</div>
                  </div>
                  
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="farmer-info">
                      <span className="farmer-name">👨‍🌾 {product.farmer_name}</span>
                      <span className="farmer-location">📍 {product.farmer_location}</span>
                    </div>
                    
                    <div className="rating-section">
                      <div className="stars">
                        {renderStars(4.5)} {/* Default rating for now */}
                      </div>
                      <span className="rating-text">(New Product)</span>
                    </div>
                    
                    <div className="price-section">
                      <span className="price">₹{product.price}</span>
                      <span className="unit">{product.unit}</span>
                    </div>
                    
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem', 
                  color: '#666',
                  gridColumn: '1 / -1'
                }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}>
                    {searchQuery.trim() ? '�' : '�🛒'}
                  </span>
                  <p>
                    {searchQuery.trim() 
                      ? `No products found for "${searchQuery}". Try a different search term.`
                      : 'No products found in this category.'
                    }
                  </p>
                  {searchQuery.trim() && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Farm View Modal */}
      {showFarmView && (
        <FarmView 
          user={user} 
          onClose={() => setShowFarmView(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
