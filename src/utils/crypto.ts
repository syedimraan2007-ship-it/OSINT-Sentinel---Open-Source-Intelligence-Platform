/**
 * Cryptographic and Hash Intelligence Utilities
 * Pure TypeScript MD5 implementation & WebCrypto API bindings
 */

// Pure TypeScript implementation of MD5 (RFC 1321)
export function md5(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const nblk = ((bytes.length + 8) >> 6) + 1;
  const blks = new Array(nblk * 16).fill(0);
  
  for (let i = 0; i < bytes.length; i++) {
    blks[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  blks[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  blks[nblk * 16 - 2] = bytes.length * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < blks.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, blks[i], 7, -680876936);
    d = md5ff(d, a, b, c, blks[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, blks[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, blks[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, blks[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, blks[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, blks[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, blks[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, blks[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, blks[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, blks[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, blks[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, blks[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, blks[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, blks[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, blks[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, blks[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, blks[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, blks[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, blks[i], 20, -373897302);
    a = md5gg(a, b, c, d, blks[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, blks[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, blks[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, blks[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, blks[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, blks[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, blks[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, blks[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, blks[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, blks[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, blks[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, blks[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, blks[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, blks[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, blks[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, blks[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, blks[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, blks[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, blks[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, blks[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, blks[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, blks[i], 11, -358537222);
    c = md5hh(c, d, a, b, blks[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, blks[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, blks[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, blks[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, blks[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, blks[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, blks[i], 6, -198630844);
    d = md5ii(d, a, b, c, blks[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, blks[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, blks[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, blks[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, blks[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, blks[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, blks[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, blks[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, blks[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, blks[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, blks[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, blks[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, blks[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, blks[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, blks[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexChars = '0123456789abcdef';
  let hex = '';
  for (const num of [a, b, c, d]) {
    for (let j = 0; j < 4; j++) {
      const byte = (num >>> (j * 8)) & 0xff;
      hex += hexChars.charAt((byte >>> 4) & 0x0f) + hexChars.charAt(byte & 0x0f);
    }
  }
  return hex;
}

/**
 * Computes WebCrypto SHA digest
 */
export async function computeSubtleHash(
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  data: string | ArrayBuffer
): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Identifies potential hash type based on format, length, and charset
 */
export function identifyHashType(hashRaw: string): {
  type: string;
  confidence: 'HIGH' | 'MEDIUM' | 'POSSIBLE';
  possibleAlgorithms: string[];
  bitLength: number;
  byteLength: number;
} {
  const hash = hashRaw.trim().toLowerCase();
  const isHex = /^[0-9a-f]+$/i.test(hash);

  if (!isHex) {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return {
        type: 'bcrypt',
        confidence: 'HIGH',
        possibleAlgorithms: ['bcrypt blowfish crypt'],
        bitLength: 192,
        byteLength: 60,
      };
    }
    return {
      type: 'Unknown Non-Hex Format',
      confidence: 'POSSIBLE',
      possibleAlgorithms: ['Base64 / Salted / Custom'],
      bitLength: hash.length * 8,
      byteLength: hash.length,
    };
  }

  const len = hash.length;
  switch (len) {
    case 8:
      return {
        type: 'CRC32 / Adler-32',
        confidence: 'HIGH',
        possibleAlgorithms: ['CRC32', 'Adler-32', 'FCS-32'],
        bitLength: 32,
        byteLength: 4,
      };
    case 32:
      return {
        type: 'MD5 / NTLM',
        confidence: 'HIGH',
        possibleAlgorithms: ['MD5', 'NTLM', 'MD4', 'RIPEMD-128'],
        bitLength: 128,
        byteLength: 16,
      };
    case 40:
      return {
        type: 'SHA-1',
        confidence: 'HIGH',
        possibleAlgorithms: ['SHA-1', 'RIPEMD-160', 'HAS-160'],
        bitLength: 160,
        byteLength: 20,
      };
    case 56:
      return {
        type: 'SHA-224 / SHA3-224',
        confidence: 'HIGH',
        possibleAlgorithms: ['SHA-224', 'SHA3-224'],
        bitLength: 224,
        byteLength: 28,
      };
    case 64:
      return {
        type: 'SHA-256',
        confidence: 'HIGH',
        possibleAlgorithms: ['SHA-256', 'SHA3-256', 'BLAKE2s-256', 'SM3'],
        bitLength: 256,
        byteLength: 32,
      };
    case 96:
      return {
        type: 'SHA-384 / SHA3-384',
        confidence: 'HIGH',
        possibleAlgorithms: ['SHA-384', 'SHA3-384'],
        bitLength: 384,
        byteLength: 48,
      };
    case 128:
      return {
        type: 'SHA-512',
        confidence: 'HIGH',
        possibleAlgorithms: ['SHA-512', 'SHA3-512', 'BLAKE2b-512', 'Whirlpool'],
        bitLength: 512,
        byteLength: 64,
      };
    default:
      return {
        type: `Uncommon Hex Length (${len} chars)`,
        confidence: 'POSSIBLE',
        possibleAlgorithms: ['Truncated Hash', 'Custom Digest'],
        bitLength: len * 4,
        byteLength: Math.floor(len / 2),
      };
  }
}

/**
 * Known Intelligence Database: Signatures for Academic/Threat Analysis
 */
export const KNOWN_THREAT_SIGNATURES: Record<
  string,
  {
    name: string;
    category: 'Malware / Exploit' | 'Test Artifact' | 'Known Benign System File' | 'Historical Threat';
    verdict: 'MALICIOUS' | 'SAFE / TEST' | 'BENIGN';
    description: string;
  }
> = {
  // EICAR Standard Anti-Virus Test File
  '44d88612fea8a8f36de82e1278abb02f': {
    name: 'EICAR Standard AV Test File',
    category: 'Test Artifact',
    verdict: 'SAFE / TEST',
    description: 'European Institute for Computer Antivirus Research standard test signature string for validation.',
  },
  '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f': {
    name: 'EICAR Test File (SHA-256)',
    category: 'Test Artifact',
    verdict: 'SAFE / TEST',
    description: 'Standard safe verification string for AV and EDR threat feeds.',
  },
  // WannaCry Ransomware dropper
  'ed01ebf83334a1f6d5290fda2bc7e955b34fbbe6': {
    name: 'WannaCry 2.0 Dropper Sample',
    category: 'Historical Threat',
    verdict: 'MALICIOUS',
    description: 'WannaCryptor / WanaCrypt0r 2.0 EternalBlue exploit payload.',
  },
  '24d004a104d4d54034dbc29c2f81fb077b36724da6e029efb36e0b0e5d850eee': {
    name: 'WannaCry Executable Binary',
    category: 'Historical Threat',
    verdict: 'MALICIOUS',
    description: 'Cryptographic ransom payload leveraging SMBv1 vulnerability CVE-2017-0144.',
  },
  // Locky Ransomware sample
  '7b6d9d40bfa1ae95e7c2e0b11568297b83907c13': {
    name: 'Locky Ransomware Variant',
    category: 'Malware / Exploit',
    verdict: 'MALICIOUS',
    description: 'Spearphishing Word document macro dropper hash.',
  },
  // Mirai Botnet loader
  'e2e858dbdf2a0c64897f2e1a2f6fb39e': {
    name: 'Mirai IoT Botnet ELF Binary',
    category: 'Malware / Exploit',
    verdict: 'MALICIOUS',
    description: 'Telnet brute-force IoT scanner and DDoS reflection bot.',
  },
  // Known Benign (empty string)
  'd41d8cd98f00b204e9800998ecf8427e': {
    name: 'Zero-byte Empty String (MD5)',
    category: 'Known Benign System File',
    verdict: 'BENIGN',
    description: 'Hash of 0 bytes / empty file.',
  },
  'da39a3ee5e6b4b0d3255bfef95601890afd80709': {
    name: 'Zero-byte Empty String (SHA-1)',
    category: 'Known Benign System File',
    verdict: 'BENIGN',
    description: 'Standard null SHA-1 digest.',
  },
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': {
    name: 'Zero-byte Empty String (SHA-256)',
    category: 'Known Benign System File',
    verdict: 'BENIGN',
    description: 'Standard null SHA-256 digest.',
  },
};

/**
 * Calculates Shannon Entropy for the hash string or file buffer
 */
export function calculateShannonEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const freq: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const ch = str[i];
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  for (const ch in freq) {
    const p = freq[ch] / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}
