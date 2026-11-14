import { Spinner } from '@components/ui/spinner';

const PageLoading = () => (
  <div
    role="status"
    className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background p-6 text-muted-foreground"
  >
    <Spinner aria-hidden="true" className="size-8 text-primary" />
    <span className="text-sm">Loading page…</span>
  </div>
);

export default PageLoading;
