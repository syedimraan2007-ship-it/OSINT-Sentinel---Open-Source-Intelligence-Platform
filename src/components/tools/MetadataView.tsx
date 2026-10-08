import React, { useState } from 'react';
import { parseExifFromArrayBuffer, stripImageMetadata, ExifData } from '../../utils/exifParser';
import { InvestigationFinding } from '../../types';
import { RiskBadge } from '../Badges';
import { Upload, FileText, MapPin, ShieldCheck, Download, BookmarkPlus, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface MetadataViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const MetadataView: React.FC<MetadataViewProps> = ({ onAddFinding }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsLogged(false);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Read ArrayBuffer & parse EXIF
    const buffer = await file.arrayBuffer();
    const parsed = parseExifFromArrayBuffer(buffer);

    if (parsed) {
      setExif(parsed);
    } else {
      // Fallback basic metadata
      setExif({
        rawTags: {
          FileName: file.name,
          FileSize: `${(file.size / 1024).toFixed(1)} KB`,
          MimeType: file.type,
          LastModified: new Date(file.lastModified).toISOString(),
        },
      });
    }
  };

  const handleCleanAndDownload = async () => {
    if (!selectedFile) return;
    setCleaning(true);
    try {
      const cleanBlob = await stripImageMetadata(selectedFile);
      const url = URL.createObjectURL(cleanBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sanitized-${selectedFile.name.replace(/\.[^/.]+$/, '')}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setCleaning(false);
    }
  };

  const handleLog = () => {
    if (!selectedFile) return;
    const hasGps = !!exif?.gps;
    onAddFinding({
      sourceTool: 'metadata',
      target: selectedFile.name,
      type: 'Digital Media EXIF / XMP Extraction',
      title: `EXIF Artifacts: ${selectedFile.name}`,
      risk: hasGps ? 'HIGH' : exif?.make ? 'MEDIUM' : 'LOW',
      status: 'Completed',
      details: `Make/Model: ${exif?.make || 'None'} ${exif?.model || ''}. DateTime: ${exif?.dateTime || 'None'}. GPS Telemetry: ${
        hasGps ? `${exif?.gps?.latString}, ${exif?.gps?.lonString}` : 'No Geotags'
      }. File Size: ${(selectedFile.size / 1024).toFixed(1)} KB.`,
      metadata: { fileName: selectedFile.name, fileSize: selectedFile.size, exif },
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #665191' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#665191' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Metadata Intelligence (EXIF / XMP)
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F5F2F9] text-[#665191] border border-[#DDD5E9]">
                Media Forensics &amp; OPSEC Sanitization
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Extract binary EXIF tags, GPS satellite geolocation, camera hardware signatures, and sanitize media to eliminate attribution leaks.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors shrink-0" style={{ backgroundColor: '#244A73' }}>
            <Upload className="w-3.5 h-3.5" />
            <span>Select Media File</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {!selectedFile ? (
        <div className="p-12 text-center bg-[#FFFFFF] border border-dashed border-[#E1E5E9] rounded-[6px] text-xs text-[#626B73] space-y-2">
          <ImageIcon className="w-8 h-8 text-[#665191] mx-auto opacity-70" />
          <p className="font-medium text-[#222222]">No media artifact loaded</p>
          <p>Upload any JPEG, PNG, or WebP photo to parse hardware tags, camera parameters, and geolocation telemetry.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Attribution Risk</div>
              <div className="mt-1 flex items-center justify-between">
                <RiskBadge risk={exif?.gps ? 'HIGH' : exif?.make ? 'MEDIUM' : 'LOW'} />
                <span className="text-xs text-[#626B73]">{exif?.gps ? 'Location Exposed' : 'Sanitized'}</span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Camera Hardware</div>
              <div className="mt-1 text-xs font-medium text-[#222222] truncate">
                {exif?.make || exif?.model ? `${exif?.make || ''} ${exif?.model || ''}` : 'Hardware tags stripped'}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">GPS Coordinates</div>
              <div className="mt-1 text-xs font-mono font-medium truncate">
                {exif?.gps ? (
                  <span className="text-[#B23A3A] font-semibold">{exif.gps.latString}, {exif.gps.lonString}</span>
                ) : (
                  <span className="text-[#3A7D44]">No embedded geotags</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">File Payload</div>
              <div className="mt-1 text-xs font-mono text-[#222222] truncate">
                {(selectedFile.size / 1024).toFixed(1)} KB ({selectedFile.type})
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* EXIF Data Table */}
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
                <h3 className="text-sm font-semibold text-[#222222]">
                  Extracted Header Properties
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCleanAndDownload}
                    disabled={cleaning}
                    className="px-2.5 py-1 text-xs rounded border border-[#E1E5E9] text-[#222222] hover:bg-[#F8F9FA] flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#626B73]" />
                    <span>{cleaning ? 'Stripping...' : 'Export OPSEC Clean'}</span>
                  </button>

                  <button
                    onClick={handleLog}
                    disabled={isLogged}
                    className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                      isLogged
                        ? 'bg-[#F2F7F3] text-[#3A7D44] border border-[#D3E6D6]'
                        : 'bg-[#FFFFFF] border border-[#244A73] text-[#244A73] hover:bg-[#F0F4F8]'
                    }`}
                  >
                    {isLogged ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                    <span>{isLogged ? 'Logged' : 'Log to Dossier'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Camera Device:</span>
                  <span className="font-medium text-[#222222]">{exif?.make || 'Unknown'} {exif?.model || ''}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Lens Model:</span>
                  <span className="text-[#222222]">{exif?.lensModel || 'Unspecified'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Timestamp Original:</span>
                  <span className="font-mono text-[#222222]">{exif?.dateTime || 'No timestamp record'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Software / Firmware:</span>
                  <span className="text-[#222222]">{exif?.software || 'Stock OS'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">Exposure Time:</span>
                  <span className="font-mono text-[#222222]">{exif?.exposureTime ? `${exif.exposureTime}s` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">F-Number / Aperture:</span>
                  <span className="font-mono text-[#222222]">{exif?.fNumber ? `f/${exif.fNumber}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E1E5E9]/60">
                  <span className="text-[#626B73]">ISO Speed:</span>
                  <span className="font-mono text-[#222222]">{exif?.iso || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#626B73]">Focal Length:</span>
                  <span className="font-mono text-[#222222]">{exif?.focalLength ? `${exif.focalLength} mm` : 'N/A'}</span>
                </div>
              </div>

              {exif?.gps && (
                <div className="p-3 bg-[#FAEDED] border border-[#F3CCCC] rounded-[6px] space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-[#8B1E1E] text-xs font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>Geolocation Satellite Telemetry Detected</span>
                  </div>
                  <p className="text-xs text-[#222222]">
                    Precise physical coordinates discovered in image metadata:{' '}
                    <strong className="font-mono">{exif.gps.latString}, {exif.gps.lonString}</strong>
                    {exif.gps.altitude ? ` (Altitude: ${exif.gps.altitude.toFixed(1)}m)` : ''}
                  </p>
                  <a
                    href={exif.gps.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1E1E] hover:underline"
                  >
                    <span>View Coordinates on OpenStreetMap</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Image Preview Card */}
            <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3">
                Media Preview &amp; Verification
              </h3>

              {imagePreview && (
                <div className="border border-[#E1E5E9] rounded overflow-hidden bg-[#F8F9FA]">
                  <img
                    src={imagePreview}
                    alt="Artifact preview"
                    className="w-full max-h-60 object-contain mx-auto"
                  />
                </div>
              )}

              <div className="text-xs text-[#626B73] space-y-1">
                <div>Filename: <strong className="text-[#222222] font-mono">{selectedFile.name}</strong></div>
                <div>Size: {(selectedFile.size / 1024).toFixed(1)} KB</div>
                <div>Raw tags parsed: {Object.keys(exif?.rawTags || {}).length} markers</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
