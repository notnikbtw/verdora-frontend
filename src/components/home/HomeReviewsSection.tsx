import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import SectionLayout from '@components/common/section/SectionLayout';
import ReviewsCarousel from '@components/home/ReviewsCarousel';

const reviews = [
  {
    text: 'Fast delivery and beautiful plants. Highly recommend Verdora!',
    name: 'Bill Afton',
    rating: '4.0/5',
    initials: 'BA',
  },
  {
    text: 'Excellent quality and friendly service. Very happy with my order.',
    name: 'Amily Grenshy',
    rating: '4.9/5',
    initials: 'AG',
  },
  {
    text: 'Everything arrived fresh and in perfect condition. Thank you!',
    name: 'Omar Kirik',
    rating: '4.5/5',
    initials: 'OK',
  },
  {
    text: 'Amazing selection of plants and gardening supplies. Love this shop!',
    name: 'Greg Harigton',
    rating: '4.9/5',
    initials: 'GH',
  },
  {
    text: 'The plant was packed carefully and looks wonderful at home.',
    name: 'Mia Brown',
    rating: '5.0/5',
    initials: 'MB',
  },
];

const HomeReviewsSection = () => (
  <SectionLayout title="Our reviews">
    <ReviewsCarousel>
      {reviews.map(review => (
        <article
          key={review.name}
          className="flex min-w-70 sm:min-w-85 snap-start flex-col justify-between rounded-2xl bg-white/80 lg:backdrop-blur-sm border border-white/80 p-6 shadow-xs hover:shadow-md transition-all duration-300"
        >
          <p className="text-sm sm:text-base leading-relaxed text-[#2C332D] mb-6">
            "{review.text}"
          </p>
          <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-[#1E331B] font-medium">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-8 after:hidden">
                <AvatarFallback className="bg-[#D9E3D5] text-xs font-bold text-[#1E331B]">
                  {review.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[#1E331B] font-sans">{review.name}</span>
            </div>
            <span className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Star className="size-3.5 fill-[#FFC800] text-[#FFC800]" />
              <span className="text-sm font-normal leading-none tracking-[0.02em] text-[#1E331B]">
                {review.rating}
              </span>
            </span>
          </div>
        </article>
      ))}
    </ReviewsCarousel>
  </SectionLayout>
);

export default HomeReviewsSection;
