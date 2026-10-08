/**
 * Pure TypeScript Client-side EXIF & Image Metadata Parser
 * Operates directly on ArrayBuffer in the browser without external libraries.
 */

export interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  artist?: string;
  copyright?: string;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  lensModel?: string;
  flash?: string;
  whiteBalance?: string;
  colorSpace?: string;
  imageWidth?: number;
  imageHeight?: number;
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    latString: string;
    lonString: string;
    mapUrl: string;
  };
  rawTags: Record<string, string | number>;
}

export function parseExifFromArrayBuffer(buffer: ArrayBuffer): ExifData | null {
  const dataView = new DataView(buffer);
  
  // Verify JPEG SOI marker 0xFFD8
  if (dataView.getUint16(0) !== 0xffd8) {
    return null;
  }

  let offset = 2;
  const length = buffer.byteLength;

  while (offset < length) {
    if (dataView.getUint8(offset) !== 0xff) break;
    const marker = dataView.getUint8(offset + 1);

    // APP1 marker 0xFFE1 (EXIF)
    if (marker === 0xe1) {
      const sectionLength = dataView.getUint16(offset + 2);
      const exifHeader = String.fromCharCode(
        dataView.getUint8(offset + 4),
        dataView.getUint8(offset + 5),
        dataView.getUint8(offset + 6),
        dataView.getUint8(offset + 7)
      );

      if (exifHeader === 'Exif') {
        const tiffOffset = offset + 10;
        return parseTiff(dataView, tiffOffset);
      }
      offset += 2 + sectionLength;
    } else if (marker === 0xda || marker === 0xd9) {
      // Start of scan or End of image
      break;
    } else {
      offset += 2 + dataView.getUint16(offset + 2);
    }
  }

  return null;
}

