interface BrandNameProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandName({ size = 'md', className }: BrandNameProps) {
  return (
    <span className={['brand-name', `brand-name--${size}`, className].filter(Boolean).join(' ')}>
      <span className="brand-name-base">Crickdraft</span>
      <span className="brand-name-67" aria-label="6 T20 matches, 7 ODI matches">
        <span className="brand-six">6</span>
        <span className="brand-sep">-</span>
        <span className="brand-seven">7</span>
      </span>
    </span>
  );
}
