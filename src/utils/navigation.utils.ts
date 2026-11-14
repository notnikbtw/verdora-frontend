type StorefrontLocation = { pathname: string; search: string };

export const isSalesLocation = ({ pathname, search }: StorefrontLocation) => {
  const params = new URLSearchParams(search);
  return (
    pathname === '/sales' ||
    (pathname === '/catalog' &&
      (params.get('discount') === 'true' || params.get('onSale') === 'true'))
  );
};
