import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PageLoading from '@components/common/PageLoading';
import ProtectedRoute from '@/guards/ProtectedRoute';
import OAuthReturnHandler from '@components/common/OAuthReturnHandler';

const Home = lazy(() => import('@pages/Home'));
const Catalog = lazy(() => import('@pages/Catalog'));
const ProductDetails = lazy(() => import('@pages/ProductDetails'));
const Cart = lazy(() => import('@pages/Cart'));
const Checkout = lazy(() => import('@pages/Checkout'));
const Favorites = lazy(() => import('@pages/Favorites'));
const Profile = lazy(() => import('@pages/Profile'));
const Orders = lazy(() => import('@pages/Orders'));
const OrderDetails = lazy(() => import('@pages/OrderDetails'));
const OrderResult = lazy(() => import('@pages/OrderResult'));
const Login = lazy(() => import('@pages/auth/Login'));
const Register = lazy(() => import('@pages/auth/Register'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@pages/auth/ResetPassword'));
const AdminDashboard = lazy(() => import('@pages/admin/Dashboard'));
const AdminCategoriesPage = lazy(() => import('@pages/admin/CategoryPage'));
const OrderManagement = lazy(() => import('@pages/admin/OrderManagement'));
const ProductManagement = lazy(() => import('@pages/admin/ProductManagement'));
const DiscountManagement = lazy(
  () => import('@pages/admin/DiscountManagement')
);
const ReportManagement = lazy(() => import('@pages/admin/ReportManagement'));

const AppRoutes = () => (
  <Suspense fallback={<PageLoading />}>
    <Routes>
      <Route
        path="/oauth/callback"
        element={
          <OAuthReturnHandler>
            <Navigate to="/" replace />
          </OAuthReturnHandler>
        }
      />
      <Route
        path="/"
        element={
          <OAuthReturnHandler>
            <Home />
          </OAuthReturnHandler>
        }
      />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/categories" element={<Navigate to="/catalog" replace />} />
      <Route path="/products" element={<Navigate to="/catalog" replace />} />
      <Route
        path="/sales"
        element={<Navigate to="/catalog?discount=true" replace />}
      />

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
        path="/favourites"
        element={<Navigate to="/favorites" replace />}
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute requireAuth={true}>
            <Favorites />
          </ProtectedRoute>
        }
      />
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
        path="/profile"
        element={
          <ProtectedRoute requireAuth={true}>
            <Profile />
          </ProtectedRoute>
        }
      />
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
        >
          <Route path="new" />
        </Route>
        <Route
          path="discounts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DiscountManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportManagement />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
