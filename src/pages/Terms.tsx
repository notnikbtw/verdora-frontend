import { Link, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import LayoutPage from '@components/layout/pageLayout/LayoutPage';
import Breadcrumbs from '@components/common/Breadcrumbs';
import { Button } from '@components/ui/button';
import {
  TERMS_PAGE_TITLE,
  TERMS_CONTACT_EMAIL,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
} from '@/config/terms.config';

const policyUpdatedLabel = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(PRIVACY_POLICY.lastUpdated));

const Terms = () => {
  const navigate = useNavigate();
  // Unlike history.length, the router index excludes earlier external visits.
  const canGoBack =
    typeof window.history.state?.idx === 'number' &&
    window.history.state.idx > 0;

  const handleGoBack = () => {
    if (canGoBack) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <LayoutPage>
      <div className="page-stack">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: TERMS_PAGE_TITLE }]}
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
            {TERMS_PAGE_TITLE}
          </h1>
          <section aria-labelledby="privacy-policy-title" className="mt-8">
            <h2 id="privacy-policy-title" className="text-xl font-semibold">
              {PRIVACY_POLICY.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated:{' '}
              <time dateTime={PRIVACY_POLICY.lastUpdated}>
                {policyUpdatedLabel}
              </time>
            </p>
            <ul className="mt-5 list-disc space-y-4 pl-5 leading-relaxed text-muted-foreground">
              {PRIVACY_POLICY.sections.map(section => (
                <li key={section.id}>
                  <strong className="font-semibold text-foreground">
                    {section.title}:
                  </strong>{' '}
                  {section.text}
                </li>
              ))}
            </ul>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Questions:{' '}
              <a
                href={`mailto:${TERMS_CONTACT_EMAIL}`}
                className="wrap-anywhere text-primary underline underline-offset-4"
              >
                {TERMS_CONTACT_EMAIL}
              </a>
            </p>
          </section>
          <section
            aria-labelledby="terms-of-service-title"
            className="mt-8 border-t border-border pt-6"
          >
            <h2 id="terms-of-service-title" className="text-xl font-semibold">
              {TERMS_OF_SERVICE.title}
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {TERMS_OF_SERVICE.notice}
            </p>
          </section>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button" size="touch" onClick={handleGoBack}>
              {canGoBack ? 'Go back' : 'Go home'}
            </Button>
            <Button asChild size="touch" variant="outline">
              <Link to="/catalog">Browse catalog</Link>
            </Button>
          </div>
        </section>
      </div>
    </LayoutPage>
  );
};

export default Terms;
