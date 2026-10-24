const MARKS = [25, 50, 75, 100];

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="meter">
      <div
        className="bar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="badges" aria-hidden="true">
        {MARKS.map((mark) => (
          <svg key={mark} className={pct >= mark ? "badge on" : "badge"} viewBox="0 0 24 24">
            <path d="M12 2.2l2.4 6.2 6.6.4-5.1 4.3 1.7 6.4L12 16.2 6.4 19.5l1.7-6.4L3 8.8l6.6-.4z" />
          </svg>
        ))}
      </span>
    </div>
  );
}
