interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export function VerifiedBadge({
  size = 16,
  className = "",
}: VerifiedBadgeProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Verified"
      role="img"
      className={`inline-block flex-shrink-0 ${className}`}
      style={{ verticalAlign: "middle" }}
    >
      <circle cx="12" cy="12" r="12" fill="#1D9BF0" />
      <path
        d="M7 12.5l3.5 3.5 6.5-7"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
