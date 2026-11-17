import { Component, createRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { CircleAlert, RotateCcw } from 'lucide-react';
import { Button } from '@components/ui/button';

type Props = {
  children: ReactNode;
  resetKey: string;
};

type State = {
  hasError: boolean;
  resetKey: string;
};

class PageBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: this.props.resetKey };
  private heading = createRef<HTMLHeadingElement>();

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.resetKey !== state.resetKey) {
      return { hasError: false, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch() {
    this.heading.current?.focus();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
        <section
          aria-labelledby="page-error-title"
          className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-10"
        >
          <CircleAlert
            aria-hidden="true"
            className="mx-auto size-12 text-primary"
          />
          <h1
            ref={this.heading}
            id="page-error-title"
            tabIndex={-1}
            className="mt-5 text-2xl font-bold text-foreground outline-none"
          >
            Unable to load this page
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            A connection issue or a recent site update may have interrupted
            loading. Check your connection and reload the page to try again.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              size="touch"
              onClick={() => window.location.reload()}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Reload page
            </Button>
            <Button asChild variant="outline" size="touch">
              <a href={import.meta.env.BASE_URL}>Go home</a>
            </Button>
          </div>
        </section>
      </main>
    );
  }
}

const PageErrorBoundary = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return <PageBoundary resetKey={location.key}>{children}</PageBoundary>;
};

export default PageErrorBoundary;
