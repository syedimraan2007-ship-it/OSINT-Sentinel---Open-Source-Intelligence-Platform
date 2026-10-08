import React from 'react';

/**
 * RGMCET (Rajeev Gandhi Memorial College of Engineering & Technology) Logo
 * Authentic vector recreation of the official institutional emblem
 */
export const RgmcetLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="RGMCET Logo"
    >
      <defs>
        {/* Shield background gradient */}
        <linearGradient id="shieldGrad" x1="100" y1="20" x2="100" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA000" />
          <stop offset="35%" stopColor="#FFD54F" />
          <stop offset="70%" stopColor="#FF7043" />
          <stop offset="100%" stopColor="#E64A19" />
        </linearGradient>
        {/* Gold border gradient */}
        <linearGradient id="goldBorder" x1="50" y1="20" x2="150" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
      </defs>

      {/* Main Shield Crest */}
      <path
        d="M 50,22 C 75,32 100,20 100,20 C 100,20 125,32 150,22 C 158,55 158,105 100,146 C 42,105 42,55 50,22 Z"
        fill="url(#shieldGrad)"
        stroke="url(#goldBorder)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Inner Shield outline */}
      <path
        d="M 55,27 C 77,35 100,26 100,26 C 100,26 123,35 145,27 C 151,56 151,100 100,138 C 49,100 49,56 55,27 Z"
        fill="none"
        stroke="#800000"
        strokeWidth="1.5"
      />

      {/* Blue Gear / Cog Wheel */}
      <g transform="translate(100, 78)">
        <path
          d="M -6,-36 L 6,-36 L 8,-28 L 18,-25 L 25,-31 L 33,-23 L 27,-16 L 30,-6 L 38,-4 L 38,8 L 30,10 L 27,20 L 33,27 L 25,35 L 18,29 L 8,32 L 6,40 L -6,40 L -8,32 L -18,29 L -25,35 L -33,27 L -27,20 L -30,10 L -38,8 L -38,-4 L -30,-6 L -27,-16 L -33,-23 L -25,-31 L -18,-25 L -8,-28 Z"
          fill="#1A237E"
          stroke="#0D47A1"
          strokeWidth="1"
        />
        {/* Yellow Center Core */}
        <circle cx="0" cy="0" r="23" fill="#FFF176" stroke="#0D47A1" strokeWidth="2.5" />

        {/* Lightning bolt / 'R' emblem in Red */}
        <path
          d="M -15,-15 L 20,-11 L -2,4 L 18,17 L -10,13 L -10,3 L -15,3 Z"
          fill="#D50000"
        />
        <path
          d="M -16,-16 L -10,-16 L -10,14 L -16,14 Z"
          fill="#D50000"
        />

        {/* Desktop PC Monitor in center */}
        <g transform="translate(-11, 4)">
          <rect x="0" y="0" width="22" height="17" rx="2" fill="#E0E0E0" stroke="#424242" strokeWidth="1.2" />
          <rect x="2.5" y="2" width="17" height="11" rx="1" fill="#212121" />
          <path d="M 7,17 L 15,17 L 17,21 L 5,21 Z" fill="#9E9E9E" stroke="#424242" strokeWidth="1" />
        </g>
      </g>

      {/* Ribbon Banner at bottom */}
      <g transform="translate(0, 13)">
        {/* Ribbon folds left/right */}
        <path d="M 28,142 L 48,136 L 48,154 L 28,160 L 38,151 Z" fill="#FFF9C4" stroke="#222222" strokeWidth="1.2" />
        <path d="M 172,142 L 152,136 L 152,154 L 172,160 L 162,151 Z" fill="#FFF9C4" stroke="#222222" strokeWidth="1.2" />
        
        {/* Center Ribbon body */}
        <path
          d="M 42,138 C 70,148 130,148 158,138 L 150,158 C 125,166 75,166 50,158 Z"
          fill="#FFFDE7"
          stroke="#222222"
          strokeWidth="1.5"
        />
        {/* Ribbon text: EDUCATION FOR PEACE */}
        <path id="ribbonTextPath" d="M 46,155 C 80,165 120,165 154,155" fill="none" />
        <text
          fill="#D50000"
          fontSize="8.5"
          fontWeight="bold"
          letterSpacing="0.4"
          textAnchor="middle"
        >
          <textPath href="#ribbonTextPath" startOffset="50%">
            EDUCATION FOR PEACE
          </textPath>
        </text>
      </g>

      {/* ESTD-1995 bottom text */}
      <text
        x="100"
        y="190"
        fill="#111111"
        fontSize="12.5"
        fontWeight="800"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="0.8"
      >
        (ESTD-1995)
      </text>
    </svg>
  );
};

