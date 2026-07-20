interface DesktopOnlyGateProps {
  children: React.ReactNode;
  homeHref?: string;
}

/**
 * Kept as a compatibility boundary for the workspace. The refreshed layout now
 * adapts to smaller screens, so learners can continue without an interstitial.
 */
export function DesktopOnlyGate({ children }: DesktopOnlyGateProps) {
  return <>{children}</>;
}
