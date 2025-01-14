
import {ButtonHTMLAttributes, FC, ReactNode} from 'react'; import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-2 font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2 flex items-center justify-center',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-th-primary text-th-background hover:bg-th-primary-dark',
    secondary: 'bg-th-secondary text-th-foreground hover:bg-th-secondary-dark',
    outline:
      'border border-th-primary text-th-primary bg-transparent hover:bg-th-primary hover:text-th-background',
    ghost:
      'bg-transparent text-th-primary hover:bg-white/10 hover:text-th-foreground',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
