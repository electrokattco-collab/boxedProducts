import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Pages
import { Home } from '../pages/Home/Home';
import { About } from '../pages/About/About';
import { Contact } from '../pages/Contact/Contact';
import { Cart } from '../pages/Cart/Cart';
import { Login } from '../pages/Login/Login';
import { Admin } from '../pages/Admin/Admin';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/login" element={<Login />} />
    
    <Route path="/admin" element={
      <AdminRoute>
        <Admin />
      </AdminRoute>
    } />
  </Routes>
);