/**
 * SPARC Organization (Scientific Program for Academic Research Cube) Logo
 * Authentic circular emblem recreation with inner burst and typography
 */
export const SparcLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="SPARC Organization Logo"
    >
      <defs>
        {/* Curvature text paths */}
        {/* Top Arc for Organization Title */}
        <path
          id="sparcTopArc"
          d="M 32,100 A 68,68 0 1,1 168,100"
          fill="none"
        />
        {/* Bottom Arc for Subtitle */}
        <path
          id="sparcBottomArc"
          d="M 166,105 A 68,68 0 0,1 34,105"
          fill="none"
        />
      </defs>

      {/* Outer drop shadow / soft ring */}
      <circle cx="100" cy="100" r="95" fill="#FFFFFF" stroke="#222222" strokeWidth="5.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#222222" strokeWidth="1.5" />

      {/* Inner White Field */}
      <circle cx="100" cy="100" r="87" fill="#FBFBFB" />

      {/* Red Dotted Ring */}
      <circle
        cx="100"
        cy="100"
        r="68"
        fill="none"
        stroke="#C62828"
        strokeWidth="2.5"
        strokeDasharray="2.5 5"
      />

      {/* Top Arc Text */}
      <text
        fill="#111111"
        fontSize="7.8"
        fontWeight="800"
        fontFamily="sans-serif"
        letterSpacing="0.4"
      >
        <textPath href="#sparcTopArc" startOffset="50%" textAnchor="middle">
          SCIENTIFIC PROGRAM FOR ACADEMIC RESEARCH CUBE
        </textPath>
      </text>

      {/* Bottom Arc Text */}
      <text
        fill="#111111"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="sans-serif"
        letterSpacing="0.8"
      >
        <textPath href="#sparcBottomArc" startOffset="50%" textAnchor="middle">
          AWARENESS , EDUCATION , SERVICE
        </textPath>
      </text>

      {/* Center Lightbulb & Starburst Graphic */}
      <g transform="translate(100, 84)">
        {/* Starburst rays */}
        <path
          d="M 0,-30 L 4,-14 L 18,-24 L 10,-8 L 26,-10 L 13,3 L 26,12 L 10,9 L 16,24 L 3,12 L 0,26 L -3,12 L -16,24 L -10,9 L -26,12 L -13,3 L -26,-10 L -10,-8 L -18,-24 L -4,-14 Z"
          fill="#111111"
        />
        {/* Light Bulb Center */}
        <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
        <path
          d="M -7,2 C -7,7 -4,11 -3,14 L 3,14 C 4,11 7,7 7,2 Z"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="2.5"
        />
        {/* Bulb Base */}
        <rect x="-3" y="14" width="6" height="3" fill="#111111" />
        <rect x="-2" y="17" width="4" height="2" rx="1" fill="#111111" />
      </g>

      {/* SPARC Bold Text */}
      <text
        x="100"
        y="134"
        fill="#111111"
        fontSize="24"
        fontWeight="900"
        fontFamily="Georgia, serif"
        letterSpacing="2.5"
        textAnchor="middle"
      >
        SPARC
      </text>

      {/* Subtle dots beneath SPARC */}
      <circle cx="92" cy="144" r="1.5" fill="#C62828" />
      <circle cx="100" cy="144" r="1.5" fill="#111111" />
      <circle cx="108" cy="144" r="1.5" fill="#C62828" />
    </svg>
  );
};
