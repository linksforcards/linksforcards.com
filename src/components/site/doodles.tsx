type MarkProps = { className?: string };

const shared = {
  "aria-hidden": true as const,
  focusable: "false" as const,
};

export function BinderMark({ className }: MarkProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" {...shared}>
      <path
        d="M18 8h34c3 0 6 3 6 6v38c0 3-3 6-6 6H18c-2 0-4-2-4-5V13c0-3 2-5 4-5z"
        fill="#fffdf8"
        stroke="#1b2430"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 14c-2 1-4 3-4 6v28c0 3 2 6 5 6"
        fill="none"
        stroke="#1b2430"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M16 16v34" fill="none" stroke="#6d8cff" strokeWidth="5" strokeLinecap="round" />
      <path d="M28 22h18M28 32h16M28 42h18" fill="none" stroke="#1b2430" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 18l1.4 3.2 3.4.3-2.6 2.2.8 3.3-3-1.8-3 1.8.8-3.3-2.6-2.2 3.4-.3z" fill="#ffe08a" stroke="#1b2430" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function DoodleCluster({ className }: MarkProps) {
  return (
    <div className={className ? `doodles ${className}` : "doodles"} aria-hidden="true">
      <svg className="doodle doodle-star" viewBox="0 0 64 64" {...shared}>
        <path
          d="M32 5l6.4 16.8 17.6.8-13.6 11.6 4.6 17.2L32 42.4 17 51.4l4.6-17.2L8 22.6l17.6-.8z"
          fill="#ffe08a"
          stroke="#1b2430"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="doodle doodle-spark" viewBox="0 0 64 64" {...shared}>
        <path
          d="M32 6l4 16 16 4-16 5-4 17-5-17-16-5 16-4z"
          fill="#ff8b6a"
          stroke="#1b2430"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="doodle doodle-binder" viewBox="0 0 64 64" {...shared}>
        <path
          d="M16 10h34c3 0 5 2 5 5v36c0 3-2 6-5 6H16c-2 0-4-2-4-5V15c0-3 2-5 4-5z"
          fill="#fffdf8"
          stroke="#1b2430"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M14 14v38" fill="none" stroke="#6d8cff" strokeWidth="5" strokeLinecap="round" />
        <path d="M26 24h20M26 34h16M26 44h20" fill="none" stroke="#1b2430" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg className="doodle doodle-bubble" viewBox="0 0 64 64" {...shared}>
        <path
          d="M10 12h38c4 0 8 3 8 8v14c0 5-4 8-8 8H28l-8 12 1-12H10c-4 0-8-3-8-8V20c0-5 4-8 8-8z"
          fill="#d7f0ff"
          stroke="#1b2430"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
