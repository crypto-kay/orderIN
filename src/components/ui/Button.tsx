import React from 'react';
import { cn } from '../../utils/cn';
import { buttonVariants, type ButtonVariantsProps } from './buttonVariants';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantsProps {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        // prefer explicit passed type, otherwise default to "button" for safety
        type={props.type ?? (asChild ? undefined : 'button')}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

