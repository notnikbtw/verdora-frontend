import { Link } from 'react-router-dom';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import { Button } from '@components/ui/button';

const NotFound = () => (
  <LayoutPage>
    <section
      aria-labelledby="not-found-title"
      className="flex flex-1 items-center justify-center py-12 sm:py-20"
    >
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-10">
        <p
          aria-hidden="true"
          className="text-8xl font-black leading-none text-primary sm:text-9xl"
        >
          404
        </p>
        <h1
          id="not-found-title"
          className="mt-5 text-2xl font-bold text-foreground sm:text-3xl"
        >
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          The page you’re looking for doesn’t exist or has been moved
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="touch">
            <Link to="/">Go home</Link>
          </Button>
          <Button asChild variant="outline" size="touch">
            <Link to="/catalog">Browse catalog</Link>
          </Button>
        </div>
      </div>
    </section>
  </LayoutPage>
);

export default NotFound;
