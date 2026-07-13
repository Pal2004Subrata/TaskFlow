export default function Logo({ className = "h-10 w-auto" }) {
  return (
    <svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg" role="img" className={className}>
      <defs>
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap');
          .tf-word { font-family: 'Space Grotesk', 'Segoe UI', Arial, sans-serif; font-weight: 700; }
          .tf-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: 500; }
          `}
        </style>
      </defs>
      <g transform="translate(-145, -85)">
        <g transform="translate(150,90)">
          <rect x="0" y="0" width="72" height="72" rx="18" fill="#1B2333" />
          <rect x="18" y="42" width="10" height="18" rx="3" fill="#E2A63B" />
          <rect x="31" y="30" width="10" height="30" rx="3" fill="#F6F4EE" />
          <rect x="44" y="18" width="10" height="42" rx="3" fill="#2E8677" />
        </g>
        <text x="240" y="150" className="tf-word" fontSize="56" fill="#1B2333" letterSpacing="-1.5" fontWeight="800">Task<tspan fill="#E2A63B" fontStyle="italic" fontWeight="600">Flow</tspan></text>
        <path d="M 240 168 C 320 178, 400 178, 470 166 S 590 156, 660 168" fill="none" stroke="#E2A63B" strokeWidth="2.5" strokeLinecap="round" />
        <text x="150" y="215" className="tf-mono" fontSize="24" fill="#64708A" letterSpacing="1">WORK, IN MOTION</text>
      </g>
    </svg>
  );
}
