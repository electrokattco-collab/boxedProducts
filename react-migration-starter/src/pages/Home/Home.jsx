import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard/ProductCard';
import { ProductModal } from '../../components/product/ProductModal/ProductModal';
import styles from './Home.module.css';

const FILTER_TAGS = ['all', 'Trending', 'Premium', 'Running', 'Boots'];

export const Home = () => {
  const [activeTag, setActiveTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { products, loading, error } = useProducts({
    filters: { isVisible: true }
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesTag = activeTag === 'all' || product.tag === activeTag;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <i className="fas fa-fire" /> Fresh kicks updated for your next order
        </div>
        <h1>step into the culture.</h1>
        <p>Free delivery nationwide • 100% authentic look • mobile-friendly shopping</p>
      </section>

      <section className={styles.topTools}>
        <div className={styles.resultsCopy}>
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 && 's'}
        </div>
        
        <div className={styles.filterChips}>
          {FILTER_TAGS.map(tag => (
            <button
              key={tag}
              className={`${styles.chip} ${activeTag === tag ? styles.active : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag === 'all' ? 'All' : tag}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search kicks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button><i className="fas fa-search" /></button>
      </section>

      {loading ? (
        <div className={styles.loading}>Loading products...</div>
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No products found</h3>
          <p>Try a different search or check back later!</p>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
};
