import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl, money } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ productCount: 0, cheapestPrice: null });
  const [error, setError] = useState('');
  useEffect(() => {
    api('/home').then(result => {
      setProducts(result.data?.products || []);
      setCategories(result.data?.categories || []);
      setStats({ productCount: result.data?.productCount || 0, cheapestPrice: result.data?.cheapestPrice });
    }).catch(error => setError(error.message));
  }, []);
  return <div className="home-page">
    <section className="hero-panel">
      <div className="hero-copy"><span className="eyebrow">Dari tangan lokal, untuk rumahmu</span><h1>Hal-hal baik<br /><i>dibuat dengan hati.</i></h1><p>Jelajahi karya autentik dari pengrajin dan pelaku usaha lokal Indonesia.</p><Link className="button" to="/products">Jelajahi koleksi <span>→</span></Link><div className="home-stats"><div><strong>{stats.productCount}</strong><span>Produk terdaftar</span></div><div><strong>{categories.length}</strong><span>Kategori</span></div><div><strong>{stats.cheapestPrice ? money(stats.cheapestPrice) : '—'}</strong><span>Harga termurah</span></div></div></div>
      <div className="hero-art"><div className="hero-orbit"></div>{products[0]?.imageUrl && <img src={assetUrl(products[0].imageUrl)} alt={products[0].name} />}<div className="hero-note"><strong>01</strong><span>cerita<br />pilihan</span></div></div>
    </section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Temukan yang kamu suka</span><h2>Jelajah kategori</h2></div><Link to="/products">Lihat semua →</Link></div><div className="category-list">{categories.slice(0, 6).map((category, index) => <Link key={category.id} to={`/products?categoryId=${category.id}`} className={`category-item category-item--${index % 4}`}><span>0{index + 1}</span><h3>{category.name}</h3><b>↗</b></Link>)}</div></section>
    <section className="section-block section-block--products"><div className="section-heading"><div><span className="eyebrow">Pilihan terjangkau</span><h2>Serba murah</h2></div><Link to="/products?sort=termurah">Lihat yang termurah →</Link></div>{error ? <p className="alert alert--error">{error}</p> : <div className="product-grid">{products.slice(0, 6).map(product => <ProductCard key={product.id} product={product} featured />)}</div>}{!error && !products.length && <p className="empty-state">Belum ada produk untuk ditampilkan.</p>}</section>
    <section className="story-banner"><div><span className="eyebrow">Mengapa lokal?</span><h2>Setiap pembelianmu<br /><i>menjaga sebuah cerita hidup.</i></h2></div><p>Kami mempertemukanmu dengan karya penuh makna—dibuat perlahan, dengan bahan yang dipilih dan tangan yang terampil.</p><Link className="text-link" to="/products">Kenali karya mereka →</Link></section>
  </div>;
}
