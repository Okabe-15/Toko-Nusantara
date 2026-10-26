import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl, money } from '../api';

export default function Cart() {
  const [cart, setCart] = useState(null); const [error, setError] = useState('');
  const load = async () => {
    try {
      const response = await api('/cart');
      setCart(response.data);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  async function update(id, quantity) { try { await api(`/cart/items/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) }); load(); } catch (e) { setError(e.message); } }
  async function remove(id) { try { await api(`/cart/items/${id}`, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); } }
  if (error) return <section className="state-page"><p className="alert alert--error">{error}</p></section>;
  if (!cart) return <section className="state-page"><p>Memuat keranjang...</p></section>;
  const hasBudget = cart.budgetLimit !== null && cart.budgetLimit !== undefined;
  return <section className="cart-page"><div className="page-intro"><div><span className="eyebrow">Ruang belanja</span><h1>Keranjangmu</h1></div><span className="result-count">{cart.items.length} item</span></div>{cart.items.length ? <div className="cart-layout"><div className="cart-items">{cart.items.map(item => <div className="cart-item" key={item.id}><div className="cart-thumb">{item.Product.imageUrl ? <img src={assetUrl(item.Product.imageUrl)} alt="" /> : 'TN'}</div><div className="cart-item__info"><span>{item.Product.Category?.name || 'Produk lokal'}</span><h3>{item.Product.name}</h3><p>{money(item.Product.price)}</p></div><div className="quantity"><button onClick={() => update(item.id, Math.max(1, item.quantity - 1))}>−</button><b>{item.quantity}</b><button onClick={() => update(item.id, Number(item.quantity) + 1)}>+</button></div><strong>{money(item.subtotal)}</strong><button className="remove-button" onClick={() => remove(item.id)} aria-label={`Hapus ${item.Product.name}`}>×</button></div>)}</div><aside className="cart-summary"><span className="eyebrow">Ringkasan</span><div><span>Total belanja</span><strong>{money(cart.total)}</strong></div>{hasBudget ? <p className={cart.exceedsBudget ? 'budget-warning' : 'budget-ok'}>{cart.exceedsBudget ? `Melebihi anggaran ${money(Math.abs(cart.remainingBudget))}` : `Sisa anggaran ${money(cart.remainingBudget)}`}</p> : <p className="budget-ok">Belum ada batas anggaran</p>}<Link className="button button--dark button--full" to="/products">Lanjut belanja</Link></aside></div> : <div className="empty-state"><span>🛍</span><h2>Keranjangmu masih kosong</h2><p>Temukan sesuatu yang dibuat khusus untukmu.</p><Link className="button button--dark" to="/products">Mulai menjelajah</Link></div>}</section>;
}
