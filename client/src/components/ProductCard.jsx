import { Link } from 'react-router-dom';
import { assetUrl, money } from '../api';

export default function ProductCard({ product, featured = false }) {
  return <Link to={`/products/${product.id}`} className={`product-card${featured ? ' product-card--featured' : ''}`}>
    <div className="product-card__image">
      {product.imageUrl ? <img src={assetUrl(product.imageUrl)} alt={product.name} /> : <span className="image-placeholder">TN</span>}
      <span className="product-card__tag">{product.Category?.name || 'Pilihan lokal'}</span>
    </div>
    <div className="product-card__body">
      <h3>{product.name}</h3>
      <p>{money(product.price)}</p>
    </div>
  </Link>;
}