function parseTiff(dataView: DataView, tiffOffset: number): ExifData {
  const byteOrder = dataView.getUint16(tiffOffset);
  const isLittleEndian = byteOrder === 0x4949; // "II" = Little Endian, "MM" = Big Endian

  const ifd0Offset = dataView.getUint32(tiffOffset + 4, isLittleEndian);
  const rawTags: Record<string, string | number> = {};
  const exif: ExifData = { rawTags };

  let exifSubIfdOffset = 0;
  let gpsIfdOffset = 0;

  // Read IFD0
  const numEntries = dataView.getUint16(tiffOffset + ifd0Offset, isLittleEndian);
  for (let i = 0; i < numEntries; i++) {
    const entryOffset = tiffOffset + ifd0Offset + 2 + i * 12;
    const tag = dataView.getUint16(entryOffset, isLittleEndian);
    const type = dataView.getUint16(entryOffset + 2, isLittleEndian);
    const count = dataView.getUint32(entryOffset + 4, isLittleEndian);
    const valOffset = entryOffset + 8;

    const val = readTagValue(dataView, tiffOffset, tag, type, count, valOffset, isLittleEndian);

    if (tag === 0x010f) exif.make = String(val); // Make
    else if (tag === 0x0110) exif.model = String(val); // Model
    else if (tag === 0x0131) exif.software = String(val); // Software
    else if (tag === 0x0132) exif.dateTime = String(val); // DateTime
    else if (tag === 0x013b) exif.artist = String(val); // Artist
    else if (tag === 0x8298) exif.copyright = String(val); // Copyright
    else if (tag === 0x8769) exifSubIfdOffset = Number(val); // Exif IFD Pointer
    else if (tag === 0x8825) gpsIfdOffset = Number(val); // GPS IFD Pointer

    rawTags[`0x${tag.toString(16).toUpperCase().padStart(4, '0')}`] = val;
  }

  // Read ExifSubIFD if present
  if (exifSubIfdOffset > 0) {
    const subEntries = dataView.getUint16(tiffOffset + exifSubIfdOffset, isLittleEndian);
    for (let i = 0; i < subEntries; i++) {
      const entryOffset = tiffOffset + exifSubIfdOffset + 2 + i * 12;
      const tag = dataView.getUint16(entryOffset, isLittleEndian);
      const type = dataView.getUint16(entryOffset + 2, isLittleEndian);
      const count = dataView.getUint32(entryOffset + 4, isLittleEndian);
      const valOffset = entryOffset + 8;

      const val = readTagValue(dataView, tiffOffset, tag, type, count, valOffset, isLittleEndian);

      if (tag === 0x829a) exif.exposureTime = String(val); // Exposure Time
      else if (tag === 0x829d) exif.fNumber = Number(val); // FNumber
      else if (tag === 0x8827) exif.iso = Number(val); // ISO
      else if (tag === 0x920a) exif.focalLength = Number(val); // FocalLength
      else if (tag === 0xa434) exif.lensModel = String(val); // LensModel
      else if (tag === 0xa001) exif.colorSpace = Number(val) === 1 ? 'sRGB' : 'Uncalibrated';

      rawTags[`SubIFD_0x${tag.toString(16).toUpperCase().padStart(4, '0')}`] = val;
    }
  }

  // Read GPS IFD if present
  if (gpsIfdOffset > 0) {
    const gpsEntries = dataView.getUint16(tiffOffset + gpsIfdOffset, isLittleEndian);
    const gpsTags: Record<number, any> = {};

    for (let i = 0; i < gpsEntries; i++) {
      const entryOffset = tiffOffset + gpsIfdOffset + 2 + i * 12;
      const tag = dataView.getUint16(entryOffset, isLittleEndian);
      const type = dataView.getUint16(entryOffset + 2, isLittleEndian);
      const count = dataView.getUint32(entryOffset + 4, isLittleEndian);
      const valOffset = entryOffset + 8;

      const val = readTagValue(dataView, tiffOffset, tag, type, count, valOffset, isLittleEndian);
      gpsTags[tag] = val;
    }

    if (gpsTags[2] && gpsTags[4]) {
      // Lat / Lon
      const latRef = String(gpsTags[1] || 'N').trim();
      const latRaw = gpsTags[2]; // array of 3 rationals [deg, min, sec]
      const lonRef = String(gpsTags[3] || 'E').trim();
      const lonRaw = gpsTags[4];

      if (Array.isArray(latRaw) && Array.isArray(lonRaw)) {
        let lat = latRaw[0] + latRaw[1] / 60 + latRaw[2] / 3600;
        if (latRef === 'S') lat = -lat;
        let lon = lonRaw[0] + lonRaw[1] / 60 + lonRaw[2] / 3600;
        if (lonRef === 'W') lon = -lon;

        const alt = typeof gpsTags[6] === 'number' ? gpsTags[6] : undefined;

        exif.gps = {
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lon.toFixed(6)),
          altitude: alt,
          latString: `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`,
          lonString: `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`,
          mapUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`,
        };
      }
    }
  }

  return exif;
}

function readTagValue(
  dataView: DataView,
  tiffOffset: number,
  tag: number,
  type: number,
  count: number,
  valOffset: number,
  isLittle: boolean
): any {
  // Types: 1=BYTE, 2=ASCII, 3=SHORT, 4=LONG, 5=RATIONAL, 7=UNDEFINED, 9=SLONG, 10=SRATIONAL
  if (type === 2) {
    // ASCII string
    const offset = count > 4 ? tiffOffset + dataView.getUint32(valOffset, isLittle) : valOffset;
    let str = '';
    for (let i = 0; i < count; i++) {
      const code = dataView.getUint8(offset + i);
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str.trim();
  } else if (type === 3) {
    // SHORT
    return dataView.getUint16(valOffset, isLittle);
  } else if (type === 4) {
    // LONG
    return dataView.getUint32(valOffset, isLittle);
  } else if (type === 5 || type === 10) {
    // RATIONAL
    const offset = tiffOffset + dataView.getUint32(valOffset, isLittle);
    if (count === 1) {
      const num = dataView.getUint32(offset, isLittle);
      const den = dataView.getUint32(offset + 4, isLittle);
      return den !== 0 ? num / den : num;
    } else {
      const arr = [];
      for (let i = 0; i < count; i++) {
        const num = dataView.getUint32(offset + i * 8, isLittle);
        const den = dataView.getUint32(offset + i * 8 + 4, isLittle);
        arr.push(den !== 0 ? num / den : 0);
      }
      return arr;
    }
  }
  return dataView.getUint32(valOffset, isLittle);
}

/**
 * Strips all EXIF / metadata from an image and exports clean Blob
 */
export async function stripImageMetadata(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas context unavailable'));
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate stripped blob'));
      }, 'image/jpeg', 0.95);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for sanitization'));
    };
    img.src = url;
  });
}
