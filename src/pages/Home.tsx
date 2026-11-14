import { Truck, BadgeCheck, Headset, Sprout } from 'lucide-react';
import { lazy } from 'react';
import { Link } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import DeferredSection from '@components/common/DeferredSection';
import { Button } from '@components/ui/button';
import HeroImage from '@assets/images/hero-plants.webp';
import HeroSmall from '@assets/images/hero-plants-480.webp';
import HeroMedium from '@assets/images/hero-plants-960.webp';

const HomeProductOfTheDay = lazy(
  () => import('@components/home/HomeProductOfTheDay')
);
const HomeInteriorSection = lazy(
  () => import('@components/home/HomeInteriorSection')
);
const HomeReviewsSection = lazy(
  () => import('@components/home/HomeReviewsSection')
);
const HomeSalesSection = lazy(() =>
  import('@components/home/HomeProductSections').then(module => ({
    default: module.HomeSalesSection,
  }))
);
const HomeCategoriesSection = lazy(() =>
  import('@components/home/HomeProductSections').then(module => ({
    default: module.HomeCategoriesSection,
  }))
);
const HomeCatalogSection = lazy(() =>
  import('@components/home/HomeProductSections').then(module => ({
    default: module.HomeCatalogSection,
  }))
);

const Home = () => (
  <LayoutPage>
    <div className="mt-8 sm:mt-16 flex flex-col items-center gap-16 sm:gap-24 w-full pb-16">
      <section className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6 w-full">
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] sm:leading-[0.98]
                tracking-tight text-[#1E331B] lg:text-transparent
                lg:bg-[url('@assets/images/text-background.avif')] lg:bg-cover lg:bg-center lg:bg-clip-text
                font-sans max-w-3xl"
          >
            We're glad you found us. Now let's find your plant!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-[#4A5568] max-w-2xl">
            Your home deserves more than furniture and paint. It deserves life —
            real, breathing, growing life. Our collection brings together the
            most beautiful plants from around the world.
          </p>
          <Button asChild>
            <Link to="/catalog">Start shopping</Link>
          </Button>
        </div>
        <div className="relative z-10 -mt-12 sm:-mt-24 max-w-3xl w-full pointer-events-none transition-transform hover:scale-[1.01] duration-500">
          <img
            src={HeroImage}
            srcSet={`${HeroSmall} 480w, ${HeroMedium} 960w, ${HeroImage} 1780w`}
            sizes="(min-width: 1025px) 864px, (min-width: 800px) 768px, calc(100vw - 2rem)"
            width={1780}
            height={1046}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            alt="Hero Plants"
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      <section className="w-full bg-[#1E331B] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center text-white">
          <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
            <Truck aria-hidden="true" className="size-8 text-[#A8C89A]" />
            <p className="text-xs sm:text-sm font-medium leading-snug">
              Shipped Direct from the Nursery
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
            <BadgeCheck aria-hidden="true" className="size-8 text-[#A8C89A]" />
            <p className="text-xs sm:text-sm font-medium leading-snug">
              30 Day Happiness Guarantee
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
            <Headset aria-hidden="true" className="size-8 text-[#A8C89A]" />
            <p className="text-xs sm:text-sm font-medium leading-snug">
              Expert Customer Support
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors duration-300">
            <Sprout aria-hidden="true" className="size-8 text-[#A8C89A]" />
            <p className="text-xs sm:text-sm font-medium leading-snug">
              Care Instructions Provided
            </p>
          </div>
        </div>
      </section>
      <DeferredSection
        label="Product of the day"
        placeholderClassName="min-h-[40rem] lg:min-h-[24rem]"
      >
        <HomeProductOfTheDay />
      </DeferredSection>
      <DeferredSection
        label="Sales"
        placeholderClassName="min-h-[160rem] sm:min-h-[80rem] lg:min-h-[45rem]"
      >
        <HomeSalesSection />
      </DeferredSection>
      <DeferredSection
        label="Integrate in your house"
        placeholderClassName="min-h-[56rem] lg:min-h-[32rem]"
      >
        <HomeInteriorSection />
      </DeferredSection>
      <DeferredSection
        label="Categories"
        placeholderClassName="min-h-[40rem] sm:min-h-[26rem] xl:min-h-[16rem]"
      >
        <HomeCategoriesSection />
      </DeferredSection>
      <DeferredSection
        label="Find your perfect plant"
        placeholderClassName="min-h-[160rem] sm:min-h-[80rem] lg:min-h-[45rem]"
      >
        <HomeCatalogSection />
      </DeferredSection>
      <DeferredSection label="Our reviews" placeholderClassName="min-h-[24rem]">
        <HomeReviewsSection />
      </DeferredSection>
    </div>
  </LayoutPage>
);

export default Home;
