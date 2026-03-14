import Link from 'next/link';

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
};

const baseClasses =
  'inline-flex items-center justify-center px-6 py-2 font-bold uppercase border-[3px] border-black shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none';

const variants = {
  primary: 'bg-primary text-ink',
  secondary: 'bg-secondary text-white',
  outline: 'bg-transparent text-ink',
};

export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  const isExternalHref = href?.startsWith('http');

  if (href) {
    if (isExternalHref) {
      return (
        <a href={href} className={classes} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
