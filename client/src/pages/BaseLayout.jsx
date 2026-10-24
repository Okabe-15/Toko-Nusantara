import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/navbar';

export default function BaseLayout({ user, setUser }) {
  return <><Navbar user={user} setUser={setUser} /><main><Outlet context={{ user }} /></main><footer className="site-footer"><div className="footer-shell"><div><Link to="/" className="brand brand--footer"><span className="brand-mark">TN</span><span>Toko <em>Nusantara</em></span></Link><p>Temukan cerita di setiap produk.</p></div><div className="footer-links"><Link to="/products">Jelajah produk</Link><Link to="/register">Gabung sebagai penjual</Link><span>© {new Date().getFullYear()} Toko Nusantara</span></div></div></footer></>;
}
