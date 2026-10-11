import type { LucideIcon } from 'lucide-react';

const EmptyIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
    <Icon className="size-8 text-primary" aria-hidden="true" />
  </div>
);

export default EmptyIcon;
