import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import Breadcrumbs from '@components/common/Breadcrumbs';
import { Button } from '@components/ui/button';

const Terms = () => (
  <LayoutPage>
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Terms of Service and Privacy Policy' },
        ]}
      />
      <section
        aria-labelledby="terms-title"
        className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card p-6 sm:p-10"
      >
        <FileText aria-hidden="true" className="mb-4 size-10 text-primary" />
        <h1
          id="terms-title"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Terms of Service and Privacy Policy
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The Terms of Service and Privacy Policy have not been published yet.
          This page does not contain the documents referenced by the agreement
          checkbox.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          If you need these documents before creating an account or placing an
          order, please contact us at{' '}
          <a
            href="mailto:vedora@gmail.com"
            className="text-primary underline underline-offset-4"
          >
            vedora@gmail.com
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="touch">
            <Link to="/cart">Return to cart</Link>
          </Button>
          <Button asChild size="touch" variant="outline">
            <Link to="/catalog">Browse catalog</Link>
          </Button>
        </div>
      </section>
    </div>
  </LayoutPage>
);

export default Terms;
