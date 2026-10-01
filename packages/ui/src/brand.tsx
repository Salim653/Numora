export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`numora-brand${compact ? ' numora-brand-compact' : ''}`}>
      <img src="/figma/numora-owl-source.png" width="28" height="39" alt="" />
      <span>NUMORA</span>
    </span>
  );
}
