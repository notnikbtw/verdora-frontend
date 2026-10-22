import type { TextFieldType } from '@/types/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@components/ui/input-group';
import type React from 'react';
import { Field, FieldDescription, FieldLabel } from '@components/ui/field';
import { cn } from '@/lib/utils';

type Props = {
  type: TextFieldType;
  label?: string;
  labelRight?: React.ReactNode;
  id?: string;
  description?: string;
  placeholder?: string;
  value: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
};

const TextField = ({
  type,
  label,
  labelRight,
  id,
  description,
  placeholder,
  value,
  error,
  className,
  inputClassName,
  labelClassName,
  containerClassName,
  disabled,
  onChange,
  onBlur,
  leftIcon,
  rightIcon,
  onRightIconClick,
}: Props) => {
  return (
    <Field className={className}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <FieldLabel
              className={cn(
                'font-sans text-base text-secondary-foreground',
                labelClassName
              )}
              htmlFor={id}
            >
              {label}
            </FieldLabel>
          )}
          {labelRight}
        </div>
      )}
      <InputGroup
        className={cn(
          `group relative w-full rounded-[12px] border-2 border-zinc-300 bg-block-bg
          transition-all duration-100 ease-in-out
          hover:border-primary
          focus-within:border-primary!
          has-[[data-slot=input-group-control]:focus-visible]:ring-0

          [&_svg]:text-zinc-400
          [&_svg]:transition-colors
          group-hover:[&_svg]:text-primary
          focus-within:[&_svg]:text-primary!`,
          error &&
            `border-red-500 focus-within:border-red-500!
            [&_svg]:text-red-500! focus-within:[&_svg]:text-red-500!`,
          disabled &&
            'opacity-60 cursor-not-allowed bg-zinc-100/80 hover:border-zinc-300 [&_svg]:text-zinc-400',
          containerClassName
        )}
      >
        <InputGroupInput
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={e => onChange?.(e.target.value)}
          onBlur={onBlur}
          className={cn(
            `text-sm text-[#70826E] font-sans
            focus:outline-none focus-visible:outline-none focus-visible:ring-0
            placeholder:text-sm
            placeholder:[font-family:var(--font-sans)]
            placeholder:text-text-muted`,
            disabled && 'cursor-not-allowed text-zinc-500',
            error && 'placeholder:text-red-400 text-red-400',
            inputClassName
          )}
        />
        {leftIcon && <InputGroupAddon>{leftIcon}</InputGroupAddon>}
        {rightIcon && (
          <InputGroupAddon
            align="inline-end"
            onClick={onRightIconClick}
            className={onRightIconClick ? 'cursor-pointer' : ''}
          >
            {rightIcon}
          </InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </Field>
  );
};

export default TextField;
