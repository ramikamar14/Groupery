interface Props {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${done ? "bg-gold-500 text-white" : active ? "bg-navy-900 text-white ring-2 ring-gold-400 ring-offset-1" : "bg-gray-200 text-gray-500"}`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-navy-900" : done ? "text-gold-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${done ? "bg-gold-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
