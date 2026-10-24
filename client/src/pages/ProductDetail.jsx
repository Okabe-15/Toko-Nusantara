import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, assetUrl, money } from '../api';

export default function ProductDetail({ user }) {
  const { id } = useParams(); const [product, setProduct] = useState(null); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { api(`/products/${id}`).then(r => setProduct(r.data)).catch(e => setError(e.message)); }, [id]);
  async function add() { try { await api('/cart/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ProductId: id }) }); setMessage('Produk berhasil masuk ke keranjang.'); } catch (e) { setError(e.message); } }
  if (error) return <section className="state-page"><p className="alert alert--error">{error}</p><Link to="/products">← Kembali ke katalog</Link></section>;
  if (!product) return <section className="state-page"><p>Memuat produk...</p></section>;
  return <section className="detail-page"><Link className="back-link" to="/products">← Kembali ke katalog</Link><div className="detail-layout"><div className="detail-image">{product.imageUrl ? <img src={assetUrl(product.imageUrl)} alt={product.name} /> : <span className="image-placeholder">TN</span>}</div><div className="detail-copy"><span className="eyebrow">{product.Category?.name || 'Produk lokal'}</span><h1>{product.name}</h1><strong className="detail-price">{money(product.price)}</strong><div className="detail-rule"></div><p>{product.description}</p>{user?.role === 'buyer' ? <button className="button" onClick={add}>Tambah ke keranjang <span>→</span></button> : !user ? <p className="login-hint">Ingin membeli produk ini? <Link to="/login">Masuk terlebih dahulu.</Link></p> : null}{message && <p className="alert alert--success">{message}</p>}</div></div></section>;
}
