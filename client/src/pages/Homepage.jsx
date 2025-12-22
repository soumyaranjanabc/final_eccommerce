// client/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import CategoryNav from '../components/CategoryNav'; 

const HomePage = () => {
    const [allProducts, setAllProducts] = useState([]);      
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [priceRange, setPriceRange] = useState([0, 100000]);

    // STOCK FILTER STATE
    const [stockFilter, setStockFilter] = useState({
        inStock: true,
        outOfStock: false,
        lowStock: false,
        bulkStock: false,
    });

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/products`
                );

                setAllProducts(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch products. Please check the backend connection.');
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // MAIN FILTERING LOGIC
    useEffect(() => {
        let currentProducts = allProducts;
        
        // 1. Category Filter
        if (selectedCategoryId !== null) {
            currentProducts = currentProducts.filter(p => p.category_id == selectedCategoryId);
        }

        // 2. Search Filter
        if (searchTerm.trim() !== '') {
            const lowerCaseSearch = searchTerm.toLowerCase().trim();
            currentProducts = currentProducts.filter(p => 
                p.name.toLowerCase().includes(lowerCaseSearch) ||
                p.description.toLowerCase().includes(lowerCaseSearch)
            );
        }

        // 3. Price Filter
        currentProducts = currentProducts.filter(
            p => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // 4. Stock-based filtering
        currentProducts = currentProducts.filter((p) => {
            const qty = p.stock_quantity;

            if (stockFilter.inStock && qty <= 0) return false;
            if (stockFilter.outOfStock && qty > 0) return false;

            if (stockFilter.lowStock && qty >= 50) return false;
            if (stockFilter.bulkStock && qty < 500) return false;

            return true;
        });

        setFilteredProducts(currentProducts);
    }, [selectedCategoryId, searchTerm, priceRange, stockFilter, allProducts]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    if (loading) return (
        <>
            <Header />
            <p className="loading" style={{textAlign: 'center', marginTop: '20px'}}>Loading products...</p>
            <Footer />
        </>
    );

    if (error) return (
        <>
            <Header />
            <p className="error-message" style={{maxWidth: '600px', margin: '20px auto'}}>{error}</p>
            <Footer />
        </>
    );

    return (
        <>
            <Header />
            
            <section className="hero-banner">
                <div className="hero-content">
                    <h1>Build Strong. Build Smart.</h1>
                    <p>Premium construction materials for modern projects</p>
                    <button className="hero-btn">Explore Materials</button>
                </div>
            </section>

            <div className="homepage-main-layout"> 
                <aside className="sidebar">
                    <CategoryNav onCategorySelect={setSelectedCategoryId} />

                    {/* PRICE FILTER */}
                    <div className="price-range-block">
                        <h4>Price Range (₹)</h4>
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="500"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                        />
                        <div className="price-values">
                            ₹0 – ₹{priceRange[1].toLocaleString()}
                        </div>
                    </div>

                    {/* STOCK FILTER UI */}
                    <div className="stock-filter">
                        <h4>Availability</h4>
                        <label>
                            <input
                                type="checkbox"
                                checked={stockFilter.inStock}
                                onChange={() => setStockFilter({ ...stockFilter, inStock: !stockFilter.inStock })}
                            />
                            In Stock
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={stockFilter.outOfStock}
                                onChange={() => setStockFilter({ ...stockFilter, outOfStock: !stockFilter.outOfStock })}
                            />
                            Out of Stock
                        </label>

                        <h4 style={{ marginTop: "15px" }}>Stock Level</h4>
                        <label>
                            <input
                                type="checkbox"
                                checked={stockFilter.lowStock}
                                onChange={() => setStockFilter({ ...stockFilter, lowStock: !stockFilter.lowStock })}
                            />
                            Low Stock (&lt; 50)
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={stockFilter.bulkStock}
                                onChange={() => setStockFilter({ ...stockFilter, bulkStock: !stockFilter.bulkStock })}
                            />
                            Bulk Available (≥ 500)
                        </label>
                    </div>
                </aside>
                
                <main className="product-display">
                    <div className="product-search-area">
                        <input
                            type="text"
                            placeholder="Search by name or description..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input-field" 
                        />
                    </div>
                    
                    <div className="product-grid">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                        {filteredProducts.length === 0 && (
                            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
                                No products found matching your criteria.
                            </p>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default HomePage;