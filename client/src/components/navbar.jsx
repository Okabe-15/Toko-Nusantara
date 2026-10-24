import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch (error) { console.error(error); }
    localStorage.removeItem('toko.accessToken'); setUser(null); navigate('/');
  }
  function search(event) {
    event.preventDefault();
    navigate(`/products${keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : ''}`);
    setOpen(false);
  }
  return <header className="site-header">
    <div className="nav-shell">
      <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">TN</span><span>Toko <em>Nusantara</em></span></Link>
      <button className="menu-toggle" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      <div className={`nav-content${open ? ' is-open' : ''}`}>
        <form className="nav-search" onSubmit={search}><span aria-hidden="true">⌕</span><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="Cari produk lokal..." aria-label="Cari produk" /></form>
        <nav className="nav-links">
          <Link to="/products" onClick={() => setOpen(false)}>Jelajah</Link>
          {user?.role === 'buyer' && <Link to="/cart" onClick={() => setOpen(false)}>Keranjang</Link>}
          {user?.role === 'seller' && <Link to="/seller/products" onClick={() => setOpen(false)}>Kelola produk</Link>}
          {user && <Link to="/profile" onClick={() => setOpen(false)}>Profil</Link>}
          {user ? <button className="button button--quiet" onClick={logout}>Keluar</button> : <><Link to="/login" onClick={() => setOpen(false)}>Masuk</Link><Link className="button button--small" to="/register" onClick={() => setOpen(false)}>Mulai menjual</Link></>}
        </nav>
      </div>
    </div>
  </header>;
}
