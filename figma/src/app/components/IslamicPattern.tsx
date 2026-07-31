export function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute opacity-5 ${className}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="islamic-pattern"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          {/* Geometric Islamic Star Pattern */}
          <g transform="translate(50, 50)">
            {/* 8-pointed star */}
            <path
              d="M 0,-30 L 8,-8 L 30,0 L 8,8 L 0,30 L -8,8 L -30,0 L -8,-8 Z"
              fill="currentColor"
              opacity="0.6"
            />
            {/* Inner square rotated */}
            <rect
              x="-10"
              y="-10"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              transform="rotate(22.5)"
            />
            {/* Outer decorative elements */}
            <circle cx="0" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  );
}
