import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Header.module.css';

export const Header = () => {
  const { itemCount } = useCart();
  const { user, isAdmin, logout, isAuthenticated } = useAuth();

  return (
    <header className={styles.glassHeader}>
      <Link to="/" className={styles.logo}>
        <i className="fas fa-shoe-prints" /> boxedSneaks
      </Link>

      <nav className={styles.navLinks}>
        <Link to="/"><i className="fas fa-home" /> Home</Link>
        <Link to="/about"><i className="fas fa-info-circle" /> About</Link>
        <Link to="/cart" className={styles.cartLink}>
          <i className="fas fa-shopping-bag" /> Cart
          <span className={styles.cartBadge}>{itemCount}</span>
        </Link>
        <Link to="/contact"><i className="fas fa-address-book" /> Contact</Link>
        
        {isAuthenticated ? (
          <>
            {isAdmin && <Link to="/admin" className={styles.adminLink}><i className="fas fa-cog" /> Admin</Link>}
            <button onClick={logout} className={styles.logoutBtn}><i className="fas fa-sign-out-alt" /> Logout</button>
          </>
        ) : (
          <Link to="/login" className={styles.loginLink}><i className="fas fa-user" /> Login</Link>
        )}
      </nav>
    </header>
  );
};
