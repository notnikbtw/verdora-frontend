import { Provider } from 'react-redux';
import { store } from '@api/store';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import '@/index.css';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import Home from '@pages/Home';
import ForgotPassword from '@pages/auth/ForgotPassword';
import ResetPassword from '@pages/auth/ResetPassword';
import Cart from '@pages/Cart';
import Orders from '@pages/Orders';
import OrderDetails from '@pages/OrderDetails';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@api/queryClient';
import AdminCategoriesPage from '@pages/admin/CategoryPage';
import { TooltipProvider } from '@components/ui/tooltip';
import AdminDashboard from '@pages/admin/Dashboard';
import ProtectedRoute from '@/guards/ProtectedRoute';
import OrderManagement from '@pages/admin/OrderManagement';
import ProductManagement from '@pages/admin/ProductManagement';
import Checkout from '@pages/Checkout';
import OrderResult from '@pages/OrderResult';
import Catalog from '@pages/Catalog';
import ProductDetails from '@pages/ProductDetails';
import ScrollToTop from '@components/common/ScrollToTop';
import { fetchMe } from '@api/auth/auth.actions';

store.dispatch(fetchMe());

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <ProtectedRoute requireAuth={false}>
                  <ForgotPassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <ProtectedRoute requireAuth={false}>
                  <ResetPassword />
                </ProtectedRoute>
              }
            />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute requireAuth={true}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/order-result" element={<OrderResult />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute requireAuth={true}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute requireAuth={true}>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/admin">
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminCategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <OrderManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ProductManagement />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);
