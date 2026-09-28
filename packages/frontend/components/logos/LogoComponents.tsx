import React from 'react';

export type LogoVariant = 'gold' | 'dark' | 'monochrome' | 'white' | 'slate';

export interface LogoProps {
  size?: number | string;
  variant?: LogoVariant;
  className?: string;
  showGrid?: boolean;
}

/**
 * CONCEPT 1: "The Kinetic Meridian" (Radial Stepped C-Aperture)
 * Direct Reference Inspiration:
 * - 'longshot finance.png' (curved fan of expanding radial stepped bars)
 * - 'nora finance.jfif' (high-contrast spoke aperture / clock rhythm)
 * - 'flowback.png' (concentric orbital track & central precision beacon)
 *
 * Metaphor:
 * A sweeping 270° radial sequence of precision bars forming a dynamic capital 'C'.
 * The bars start condensed at the origin (private raw off-chain ledger data) and
 * expand rhythmically in length and momentum around the curve to form the upper
 * aperture (uncollateralized institutional credit facility).
 */
export const LogoMeridian: React.FC<LogoProps> = ({
  size = 40,
  variant = 'gold',
  className = '',
  showGrid = false,
}) => {
  const gradientId = React.useId();

  const fills = {
    gold: {
      barStart: '#FDE68A',
      barMid: '#D4AF37',
      barEnd: '#A8792A',
      centerDot: '#FDE68A',
      orbitRing: 'rgba(212, 175, 55, 0.25)',
      grad1: `url(#${gradientId}-meridian-gold)`,
    },
    dark: {
      barStart: '#27272a',
      barMid: '#18181b',
      barEnd: '#09090b',
      centerDot: '#52525b',
      orbitRing: 'rgba(39, 39, 42, 0.3)',
      grad1: '#18181b',
    },
    monochrome: {
      barStart: '#000000',
      barMid: '#000000',
      barEnd: '#000000',
      centerDot: '#000000',
      orbitRing: 'rgba(0, 0, 0, 0.2)',
      grad1: '#000000',
    },
    white: {
      barStart: '#ffffff',
      barMid: '#f1f5f9',
      barEnd: '#cbd5e1',
      centerDot: '#ffffff',
      orbitRing: 'rgba(255, 255, 255, 0.25)',
      grad1: '#ffffff',
    },
    slate: {
      barStart: '#475569',
      barMid: '#334155',
      barEnd: '#1e293b',
      centerDot: '#64748b',
      orbitRing: 'rgba(71, 85, 105, 0.3)',
      grad1: '#334155',
    },
  }[variant];

  // 13 precision radial spoke bars arranged along the C-curve
  // Angles sweep from -40° (top right) around counterclockwise through 180° to 220° (bottom right)
  const spokes = [
    { angle: -38, length: 22, width: 6.8, rx: 3.4, dist: 24, opacity: 1.0 },
    { angle: -64, length: 20.5, width: 6.4, rx: 3.2, dist: 24, opacity: 0.96 },
    { angle: -90, length: 19, width: 6.0, rx: 3.0, dist: 24, opacity: 0.92 },
    { angle: -116, length: 17.5, width: 5.6, rx: 2.8, dist: 24, opacity: 0.88 },
    { angle: -142, length: 16, width: 5.2, rx: 2.6, dist: 24, opacity: 0.84 },
    { angle: -168, length: 15, width: 4.8, rx: 2.4, dist: 24, opacity: 0.80 },
    { angle: -194, length: 14, width: 4.5, rx: 2.2, dist: 24, opacity: 0.76 },
    { angle: -220, length: 13, width: 4.2, rx: 2.1, dist: 24, opacity: 0.72 },
    { angle: -246, length: 12.5, width: 3.9, rx: 1.9, dist: 24, opacity: 0.68 },
    { angle: -272, length: 12, width: 3.6, rx: 1.8, dist: 24, opacity: 0.64 },
    { angle: -298, length: 11.5, width: 3.3, rx: 1.6, dist: 24, opacity: 0.60 },
    { angle: -322, length: 11, width: 3.0, rx: 1.5, dist: 24, opacity: 0.55 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Credence Logo - The Kinetic Meridian"
    >
      <defs>
        <linearGradient
          id={`${gradientId}-meridian-gold`}
          x1="20"
          y1="10"
          x2="85"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="80%" stopColor="#B38528" />
          <stop offset="100%" stopColor="#785315" />
        </linearGradient>
      </defs>

      {/* Optional Construction Grid */}
      {showGrid && (
        <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="24" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <path d="M 50 50 L 85 22 M 50 50 L 85 78" />
        </g>
      )}

      {/* Central Precision Verification Beacon (The Truth Singularity - inspired by Flowback) */}
      <circle cx="50" cy="50" r="4.5" fill={fills.centerDot} />

      {/* Dynamic Expanding Radial Spokes forming the C */}
      <g>
        {spokes.map((spoke, idx) => (
          <rect
            key={idx}
            x={50 - spoke.width / 2}
            y={50 - spoke.dist - spoke.length}
            width={spoke.width}
            height={spoke.length}
            rx={spoke.rx}
            transform={`rotate(${spoke.angle} 50 50)`}
            fill={variant === 'gold' ? fills.grad1 : fills.barMid}
            opacity={variant === 'monochrome' ? 1 : spoke.opacity}
          />
        ))}
      </g>
    </svg>
  );
};

/**
 * CONCEPT 2: "The Sovereign Nexus" (Connected Vault Nodes & Verification Satellite)
 * Direct Reference Inspiration:
 * - 'refi hub.png' (organic connected nodes forming a curving C + detached satellite beacon)
 * - 'afterlife.png' (smooth rounded pill contours and negative space joints)
 * - 'flowback.png' (concentric focal point)
 *
 * Metaphor:
 * Multiple external financial vaults (Stripe, Brex, Mercury, on-chain reserves)
 * smoothly interconnected in a fluid, unified capital arc forming the letter 'C'.
 * The detached satellite orb represents the zkTLS cryptographic proof hovering
 * in perfect mathematical orbit: attesting to solvency without merging raw data.
 */
export const LogoNexus: React.FC<LogoProps> = ({
  size = 40,
  variant = 'gold',
  className = '',
  showGrid = false,
}) => {
  const gradientId = React.useId();

  const fills = {
    gold: {
      body: `url(#${gradientId}-nexus-body)`,
      satellite: `url(#${gradientId}-nexus-satellite)`,
      glow: 'rgba(212, 175, 55, 0.4)',
    },
    dark: {
      body: '#18181b',
      satellite: '#27272a',
      glow: 'rgba(24, 24, 27, 0.2)',
    },
    monochrome: {
      body: '#000000',
      satellite: '#000000',
      glow: 'none',
    },
    white: {
      body: '#ffffff',
      satellite: '#f8fafc',
      glow: 'rgba(255, 255, 255, 0.3)',
    },
    slate: {
      body: '#334155',
      satellite: '#475569',
      glow: 'rgba(51, 65, 85, 0.25)',
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Credence Logo - The Sovereign Nexus"
    >
      <defs>
        <linearGradient
          id={`${gradientId}-nexus-body`}
          x1="18"
          y1="18"
          x2="84"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#B38528" />
          <stop offset="100%" stopColor="#785315" />
        </linearGradient>
        <linearGradient
          id={`${gradientId}-nexus-satellite`}
          x1="62"
          y1="40"
          x2="78"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>

      {/* Optional Construction Grid */}
      {showGrid && (
        <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
          <circle cx="50" cy="50" r="42" />
          <circle cx="68" cy="24" r="10" />
          <circle cx="30" cy="32" r="12" />
          <circle cx="28" cy="68" r="12" />
          <circle cx="68" cy="76" r="10" />
          <circle cx="66" cy="50" r="7.5" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="0" y1="50" x2="100" y2="50" />
        </g>
      )}

      {/* Main Organic Connected C-Chain Body */}
      {/* Precision sculpted continuous contour connecting 4 vault nodes */}
      <path
        d="M 68 14 
           C 74 14 78 18 78 24 
           C 78 30 73 34 67 34 
           C 54 34 46 36 40 40 
           C 36 43 34 46 34 50 
           C 34 54 36 57 40 60 
           C 46 64 54 66 67 66 
           C 73 66 78 70 78 76 
           C 78 82 74 86 68 86 
           C 44 86 20 74 18 50 
           C 16 26 44 14 68 14 Z"
        fill={fills.body}
      />

      {/* Top Vault Terminal Pill Node Accent */}
      <circle cx="68" cy="24" r="7" fill={fills.body} />

      {/* Bottom Vault Terminal Pill Node Accent */}
      <circle cx="68" cy="76" r="7" fill={fills.body} />

      {/* Detached Verification Satellite Node (The zkTLS Proof Singularity - inspired by ReFi Hub) */}
      <circle
        cx="64"
        cy="50"
        r="8"
        fill={fills.satellite}
      />
    </svg>
  );
};

/**
 * CONCEPT 3: "The Proof Monolith" (Swiss Quadrant Matrix C)
 * Direct Reference Inspiration:
 * - 'latinum.png' (stark, unyielding Swiss geometric tile blocks with negative space)
 * - 'sim wars.png' (absolute reductionism, zero fluff)
 * - 'glass box protocol.png' (cryptographic transparency)
 *
 * Metaphor:
 * Four architectural monolith blocks arranged on a modernist modular grid.
 * Together they form a bold, unmistakable capital 'C' with an inner verification
 * negative-space aperture. It represents the unyielding certainty of corporate
 * balance sheets, audited collateral reserves, and institutional permanence.
 */
export const LogoMonolith: React.FC<LogoProps> = ({
  size = 40,
  variant = 'gold',
  className = '',
  showGrid = false,
}) => {
  const gradientId = React.useId();

  const fills = {
    gold: {
      primary: `url(#${gradientId}-monolith-gold)`,
      accent: `url(#${gradientId}-monolith-accent)`,
      dot: '#FDE68A',
    },
    dark: {
      primary: '#18181b',
      accent: '#27272a',
      dot: '#71717a',
    },
    monochrome: {
      primary: '#000000',
      accent: '#171717',
      dot: '#000000',
    },
    white: {
      primary: '#ffffff',
      accent: '#ffffff',
      dot: '#ffffff',
    },
    slate: {
      primary: '#1e293b',
      accent: '#334155',
      dot: '#64748b',
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Credence Logo - The Proof Monolith"
    >
      <defs>
        <linearGradient
          id={`${gradientId}-monolith-gold`}
          x1="16"
          y1="16"
          x2="84"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#B38528" />
          <stop offset="100%" stopColor="#785315" />
        </linearGradient>
        <linearGradient
          id={`${gradientId}-monolith-accent`}
          x1="52"
          y1="16"
          x2="84"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="60%" stopColor="#E5C158" />
          <stop offset="100%" stopColor="#A8792A" />
        </linearGradient>
      </defs>

      {/* Optional Construction Grid */}
      {showGrid && (
        <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
          <rect x="16" y="16" width="68" height="68" fill="none" />
          <line x1="48" y1="16" x2="48" y2="84" />
          <line x1="16" y1="48" x2="84" y2="48" />
          <line x1="16" y1="16" x2="84" y2="84" />
        </g>
      )}

      {/* Monolith Block 1: Top Right Lintel Plate (Upper C arm) */}
      <rect
        x="50"
        y="16"
        width="34"
        height="18"
        rx="4"
        fill={fills.accent}
      />

      {/* Monolith Block 2: Top Left Corner Anchor */}
      <rect
        x="16"
        y="16"
        width="28"
        height="18"
        rx="4"
        fill={fills.primary}
      />

      {/* Monolith Block 3: Vertical Central Spine Column */}
      <rect
        x="16"
        y="38"
        width="28"
        height="24"
        rx="4"
        fill={fills.primary}
      />

      {/* Monolith Block 4: Bottom Left Foundation Corner */}
      <rect
        x="16"
        y="66"
        width="28"
        height="18"
        rx="4"
        fill={fills.primary}
      />

      {/* Monolith Block 5: Bottom Right Foundation Bar (Lower C arm) */}
      <rect
        x="50"
        y="66"
        width="34"
        height="18"
        rx="4"
        fill={fills.primary}
      />

      {/* Deliberate Pure Negative Space in Center Right (x=48-84, y=38-62) */}
    </svg>
  );
};

/**
 * LEGACY CONCEPTS (Kept for versatility):
 * - LogoVault (Concept 1 originally)
 * - LogoPrism (Concept 2 originally)
 * - LogoKeystone (Concept 3 originally)
 */
export const LogoVault: React.FC<LogoProps> = ({
  size = 40,
  variant = 'gold',
  className = '',
  showGrid = false,
}) => {
  const gradientId = React.useId();
  const fills = {
    gold: {
      primary: `url(#${gradientId}-gold1)`,
      secondary: `url(#${gradientId}-gold2)`,
      core: '#D4AF37',
    },
    dark: {
      primary: '#1c1917',
      secondary: '#44403c',
      core: '#1c1917',
    },
    monochrome: {
      primary: '#000000',
      secondary: '#262626',
      core: '#000000',
    },
    white: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      core: '#ffffff',
    },
    slate: {
      primary: '#334155',
      secondary: '#64748b',
      core: '#0f172a',
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Credence Logo - The C-Vault"
    >
      <defs>
        <linearGradient id={`${gradientId}-gold1`} x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="25%" stopColor="#D4AF37" />
          <stop offset="65%" stopColor="#A8792A" />
          <stop offset="100%" stopColor="#785315" />
        </linearGradient>
        <linearGradient id={`${gradientId}-gold2`} x1="85" y1="20" x2="25" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#E5C158" />
          <stop offset="80%" stopColor="#B38F38" />
          <stop offset="100%" stopColor="#5E3F0F" />
        </linearGradient>
      </defs>
      {showGrid && (
        <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
          <circle cx="50" cy="50" r="42" />
          <circle cx="50" cy="50" r="28" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="50" y1="0" x2="50" y2="100" />
        </g>
      )}
      <path
        d="M 68 20 C 44 14 20 28 16 50 C 12 72 28 86 52 86 C 68 86 78 78 84 68 C 76 68 70 73 54 73 C 38 73 28 62 30 50 C 32 38 42 27 60 27 C 72 27 78 32 84 38 L 84 20 C 79 19 74 19 68 20 Z"
        fill={fills.primary}
      />
      <path
        d="M 50 34 C 41.16 34 34 41.16 34 50 C 34 58.84 41.16 66 50 66 C 58.84 66 66 58.84 66 50 C 66 45 63 41 59 38 L 59 46 C 60.5 47 61 48.5 61 50 C 61 56.08 56.08 61 50 61 C 43.92 61 39 56.08 39 50 C 39 43.92 43.92 39 50 39 C 55 39 58 41 60 43 L 64 39 C 60 36 55.5 34 50 34 Z"
        fill={fills.secondary}
      />
      <polygon points="50,45 54,50 50,55 46,50" fill={fills.core} />
    </svg>
  );
};

export const LogoPrism: React.FC<LogoProps> = ({
  size = 40,
  variant = 'gold',
  className = '',
  showGrid = false,
}) => {
  const gradientId = React.useId();
  const fills = {
    gold: {
      arcTop: `url(#${gradientId}-arc1)`,
      arcBottom: `url(#${gradientId}-arc2)`,
      center: '#FDE68A',
    },
    dark: {
      arcTop: '#18181b',
      arcBottom: '#3f3f46',
      center: '#18181b',
    },
    monochrome: {
      arcTop: '#000000',
      arcBottom: '#404040',
      center: '#000000',
    },
    white: {
      arcTop: '#ffffff',
      arcBottom: '#cbd5e1',
      center: '#ffffff',
    },
    slate: {
      arcTop: '#1e293b',
      arcBottom: '#475569',
      center: '#0f172a',
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Credence Logo - The Proof Horizon"
    >
      <defs>
        <linearGradient id={`${gradientId}-arc1`} x1="20" y1="10" x2="85" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A611B" />
        </linearGradient>
        <linearGradient id={`${gradientId}-arc2`} x1="85" y1="55" x2="20" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A611B" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#F5D77F" />
        </linearGradient>
      </defs>
      {showGrid && (
        <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="26" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="50" y1="0" x2="50" y2="100" />
        </g>
      )}
      <path
        d="M 76 16 C 50 10 24 22 16 48 C 22 48 30 45 42 37 C 54 29 66 26 76 26 L 82 16 Z"
        fill={fills.arcTop}
      />
      <path
        d="M 16 48 C 14 54 14 58 16 64 C 22 84 46 92 74 86 L 82 76 C 70 76 56 74 44 67 C 32 60 22 56 16 48 Z"
        fill={fills.arcBottom}
      />
      <path d="M 44 38 L 62 50 L 44 62 L 36 50 Z" fill={fills.arcTop} opacity="0.9" />
      <circle cx="68" cy="50" r="4.5" fill={fills.center} />
      <circle cx="79" cy="50" r="2" fill={fills.center} opacity="0.6" />
    </svg>
  );
};

export const LogoKeystone: React.FC<LogoProps> = ({
  size = 40,
  variant = 'gold',
  className = '',
  showGrid = false,
}) => {
  const gradientId = React.useId();
  const fills = {
    gold: {
      left: `url(#${gradientId}-shield-l)`,
      right: `url(#${gradientId}-shield-r)`,
      top: `url(#${gradientId}-shield-t)`,
      core: '#D4AF37',
    },
    dark: {
      left: '#1e1b18',
      right: '#3d3834',
      top: '#282420',
      core: '#1e1b18',
    },
    monochrome: {
      left: '#000000',
      right: '#333333',
      top: '#1a1a1a',
      core: '#000000',
    },
    white: {
      left: '#ffffff',
      right: '#cbd5e1',
      top: '#f1f5f9',
      core: '#ffffff',
    },
    slate: {
      left: '#0f172a',
      right: '#334155',
      top: '#1e293b',
      core: '#0f172a',
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Credence Logo - The Keystone Veritas"
    >
      <defs>
        <linearGradient id={`${gradientId}-shield-l`} x1="15" y1="15" x2="45" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5D77F" />
          <stop offset="50%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#7E5918" />
        </linearGradient>
        <linearGradient id={`${gradientId}-shield-r`} x1="85" y1="85" x2="45" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A611B" />
          <stop offset="60%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#FDF2B8" />
        </linearGradient>
        <linearGradient id={`${gradientId}-shield-t`} x1="30" y1="10" x2="85" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDF2B8" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#A8792A" />
        </linearGradient>
      </defs>
      {showGrid && (
        <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
          <polygon points="50,8 88,26 88,68 50,92 12,68 12,26" />
          <line x1="50" y1="8" x2="50" y2="92" />
          <line x1="12" y1="50" x2="88" y2="50" />
        </g>
      )}
      <path d="M 50 14 L 82 26 L 68 37 L 46 29 Z" fill={fills.top} />
      <path
        d="M 50 14 L 46 29 L 26 36 C 24 45 24 55 26 64 L 46 71 L 50 86 C 26 80 14 62 14 50 C 14 38 26 20 50 14 Z"
        fill={fills.left}
      />
      <path d="M 50 86 L 46 71 L 68 63 L 82 74 C 72 82 61 85 50 86 Z" fill={fills.right} />
      <polygon points="50,33 66,41 62,59 50,67 42,55" fill={fills.left} opacity="0.85" />
      <polygon points="50,42 56,47 54,55 50,58 46,53" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
};
