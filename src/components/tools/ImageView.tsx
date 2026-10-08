import React, { useState, useRef, useEffect } from 'react';
import { InvestigationFinding } from '../../types';
import { RiskBadge } from '../Badges';
import { Upload, Search, BarChart3, BookmarkPlus, Check, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImageViewProps {
  onAddFinding: (finding: Omit<InvestigationFinding, 'id' | 'timestamp'>) => void;
}

export const ImageView: React.FC<ImageViewProps> = ({ onAddFinding }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgStats, setImgStats] = useState<{ width: number; height: number; aspect: string; sizeKb: number } | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [activeForensicTab, setActiveForensicTab] = useState<'histogram' | 'ela'>('histogram');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsLogged(false);
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const d = gcd(img.width, img.height);
      setImgStats({
        width: img.width,
        height: img.height,
        aspect: `${img.width / d}:${img.height / d}`,
        sizeKb: Math.round(file.size / 1024),
      });

      renderHistogram(img);
      renderEla(img);
    };
    img.src = url;
  };

  // Render RGB Color Histogram on Canvas
  const renderHistogram = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = img.width;
    offscreen.height = img.height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.drawImage(img, 0, 0);

    const imgData = offCtx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;

    const rCount = new Array(256).fill(0);
    const gCount = new Array(256).fill(0);
    const bCount = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      rCount[data[i]]++;
      gCount[data[i + 1]]++;
      bCount[data[i + 2]]++;
    }

    const maxCount = Math.max(...rCount, ...gCount, ...bCount) || 1;

    canvas.width = 512;
    canvas.height = 160;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw baseline
    ctx.strokeStyle = '#E1E5E9';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    const drawChannel = (arr: number[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < 256; x++) {
        const val = arr[x];
        const y = canvas.height - (val / maxCount) * (canvas.height - 10);
        const posX = x * 2;
        if (x === 0) ctx.moveTo(posX, y);
        else ctx.lineTo(posX, y);
      }
      ctx.stroke();
    };

    drawChannel(rCount, '#B23A3A'); // Red
    drawChannel(gCount, '#3A7D44'); // Green
    drawChannel(bCount, '#244A73'); // Blue
  };

  // Render Error Level Analysis (ELA) simulation on Canvas
  const renderEla = (img: HTMLImageElement) => {
    const canvas = elaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.min(600, img.width);
    canvas.height = Math.round((canvas.width / img.width) * img.height);

    // Draw base
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const original = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Compress to 75% quality JPEG in memory and redraw to calculate residual delta
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const recompressed = new Image();
    recompressed.onload = () => {
      tempCtx.drawImage(recompressed, 0, 0);
      const compressedData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

      // Compute differential multiplied by 15x amplifier to visualize compression delta
      const out = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < out.data.length; i += 4) {
        const diffR = Math.abs(original.data[i] - compressedData.data[i]) * 15;
        const diffG = Math.abs(original.data[i + 1] - compressedData.data[i + 1]) * 15;
        const diffB = Math.abs(original.data[i + 2] - compressedData.data[i + 2]) * 15;

        out.data[i] = Math.min(255, diffR);
        out.data[i + 1] = Math.min(255, diffG);
        out.data[i + 2] = Math.min(255, diffB);
        out.data[i + 3] = 255;
      }
      ctx.putImageData(out, 0, 0);
    };
    recompressed.src = tempCanvas.toDataURL('image/jpeg', 0.75);
  };

  const handleLog = () => {
    if (!selectedFile || !imgStats) return;
    onAddFinding({
      sourceTool: 'image',
      target: selectedFile.name,
      type: 'Forensic Image Analysis & ELA',
      title: `Forensic Inspection: ${selectedFile.name}`,
      risk: 'GUARDED',
      status: 'Completed',
      details: `Resolution: ${imgStats.width}x${imgStats.height} (${imgStats.aspect}). Size: ${imgStats.sizeKb} KB. Computed 3-channel RGB histogram and Error Level Analysis (ELA) compression residual map.`,
      metadata: { fileName: selectedFile.name, imgStats },
    });
    setIsLogged(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5" style={{ borderLeft: '3px solid #B7791F' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#B7791F' }} />
              <h2 className="text-base font-semibold text-[#222222]">
                Image Intelligence &amp; Forensics
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-[#FDF7EB] text-[#B7791F] border border-[#F6E4C4]">
                Forensic Analysis &amp; Reverse Search
              </span>
            </div>
            <p className="text-xs text-[#626B73] mt-1">
              Analyze image luminance distribution, calculate Error Level Analysis (ELA) compression residuals, and generate reverse image search pivot queries.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white rounded transition-colors shrink-0" style={{ backgroundColor: '#244A73' }}>
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {!selectedFile ? (
        <div className="p-12 text-center bg-[#FFFFFF] border border-dashed border-[#E1E5E9] rounded-[6px] text-xs text-[#626B73] space-y-2">
          <ImageIcon className="w-8 h-8 text-[#B7791F] mx-auto opacity-70" />
          <p className="font-medium text-[#222222]">No image loaded for forensic audit</p>
          <p>Select any image to compute RGB histogram charts, evaluate ELA compression artifacts, and generate reverse search links.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Forensic Assessment</div>
              <div className="mt-1 flex items-center justify-between">
                <RiskBadge risk="GUARDED" />
                <span className="text-xs text-[#626B73]">Ready for review</span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Image Dimensions</div>
              <div className="mt-1 font-mono text-xs text-[#222222]">
                {imgStats?.width} × {imgStats?.height} px ({imgStats?.aspect})
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">File Payload</div>
              <div className="mt-1 font-mono text-xs text-[#222222]">
                {imgStats?.sizeKb} KB
              </div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px]">
              <div className="text-[11px] text-[#626B73] uppercase tracking-wide">Audit Actions</div>
              <div className="mt-1">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forensics Canvas Viewer */}
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E5E9] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveForensicTab('histogram')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      activeForensicTab === 'histogram'
                        ? 'bg-[#244A73] text-white'
                        : 'bg-[#FFFFFF] border border-[#E1E5E9] text-[#626B73]'
                    }`}
                  >
                    RGB Color Histogram
                  </button>
                  <button
                    onClick={() => setActiveForensicTab('ela')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      activeForensicTab === 'ela'
                        ? 'bg-[#244A73] text-white'
                        : 'bg-[#FFFFFF] border border-[#E1E5E9] text-[#626B73]'
                    }`}
                  >
                    Error Level Analysis (ELA)
                  </button>
                </div>

                <span className="text-[11px] text-[#626B73]">
                  Browser Canvas Forensics Engine
                </span>
              </div>

              {activeForensicTab === 'histogram' ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#626B73]">
                    Luminance and chromatic frequency distribution across 256 tonal gradations (Red, Green, Blue channels):
                  </p>
                  <canvas ref={canvasRef} className="w-full h-40 border border-[#E1E5E9] rounded bg-white" />
                  <div className="flex items-center justify-center gap-6 text-xs">
                    <span className="flex items-center gap-1.5 text-[#B23A3A] font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B23A3A]" /> Red Channel
                    </span>
                    <span className="flex items-center gap-1.5 text-[#3A7D44] font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3A7D44]" /> Green Channel
                    </span>
                    <span className="flex items-center gap-1.5 text-[#244A73] font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#244A73]" /> Blue Channel
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#626B73]">
                    Error Level Analysis highlights compression discrepancies. Spliced or digitally modified elements often exhibit noticeable variance against the background error baseline:
                  </p>
                  <div className="border border-[#E1E5E9] rounded p-2 bg-[#F8F9FA] flex justify-center">
                    <canvas ref={elaCanvasRef} className="max-h-72 object-contain" />
                  </div>
                </div>
              )}
            </div>

            {/* Pivot Links & Original Preview */}
            <div className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#222222] border-b border-[#E1E5E9] pb-3">
                Reverse Image Search Pivots
              </h3>

              <div className="space-y-2 text-xs">
                <a
                  href="https://images.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded bg-[#F8F9FA] border border-[#E1E5E9] hover:border-[#244A73] flex items-center justify-between text-[#244A73] transition-colors"
                >
                  <span className="font-medium">Google Images / Google Lens</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://yandex.com/images/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded bg-[#F8F9FA] border border-[#E1E5E9] hover:border-[#244A73] flex items-center justify-between text-[#244A73] transition-colors"
                >
                  <span className="font-medium">Yandex Visual Search</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://tineye.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded bg-[#F8F9FA] border border-[#E1E5E9] hover:border-[#244A73] flex items-center justify-between text-[#244A73] transition-colors"
                >
                  <span className="font-medium">TinEye Reverse Image Search</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://www.bing.com/visualsearch"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded bg-[#F8F9FA] border border-[#E1E5E9] hover:border-[#244A73] flex items-center justify-between text-[#244A73] transition-colors"
                >
                  <span className="font-medium">Bing Visual Search</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {imageSrc && (
                <div className="pt-2 border-t border-[#E1E5E9]">
                  <div className="text-xs font-medium text-[#222222] mb-2">Original Target Artifact</div>
                  <img
                    src={imageSrc}
                    alt="Original"
                    className="w-full max-h-44 object-contain rounded border border-[#E1E5E9] bg-[#F8F9FA]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
