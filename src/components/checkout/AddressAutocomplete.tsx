import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { cn } from '@/lib/utils';

type Option = { id: string; label: string };
type Props<T extends Option> = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  description: string;
  error?: string;
  options: T[];
  open: boolean;
  isSearching: boolean;
  searchFailed: boolean;
  searched: boolean;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  onSelect: (option: T) => void;
  onRetry: () => void;
};

const AddressAutocomplete = <T extends Option>({
  id,
  label,
  value,
  placeholder,
  description,
  error,
  options,
  open,
  isSearching,
  searchFailed,
  searched,
  disabled,
  onOpenChange,
  onChange,
  onSelect,
  onRetry,
}: Props<T>) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = `${id}-suggestions`;
  const showOptions =
    open && !isSearching && !searchFailed && options.length > 0;
  const active = Math.min(activeIndex, options.length - 1);
  const select = (option: T) => {
    onSelect(option);
    onOpenChange(false);
    setActiveIndex(-1);
  };

  return (
    <div
      className="min-w-0 space-y-2"
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget))
          onOpenChange(false);
      }}
    >
      <label htmlFor={id} className="text-base font-medium">
        {label}{' '}
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      </label>
      <Input
        id={id}
        name={id}
        role="combobox"
        required
        aria-required="true"
        autoComplete="off"
        spellCheck={false}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-expanded={showOptions}
        aria-autocomplete="list"
        aria-controls={showOptions ? listId : undefined}
        aria-activedescendant={
          showOptions && active >= 0 ? `${id}-option-${active}` : undefined
        }
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
        className="min-h-11 rounded-xl border-2 border-zinc-300 bg-block-bg text-base focus-visible:border-primary"
        onFocus={() => onOpenChange(true)}
        onChange={event => {
          onChange(event.target.value);
          setActiveIndex(-1);
          onOpenChange(true);
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            onOpenChange(false);
            setActiveIndex(-1);
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            onOpenChange(true);
            if (options.length)
              setActiveIndex(
                event.key === 'ArrowDown'
                  ? (active + 1) % options.length
                  : active <= 0
                    ? options.length - 1
                    : active - 1
              );
          }
          if (event.key === 'Enter' && showOptions) {
            event.preventDefault();
            if (active >= 0) select(options[active]);
          }
        }}
      />
      <p
        id={`${id}-hint`}
        className="text-xs leading-relaxed text-muted-foreground"
      >
        {description}
      </p>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {open && (
        <>
          {isSearching && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching…
            </p>
          )}
          {searchFailed && (
            <div role="status" className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Address search is unavailable. Check your connection and try
                again.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                Retry search
              </Button>
            </div>
          )}
          {!isSearching && !searchFailed && searched && !options.length && (
            <p role="status" className="text-sm text-muted-foreground">
              No results. Try another spelling or include the region.
            </p>
          )}
          {showOptions && (
            <ul
              id={listId}
              role="listbox"
              aria-label={`${label} suggestions`}
              className="max-h-60 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-sm"
            >
              {options.map((option, index) => (
                <li
                  key={option.id}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={active === index}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => select(option)}
                  className={cn(
                    'min-h-11 cursor-pointer rounded-lg px-3 py-2 text-sm wrap-anywhere hover:bg-accent',
                    active === index && 'bg-accent'
                  )}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default AddressAutocomplete;
