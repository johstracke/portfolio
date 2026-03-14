type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
};

const variants = {
  default: 'bg-ink text-white',
  primary: 'bg-primary text-ink',
  secondary: 'bg-secondary text-white',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-bold uppercase border-[2px] border-black ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
