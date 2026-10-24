import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { api } from './api';
import BaseLayout from './pages/BaseLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import SellerProducts from './pages/SellerProducts';

export default function App() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    if (!localStorage.getItem('toko.accessToken')) return setUser(null);
    api('/auth/me').then(r => setUser(r.data)).catch(() => setUser(null));
  }, []);
  if (user === undefined) return <div className="app-loading"><span className="brand-mark">TN</span><p>Menyiapkan ruang belanja...</p></div>;

  return <BrowserRouter><Routes><Route element={<BaseLayout user={user} setUser={setUser} />}>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetail user={user} />} />
    <Route path="/login" element={<Auth setUser={setUser} />} />
    <Route path="/register" element={<Auth register setUser={setUser} />} />
    <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/seller/products" element={<SellerProducts user={user} />} />
    <Route path="*" element={<Home />} />
  </Route></Routes></BrowserRouter>;
}
