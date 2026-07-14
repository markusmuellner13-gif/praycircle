export default function Logo({ size = 26, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={glow ? "splash-glow" : undefined}
      aria-hidden="true"
    >
      {/* circle of prayer */}
      <circle
        cx="32"
        cy="34"
        r="24"
        stroke="#e6b95c"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="112 40"
        transform="rotate(126 32 34)"
      />
      {/* candle flame */}
      <path
        d="M32 14c5.5 7.2 9 12.4 9 17.6 0 5.8-4 9.9-9 9.9s-9-4.1-9-9.9c0-5.2 3.5-10.4 9-17.6z"
        fill="#f2cd7d"
      />
      <path
        d="M32 24.5c2.6 3.5 4.3 6 4.3 8.5 0 2.9-1.9 4.9-4.3 4.9s-4.3-2-4.3-4.9c0-2.5 1.7-5 4.3-8.5z"
        fill="#1a2138"
      />
    </svg>
  );
}
