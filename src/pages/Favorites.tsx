import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import type { AxiosError } from 'axios';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { useAppSelector } from '@api/hooks';
import { useGetProducts } from '@api/product/product.hooks';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { useGetFavorites } from '@api/favorites/favorites.hooks';
import { useToggleFavorite } from '@hooks/useToggleFavorite';
import { useAddProductToCart } from '@hooks/useAddProductToCart';
import type { FavoriteItem } from '@/types/favorites';
import type { ApiErrorResponse } from '@/types/api';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { SectionHeader } from '@/components/common/section/AdminSectionHeader';
import { EmptySection } from '@components/common/section/EmptySection';
import ErrorSection from '@components/common/section/ErrorSection';
import CatalogProductCard from '@components/catalog/CatalogProductCard';
import CatalogProductCardSkeleton from '@components/catalog/CatalogProductCardSkeleton';
import { PaginationComponent } from '@components/common/pagination/Pagination';
import type { Product } from '@/types/product';

const SUGGESTIONS_LIMIT = 4;
const FAVORITES_PER_PAGE = 12;

const getErrorMessage = (error: unknown, fallback: string) =>
  (error as AxiosError<ApiErrorResponse> | null)?.response?.data?.message ||
  fallback;

const toProduct = (
  item: FavoriteItem,
  productsById: Map<number, Product>
): Product => {
  const known = productsById.get(item.productId);
  return {
    productId: item.productId,
    name: item.productName || known?.name || '',
    description: known?.description ?? '',
    price: item.price || known?.price || 0,
    discountPrice: item.discountPrice || known?.discountPrice || null,
    imageUrl: item.imageUrl || known?.imageUrl || '',
    categoryId: known?.categoryId ?? 0,
  };
};

const Favorites = () => {
  const { user } = useAppSelector(state => state.auth);
  const isAuthenticated = Boolean(user);

  const { addToCart } = useAddProductToCart();
  const {
    data: favorites,
    isLoading: isFavoritesLoading,
    isError: isFavoritesError,
    error: favoritesError,
    refetch: refetchFavorites,
  } = useGetFavorites(isAuthenticated);

  const { data: productsData } = useGetProducts({ size: 8 });

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const { favoriteIdsSet, isFavoritePending, toggleFavorite } =
    useToggleFavorite({
      onAuthRequired: () => setIsLoginPromptOpen(true),
    });

  const productsById = useMemo(
    () => new Map((productsData?.content ?? []).map(p => [p.productId, p])),
    [productsData]
  );

  const favoriteProducts: Product[] = useMemo(() => {
    if (!Array.isArray(favorites)) return [];
    return [...favorites]
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      .map(item => toProduct(item, productsById));
  }, [favorites, productsById]);

  const suggestionProducts: Product[] = useMemo(
    () =>
      (productsData?.content ?? [])
        .filter(p => !favoriteIdsSet.has(p.productId))
        .slice(0, SUGGESTIONS_LIMIT),
    [productsData, favoriteIdsSet]
  );

  const savedCount = favoriteProducts.length;
  const totalPages = Math.ceil(savedCount / FAVORITES_PER_PAGE);
  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;
  const pagedProducts = favoriteProducts.slice(
    safeCurrentPage * FAVORITES_PER_PAGE,
    (safeCurrentPage + 1) * FAVORITES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const isGuestView = !isAuthenticated;
  const isErrorView =
    isAuthenticated && !isFavoritesLoading && isFavoritesError && !favorites;
  const isReady = isAuthenticated && !isFavoritesLoading && !isErrorView;
  const isEmptyView = isReady && savedCount === 0;
  const isListView = isReady && savedCount > 0;

  return (
    <LayoutPage>
      <div className="flex flex-col gap-6 pt-6 pb-28">
        <Breadcrumbs className="text-sm" />

        <SectionHeader
          title="Favorites"
          count={savedCount}
          countLabel="products"
        />

        {isGuestView && (
          <EmptySection
            className="py-12"
            title="Sign in to see your favorites"
            description="Log in to your account to save plants and accessories you love and find them here anytime."
            icon={<Heart className="size-10 text-[#FA1105] stroke-[1.6]" />}
            action={<Link to="/login">Sign in</Link>}
          />
        )}

        {isFavoritesLoading && (
          <div className="mt-6 mb-14">
            <CatalogProductCardSkeleton viewMode="grid" />
          </div>
        )}

        {isErrorView && (
          <ErrorSection
            title="Unable to load favorites"
            message={getErrorMessage(
              favoritesError,
              'We were unable to retrieve your saved products. Please check your connection and try again.'
            )}
            onRetry={() => refetchFavorites()}
          />
        )}

        {isEmptyView && (
          <EmptySection
            className="py-12"
            title="No favorites yet"
            description="You haven't saved any plants or accessories yet. Click the heart icon while exploring the catalog to save your favorite greenery here."
            icon={<Heart className="size-10 text-[#FA1105] stroke-[1.6]" />}
            action={<Link to="/catalog">Explore Catalog</Link>}
          />
        )}

        {isListView && (
          <div className="flex flex-col gap-6 mb-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
              {pagedProducts.map(product => (
                <CatalogProductCard
                  key={product.productId}
                  product={product}
                  viewMode="grid"
                  isFavorite
                  isFavoritePending={isFavoritePending(product.productId)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={() => setIsLoginPromptOpen(true)}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="pt-2 flex justify-center">
                <PaginationComponent
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-12 text-[14px] text-[#5C665D] font-medium pt-2">
                <span>That’s everything you’ve saved</span>
              </div>
            )}
          </div>
        )}

        {isReady && suggestionProducts.length > 0 && (
          <section className="mt-8 pt-8 border-t border-[#E4E8E3]/70">
            <div className="flex items-baseline justify-between gap-4 flex-wrap mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-[#3E8D35]" />
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#0C0C0C] tracking-tight">
                  You may also like
                </h2>
              </div>

              <Link
                to="/catalog"
                className="text-[15px] font-semibold text-[#2F6B29] hover:underline flex items-center gap-1 group"
              >
                <span>See catalog</span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
              {suggestionProducts.map(product => (
                <CatalogProductCard
                  key={product.productId}
                  product={product}
                  viewMode="grid"
                  isFavorite={favoriteIdsSet.has(product.productId)}
                  isFavoritePending={isFavoritePending(product.productId)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={() => setIsLoginPromptOpen(true)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action="favorite"
      />
    </LayoutPage>
  );
};

export default Favorites;
