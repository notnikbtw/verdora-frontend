export const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
