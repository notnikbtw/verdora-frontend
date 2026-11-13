import { ToastContainer } from 'react-toastify';
import { useIsMobile } from '@hooks/use-mobile';

const AppToastContainer = () => {
  const isMobile = useIsMobile();
  return (
    <ToastContainer
      position={isMobile ? 'bottom-center' : 'top-right'}
      autoClose={4000}
      newestOnTop
      style={
        isMobile
          ? {
              bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(calc(100vw - 2rem), 24rem)',
              padding: 0,
            }
          : undefined
      }
    />
  );
};

export default AppToastContainer;
