export type RiskLevel = 'LOW' | 'GUARDED' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type StatusType = 
  | 'Completed' 
  | 'In Progress' 
  | 'Needs Review' 
  | 'Failed' 
  | 'Unavailable' 
  | 'Potential Match';

export type ToolId = 
  | 'dashboard'
  | 'username'
  | 'email'
  | 'domain'
  | 'dns'
  | 'ip'
  | 'url'
  | 'website'
  | 'social'
  | 'metadata'
  | 'hash'
  | 'image'
  | 'investigation';

export interface ToolMeta {
  id: ToolId;
  name: string;
  description: string;
  category: 'Identity' | 'Network' | 'Web & Security' | 'Forensics' | 'Case File';
  accentColor: string; // #244A73, #2A7F7F, #3A7D44, #B7791F, #B23A3A, #665191
  colorName: 'Navy Blue' | 'Teal' | 'Green' | 'Amber' | 'Red' | 'Purple' | 'Blue';
}

export interface InvestigationFinding {
  id: string;
  timestamp: string;
  sourceTool: ToolId;
  target: string;
  type: string;
  title: string;
  risk: RiskLevel;
  status: StatusType;
  details: string;
  metadata?: Record<string, any>;
}

export interface InvestigationCase {
  id: string;
  title: string;
  leadInvestigator: string;
  institution: string;
  classification: 'UNCLASSIFIED / ACADEMIC' | 'RESTRICTED / FORENSIC' | 'CONFIDENTIAL';
  createdDate: string;
  summary: string;
  findings: InvestigationFinding[];
}

export interface DnsRecord {
  name: string;
  type: string;
  typeCode: number;
  TTL: number;
  data: string;
}

export interface IpAnalysisResult {
  ip: string;
  isPrivate: boolean;
  version: 'IPv4' | 'IPv6';
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  asn?: string;
  org?: string;
  isp?: string;
  timezone?: string;
  ptr?: string;
  risk: RiskLevel;
  riskReasons: string[];
}

export interface EmailAnalysisResult {
  email: string;
  localPart: string;
  domain: string;
  isValidSyntax: boolean;
  isDisposable: boolean;
  isFreeWebmail: boolean;
  isRoleAccount: boolean;
  mxRecordsFound: boolean;
  mxHosts: string[];
  gravatarExists: boolean;
  gravatarUrl?: string;
  dmarcConfigured: boolean;
  spfConfigured: boolean;
  risk: RiskLevel;
  riskScore: number;
  findings: string[];
}

export interface UrlPhishingResult {
  url: string;
  protocol: string;
  hostname: string;
  pathname: string;
  search: string;
  tld: string;
  isIpHost: boolean;
  isHomograph: boolean;
  homographDetails?: string;
  typosquatBrand?: string;
  isSuspiciousTld: boolean;
  hasCredentialKeywords: boolean;
  hasSuspiciousExtension: boolean;
  hasBase64Payload: boolean;
  subdomainCount: number;
  risk: RiskLevel;
  riskScore: number; // 0 - 100
  triggers: Array<{ title: string; risk: RiskLevel; description: string }>;
}
