import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState([]); const [categories, setCategories] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); Promise.all([api(`/products?${params}`), api('/categories')]).then(([p, c]) => { setData(p.data || []); setCategories(c.data || []); setError(''); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [params]);
  const set = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); };
  const keyword = params.get('keyword') || '';
  return <section className="catalog-page"><div className="page-intro"><div><span className="eyebrow">Koleksi Nusantara</span><h1>Temukan yang <i>berarti.</i></h1><p>Produk autentik dari tangan-tangan terbaik Indonesia.</p></div><span className="result-count">{loading ? '...' : `${data.length} produk`}</span></div>
    <div className="catalog-toolbar"><form className="catalog-search" onSubmit={event => { event.preventDefault(); set('keyword', event.currentTarget.elements.keyword.value); }}><span>⌕</span><input key={keyword} name="keyword" defaultValue={keyword} placeholder="Cari nama produk..." aria-label="Cari nama produk" /></form><select value={params.get('categoryId') || ''} onChange={event => set('categoryId', event.target.value)} aria-label="Filter kategori"><option value="">Semua kategori</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={params.get('sort') || 'terbaru'} onChange={event => set('sort', event.target.value)} aria-label="Urutkan produk"><option value="terbaru">Terbaru</option><option value="termurah">Harga terendah</option><option value="termahal">Harga tertinggi</option><option value="nama">Nama A–Z</option></select>{(keyword || params.get('categoryId') || params.get('sort')) && <button type="button" className="clear-filter" onClick={() => setParams({})}>Reset filter</button>}</div>
    {error && <p className="alert alert--error">{error}</p>}{loading ? <div className="product-grid">{[1, 2, 3, 4].map(item => <div className="skeleton-card" key={item}></div>)}</div> : data.length ? <div className="product-grid">{data.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span>○</span><h2>Belum menemukan yang cocok</h2><p>Coba kata kunci atau kategori lain.</p><Link className="button button--dark" to="/products">Lihat semua produk</Link></div>}
  </section>;
}
