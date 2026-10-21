import { useState } from 'react';
import { EmptySection } from '@components/common/section/EmptySection';
import { Button } from '@components/ui/button';
import CartIcon from '@assets/icons/cart.svg?react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types/product';
import SectionLayout from '@components/common/section/SectionLayout';
import CatalogProductCard from '@components/catalog/CatalogProductCard';
import CatalogProductCardSkeleton from '@components/catalog/CatalogProductCardSkeleton';
import LoginPromptDialog from '@components/common/dialog/LoginPromptDialog';
import { useToggleFavorite } from '@hooks/useToggleFavorite';
import { useAddProductToCart } from '@hooks/useAddProductToCart';
import type React from 'react';

type ProductGridSectionProps = {
  title: string;
  titleIcon?: React.ReactNode;
  viewAllLink?: string;
  viewAllText?: string;
  products?: Product[];
  isLoading?: boolean;
  limit?: number;
  categoryMap?: Map<number, string>;
  emptyTitle?: string;
  emptyDescription?: string;
  gridClassName?: string;
};

const ProductGridSection = ({
  title,
  titleIcon,
  viewAllLink,
  viewAllText,
  products,
  isLoading,
  limit = 8,
  categoryMap,
  emptyTitle = 'No products found',
  emptyDescription = 'There are no products available at the moment. Please try again later.',
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
}: ProductGridSectionProps) => {
  const displayProducts = products ? products.slice(0, limit) : [];

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const openLoginPrompt = () => setIsLoginPromptOpen(true);

  const { isFavorite, isFavoritePending, toggleFavorite } = useToggleFavorite({
    onAuthRequired: openLoginPrompt,
  });
  const { addToCart } = useAddProductToCart();

  return (
    <SectionLayout
      title={title}
      titleIcon={titleIcon}
      viewAllLink={viewAllLink}
      viewAllText={viewAllText}
      contentClassName={gridClassName}
    >
      {isLoading ? (
        <CatalogProductCardSkeleton
          viewMode="grid"
          count={4}
          className="contents"
        />
      ) : displayProducts.length > 0 ? (
        displayProducts.map(item => (
          <CatalogProductCard
            key={item.productId}
            product={item}
            categoryName={categoryMap?.get(item.categoryId)}
            viewMode="grid"
            isFavorite={isFavorite(item.productId)}
            isFavoritePending={isFavoritePending(item.productId)}
            onToggleFavorite={toggleFavorite}
            onAddToCart={addToCart}
            onAuthRequired={openLoginPrompt}
          />
        ))
      ) : (
        <EmptySection
          title={emptyTitle}
          description={emptyDescription}
          className="flex-1 p-4 col-span-full"
          icon={<CartIcon className="size-4" />}
          action={
            <Button variant="default" asChild>
              <Link to="/catalog">View products</Link>
            </Button>
          }
        />
      )}

      <LoginPromptDialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
        action="favorite"
      />
    </SectionLayout>
  );
};

export default ProductGridSection;
