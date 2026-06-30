import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Download, 
  Settings, 
  RefreshCw,
  CheckCircle,
  FileImage
} from 'lucide-react';

export default function ImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  
  // Settings
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.8);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);

  // Result
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadFileData(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        loadFileData(droppedFile);
      } else {
        alert('Vui lòng chọn một file ảnh hợp lệ!');
      }
    }
  };

  const loadFileData = (selectedFile: File) => {
    setFile(selectedFile);
    setResultUrl(null); // Reset result
    
    // Set default format based on original, or default to JPEG
    if (selectedFile.type === 'image/png' || selectedFile.type === 'image/webp' || selectedFile.type === 'image/jpeg') {
      setTargetFormat(selectedFile.type);
    } else {
      setTargetFormat('image/jpeg');
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Get original dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = url;
  };

  // Auto-calculate height or width if maintain aspect ratio
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspect && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspect && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(val * ratio));
    }
  };

  // Process Image via Canvas
  const processImage = () => {
    if (!previewUrl) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width || img.width;
      canvas.height = height || img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setProcessing(false);
        return;
      }

      // If output is JPEG, fill background with white (since JPEG has no transparency)
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setResultSize(blob.size);
          }
          setProcessing(false);
        },
        targetFormat,
        targetFormat === 'image/png' ? undefined : quality
      );
    };
    img.src = previewUrl;
  };

  const resetAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFormatExtension = (mimeType: string) => {
    return mimeType.split('/')[1] || 'jpg';
  };

  return (
    <div className="downloader-wrapper">
      
      {/* Header */}
      <div className="downloader-header-section">
        <div className="header-icon-box" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.08)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
          <ImageIcon style={{ width: '40px', height: '40px' }} />
        </div>
        <h1 className="header-title glow-text-primary">
          Image Optimizer
        </h1>
        <p className="header-desc">
          Công cụ ép size, đổi định dạng và nén ảnh mượt mà, thực hiện 100% trên trình duyệt của bạn (Không upload lên máy chủ).
        </p>
      </div>

      <div className="glass-panel downloader-form-card" style={{ maxWidth: '800px', width: '100%' }}>
        
        {/* Glowing Blobs inside Card */}
        <div className="glow-spot-1" style={{ background: 'rgba(168, 85, 247, 0.06)' }} />
        <div className="glow-spot-2" style={{ background: 'rgba(6, 182, 212, 0.06)' }} />

        {!file && (
          <div 
            className="upload-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '60px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <UploadCloud style={{ width: '48px', height: '48px', color: 'hsl(var(--primary))' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Kéo thả ảnh vào đây</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>hoặc click để chọn file từ thiết bị</p>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
        )}

        {file && !resultUrl && !processing && (
          <div className="image-editor-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Preview Section */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '16px', 
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  height: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                    />
                  )}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileImage size={14} /> {file.name}</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
              </div>

              {/* Settings Section */}
              <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Format selection */}
                <div>
                  <label className="field-label">Định dạng đầu ra</label>
                  <div className="tabs-selector-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div 
                      className={`tab-select-btn ${targetFormat === 'image/jpeg' ? 'tab-select-btn-active-video' : ''}`}
                      onClick={() => setTargetFormat('image/jpeg')}
                      style={targetFormat === 'image/jpeg' ? { borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', boxShadow: 'none' } : {}}
                    >
                      JPG
                    </div>
                    <div 
                      className={`tab-select-btn ${targetFormat === 'image/png' ? 'tab-select-btn-active-video' : ''}`}
                      onClick={() => setTargetFormat('image/png')}
                      style={targetFormat === 'image/png' ? { borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', boxShadow: 'none' } : {}}
                    >
                      PNG
                    </div>
                    <div 
                      className={`tab-select-btn ${targetFormat === 'image/webp' ? 'tab-select-btn-active-video' : ''}`}
                      onClick={() => setTargetFormat('image/webp')}
                      style={targetFormat === 'image/webp' ? { borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', boxShadow: 'none' } : {}}
                    >
                      WEBP
                    </div>
                  </div>
                </div>

                {/* Resize */}
                <div>
                  <label className="field-label">Kích thước (Resize)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="number" 
                        value={width || ''} 
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="glass-input" 
                        placeholder="Width"
                        style={{ padding: '10px 14px' }}
                      />
                    </div>
                    <span style={{ color: 'hsl(var(--text-muted))' }}>×</span>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="number" 
                        value={height || ''} 
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="glass-input" 
                        placeholder="Height"
                        style={{ padding: '10px 14px' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="maintainAspect" 
                      checked={maintainAspect} 
                      onChange={(e) => setMaintainAspect(e.target.checked)}
                      style={{ accentColor: 'hsl(var(--primary))' }}
                    />
                    <label htmlFor="maintainAspect" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', cursor: 'pointer' }}>
                      Giữ nguyên tỉ lệ khung hình
                    </label>
                  </div>
                </div>

                {/* Quality Slider (only for JPEG/WEBP) */}
                {targetFormat !== 'image/png' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label className="field-label" style={{ marginBottom: 0 }}>Chất lượng nén: {Math.round(quality * 100)}%</label>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.05" 
                      value={quality} 
                      onChange={(e) => setQuality(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'hsl(var(--primary))' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={resetAll} className="btn btn-secondary" style={{ flex: 1 }}>
                Chọn ảnh khác
              </button>
              <button onClick={processImage} className="btn btn-primary" style={{ flex: 2 }}>
                <Settings size={18} /> Bắt đầu xử lý
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {processing && (
          <div className="loading-view-box">
            <div className="spinner-outer-ring">
              <div className="spinner-inner-ring" style={{ borderColor: 'rgba(168, 85, 247, 0.08)', borderTopColor: '#c084fc' }}></div>
            </div>
            <h3 className="loading-title">Đang xử lý ảnh...</h3>
            <p className="loading-subtitle">
              Canvas API đang render hình ảnh với cấu hình mới của bạn.
            </p>
          </div>
        )}

        {/* Success View */}
        {resultUrl && (
          <div className="success-view-box">
            <div className="success-badge-glow" style={{ color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)', boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.2)' }}>
              <CheckCircle style={{ width: '32px', height: '32px' }} />
            </div>
            
            <div className="success-meta-wrapper">
              <h3 className="success-title" style={{ color: '#c084fc' }}>Xử lý thành công!</h3>
              <p className="success-format-type">
                Định dạng: {getFormatExtension(targetFormat).toUpperCase()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '24px', margin: '20px 0', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '100%', justifyContent: 'center' }}>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>Dung lượng gốc</p>
                 <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f87171' }}>{formatBytes(file?.size || 0)}</p>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', color: 'hsl(var(--text-muted))' }}>
                 <span>→</span>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>Sau khi xử lý</p>
                 <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#4ade80' }}>{formatBytes(resultSize)}</p>
               </div>
            </div>

            <div className="success-actions-row">
              <a 
                href={resultUrl} 
                download={`optimized_image.${getFormatExtension(targetFormat)}`}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #c084fc 100%)', boxShadow: '0 4px 20px -2px rgba(168, 85, 247, 0.4)' }}
              >
                <Download size={18} />
                Tải ảnh về máy
              </a>
              <button 
                onClick={resetAll}
                className="btn btn-secondary"
              >
                <RefreshCw size={18} />
                Làm ảnh khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
