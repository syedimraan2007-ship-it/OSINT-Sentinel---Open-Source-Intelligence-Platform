# OSINT SENTINEL — Open Source Intelligence Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Institution](https://img.shields.io/badge/Institution-RGMCET%20%7C%20SPARC-244A73)](https://rgmcet.edu.in/)

> **OSINT SENTINEL** is a minimal, academic, institutional Open Source Intelligence (OSINT) platform engineered for digital investigations, network reconnaissance, forensic attribution, and verifiable threat analysis.

Developed under the joint academic purview of:
- **SPARC Organization** (*Scientific Program for Academic Research Cube*) — *Awareness • Education • Service*
- **RGMCET** (*Rajeev Gandhi Memorial College of Engineering and Technology*, ESTD-1995) — *Education for Peace*

---

## 🏛️ Institutional Overview

OSINT Sentinel adheres to scientific research standards:
- **Clean Academic Visual Architecture**: Strictly minimal white surface (`#FFFFFF`), neutral borders (`#E1E5E9`), and high-contrast institutional typography powered by Inter and JetBrains Mono.
- **Zero-Gimmick Design**: Free of dark mode cyberpunk cliches, glowing borders, or arbitrary animations.
- **Color-as-Information**: A rigorous 6-color semantic system where color signifies risk, technical verified states, and analytical classification.
- **Client-Side Privacy & OPSEC**: Analysis runs directly within the browser leveraging public standards (DNS-over-HTTPS, Web Crypto API, binary EXIF extraction) without tracking or third-party ad telemetry.

---

## 🔍 Core OSINT Modules

The platform includes **11 specialized forensic modules** and a centralized **Investigation Case Dossier**:

| Module | Identity Color | Primary Forensic Function |
|---|---|---|
| **Username Intelligence** | Navy Blue `#244A73` | Cross-platform namespace enumeration across 25+ services (GitHub, Dev.to, Reddit, X, etc.) with real API verification. |
| **Email Intelligence** | Teal `#2A7F7F` | RFC-5322 syntax validation, disposable/burner domain detection, live DNS MX routing, SPF/DMARC status, and Gravatar hash profile lookup. |
| **Domain Intelligence** | Navy Blue `#244A73` | Authoritative DNS resolution (A, AAAA, MX, TXT, NS, SOA) via Google/Cloudflare DoH and automated common subdomain discovery. |
| **DNS Intelligence** | Teal `#2A7F7F` | Zone telemetry audit, SPF mechanism analysis (`-all` HardFail vs `~all` SoftFail), and DMARC enforcement inspection (`p=reject/quarantine`). |
| **IP Intelligence** | Navy Blue `#244A73` | IPv4/IPv6 classification, RFC-1918 bogon detection, ASN and ISP routing, reverse DNS (PTR), and OpenStreetMap geographic coordinates. |
| **URL / Phishing Intelligence** | Red `#B23A3A` | RFC-3986 structural deconstruction, IDN homoglyph spoofing checks (Cyrillic lookalikes), Levenshtein typosquatting detection, and credential harvesting lures. |
| **Website Intelligence** | Navy Blue `#244A73` | HTTP defense headers audit (HSTS, CSP, X-Frame-Options, Referrer-Policy), robots.txt / sitemap.xml endpoints, and security scoring. |
| **Social Profile Intelligence** | Purple `#665191` | Algorithmic username variation generation, alias permutation matrix, and cross-network persona footprint mapping. |
| **Metadata Intelligence** | Purple `#665191` | Pure client-side binary EXIF/XMP parsing from ArrayBuffer, camera hardware tags, GPS telemetry with map links, and an OPSEC metadata-stripping export utility. |
| **Hash Intelligence** | Green `#3A7D44` | Automatic hash format identification, real-time client-side digest generation (MD5, SHA-1, SHA-256, SHA-512 via WebCrypto), Shannon entropy computation, and signature matching (EICAR, WannaCry, Locky). |
| **Image Intelligence** | Amber `#B7791F` | 256-level RGB color histogram canvas rendering, client-side Error Level Analysis (ELA) compression residual preview, and reverse search query pivots. |

---

## 📁 Academic Case Dossier & Report Export

All analytical tools include a **"Log Artifact"** or **"Log to Dossier"** button to catalog discoveries into the active case:
- **Evidence Chain of Custody**: Itemized discovery logs with source tool, target indicator, risk classification, and UTC timestamp.
- **Risk Matrix**: Dynamic distribution across `[ LOW ]`, `[ GUARDED ]`, `[ MEDIUM ]`, `[ HIGH ]`, and `[ CRITICAL ]`.
- **Export Capabilities**:
  - **Printable Academic Report**: Optimized `@media print` layout featuring official RGMCET and SPARC seals, executive summary, and investigator signature block.
  - **Markdown Export (`.md`)**: Ready for inclusion in academic publications and laboratory notes.
  - **JSON Export (`.json`)**: Machine-readable format for ingestion into SIEM or external case management systems.

---

## 🎨 Controlled Visual Design System

### Color Palette

The interface is built with deliberate color discipline:

- **Application Background**: `#FFFFFF` (White)
- **Secondary Background**: `#F8F9FA`
- **Cards**: `#FFFFFF` with `border: 1px solid #E1E5E9`, `border-radius: 6px`, no heavy drop shadows.
- **Text**: `#222222` (Primary) / `#626B73` (Secondary)

