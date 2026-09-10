type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function PlanningIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  );
}

export function DesignIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5l-1.8 4.2-4.2 1.8 1.8-4.2 4.2-1.8z" />
    </svg>
  );
}

export function ImplementationIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <polyline points="9 8 4 12 9 16" />
      <polyline points="15 8 20 12 15 16" />
    </svg>
  );
}

export function TestingIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="10" r="6" />
      <line x1="15" y1="15" x2="20" y2="20" />
    </svg>
  );
}

export function SecurityIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export function DeploymentIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3v10" />
      <polyline points="8 7 12 3 16 7" />
      <path d="M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" />
    </svg>
  );
}

export function MaintenanceIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

export function GateCheckIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

export function GateFlagIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <line x1="6" y1="3" x2="6" y2="21" />
      <path d="M6 4h11l-3 4 3 4H6" />
    </svg>
  );
}

export function AttributionIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z" />
      <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
    </svg>
  );
}

export function AccountabilityIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7l-3 6a3 3 0 006 0l-3-6z" />
      <path d="M19 7l-3 6a3 3 0 006 0l-3-6z" />
      <path d="M9 21h6" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function LoopIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" />
      <polyline points="18 3 18 7 14 7" />
      <polyline points="6 21 6 17 10 17" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <line x1="12" y1="4" x2="12" y2="20" />
      <polyline points="7 15 12 20 17 15" />
    </svg>
  );
}

export type IconId =
  | "planning"
  | "design"
  | "implementation"
  | "testing"
  | "security"
  | "deployment"
  | "maintenance"
  | "gate-check"
  | "gate-flag"
  | "attribution"
  | "accountability";

export const iconMap: Record<IconId, (props: IconProps) => React.JSX.Element> = {
  planning: PlanningIcon,
  design: DesignIcon,
  implementation: ImplementationIcon,
  testing: TestingIcon,
  security: SecurityIcon,
  deployment: DeploymentIcon,
  maintenance: MaintenanceIcon,
  "gate-check": GateCheckIcon,
  "gate-flag": GateFlagIcon,
  attribution: AttributionIcon,
  accountability: AccountabilityIcon,
};
