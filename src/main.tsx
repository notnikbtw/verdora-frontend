import { Provider } from 'react-redux';
import { store } from '@api/store';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/AppRoutes';
import '@/index.css';
import 'react-toastify/dist/ReactToastify.css';
import AppToastContainer from '@components/common/AppToastContainer';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@api/queryClient';
import { TooltipProvider } from '@components/ui/tooltip';
import ScrollToTop from '@components/common/ScrollToTop';
import UserScopedCacheReset from '@components/common/UserScopedCacheReset';
import { fetchMe } from '@api/auth/auth.actions';

store.dispatch(fetchMe());

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <UserScopedCacheReset />
          <AppToastContainer />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);