**Accent Colors (Used as Accents Only):**
1. **Navy Blue (`#244A73`)**: Primary actions, active navigation, identity headers.
2. **Teal (`#2A7F7F`)**: Information states, verified findings, DNS/Email indicators.
3. **Green (`#3A7D44`)**: Low-risk findings, successful checks, completed verification.
4. **Amber (`#B7791F`)**: Medium-risk alerts, image forensics, needs-review states.
5. **Red (`#B23A3A`)**: High-risk findings, critical alerts, phishing indicators.
6. **Purple (`#665191`)**: Metadata / EXIF forensics, persona correlation.
7. **Dark Red (`#8B1E1E`)**: Critical risk.

### Risk System
- `[ LOW ]`: Subtle green tint `#F2F7F3` with `#3A7D44` text.
- `[ GUARDED ]`: Subtle teal tint `#F0F7F7` with `#2A7F7F` text.
- `[ MEDIUM ]`: Subtle amber tint `#FDF7EB` with `#B7791F` text.
- `[ HIGH ]`: Subtle red tint `#FDF2F2` with `#B23A3A` text.
- `[ CRITICAL ]`: Subtle dark red tint `#FAEDED` with `#8B1E1E` text.

### Startup Animation
- 2.0–2.3 second institutional introduction featuring RGMCET and SPARC logos and soft, moving color fields at low opacity (8–12%).
- Smoothly dissolves to pure `#FFFFFF`. Once the dashboard appears, **all background effects are permanently stopped**.
- Fully accessible: automatically skipped when `prefers-reduced-motion` is enabled.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (SPA)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";`)
- **Build Tool**: Vite 8
- **Typography**: Inter (UI) & JetBrains Mono (Technical/Hashes/DNS)
- **Icons**: Lucide React
- **Cryptography**: Native Browser WebCrypto API (`crypto.subtle`) + pure TypeScript MD5
- **Network Resolution**: Standards-compliant DNS-over-HTTPS (Google & Cloudflare DoH APIs)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/osint-sentinel.git
   cd osint-sentinel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

### Production Build

To build the static production bundle:
```bash
npm run build
```
The optimized output will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

### Type Checking & Linting

```bash
npm run lint
```

---

## 📂 Project Structure

```
├── index.html                  # HTML entry point with metadata and Inter font
├── metadata.json               # AI Studio & applet metadata
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite configuration with Tailwind CSS v4
├── src/
│   ├── App.tsx                 # Root application container & case management
│   ├── index.css               # Base Tailwind CSS, root theme variables, print rules
│   ├── main.tsx                # React root mount
│   ├── types.ts                # TypeScript interfaces (RiskLevel, Status, Findings, etc.)
│   ├── components/
│   │   ├── Badges.tsx          # RiskBadge and StatusBadge components
│   │   ├── Dashboard.tsx       # Main workbench dashboard & quick dispatcher
│   │   ├── Header.tsx          # Institutional header with logos, UTC clock & navigation
│   │   ├── InvestigationView.tsx # Academic Case Dossier & printable report
│   │   ├── Logos.tsx           # Scalable vector graphics for RGMCET & SPARC
│   │   ├── StartupAnimation.tsx # 2.3s institutional introduction sequence
│   │   ├── ToolCard.tsx        # Standardized minimal white tool card
│   │   └── tools/
│   │       ├── DnsView.tsx     # DNS Intelligence & SPF/DMARC inspector
│   │       ├── DomainView.tsx  # Domain Intelligence & subdomain scanner
│   │       ├── EmailView.tsx   # Email Intelligence & Gravatar lookup
│   │       ├── HashView.tsx    # Hash Intelligence & WebCrypto digests
│   │       ├── ImageView.tsx   # Image Intelligence, RGB Histogram & ELA
│   │       ├── IpView.tsx      # IP Geolocation & ASN routing
│   │       ├── MetadataView.tsx# Binary EXIF extraction & OPSEC sanitizer
│   │       ├── SocialView.tsx  # Social persona correlation & permutations
│   │       ├── UrlPhishingView.tsx # URL deconstruction & phishing heuristics
│   │       ├── UsernameView.tsx# Cross-platform username enumeration
│   │       └── WebsiteView.tsx # HTTP security headers audit
│   └── utils/
│       ├── crypto.ts           # Pure TS MD5, WebCrypto digests, entropy & threat DB
│       ├── dns.ts              # DoH client, SPF parser, DMARC auditor
│       ├── emailChecker.ts     # RFC-5322 regex, disposable list, Gravatar API
│       ├── exifParser.ts       # Binary TIFF/EXIF/GPS parser & metadata stripper
│       ├── ip.ts               # IP geolocation, bogon filter, PTR lookup
│       ├── toolsConfig.ts      # Tools registry and color definitions
│       ├── urlPhishing.ts      # Homoglyph detection, typosquatting & lures
│       └── usernameChecker.ts  # Multi-platform namespace search definitions
```

---

## ⚖️ Academic Research Ethics & Disclaimer

OSINT Sentinel is intended strictly for:
- Academic cybersecurity research and pedagogy
- Authorized incident response and threat attribution
- Defensive reconnaissance and perimeter hygiene verification
- Digital forensics and educational laboratory environments

All queries utilize non-intrusive, publicly exposed protocols and open-source data. Users are responsible for adhering to applicable local laws, computer fraud regulations, and terms of service for external services.

---

## 📜 License

This project is licensed under the [Apache License 2.0](LICENSE) — see the LICENSE file for details.

---

## 🤝 Institutional Credits

- **SPARC Organization** (*Scientific Program for Academic Research Cube*)
- **Rajeev Gandhi Memorial College of Engineering & Technology** (Nandyal, Andhra Pradesh, India)
