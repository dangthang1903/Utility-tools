import React, { useState, useRef } from 'react';
import { 
  Music, 
  UploadCloud, 
  Download, 
  Settings, 
  RefreshCw,
  CheckCircle,
  Scissors,
  Layers,
  Activity,
  FileAudio
} from 'lucide-react';

export default function AudioTool() {
  const [activeTab, setActiveTab] = useState<'trim' | 'merge' | 'compress'>('trim');
  const [files, setFiles] = useState<File[]>([]);
  
  // Trim states
  const [startTime, setStartTime] = useState<string>('00:00:00');
  const [endTime, setEndTime] = useState<string>('00:00:30');

  // Compress states
  const [bitrate, setBitrate] = useState<string>('128k');

  // Result states
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      if (activeTab === 'merge') {
        setFiles(prev => [...prev, ...selectedFiles]);
      } else {
        setFiles([selectedFiles[0]]);
      }
      setResultUrl(null);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
      if (droppedFiles.length > 0) {
        if (activeTab === 'merge') {
          setFiles(prev => [...prev, ...droppedFiles]);
        } else {
          setFiles([droppedFiles[0]]);
        }
        setResultUrl(null);
        setErrorMsg(null);
      } else {
        setErrorMsg('Vui lòng chọn file âm thanh hợp lệ!');
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processAudio = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setErrorMsg(null);
    
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      formData.append('action', activeTab);
      
      if (activeTab === 'trim') {
        formData.append('startTime', startTime);
        formData.append('endTime', endTime);
      } else if (activeTab === 'compress') {
        formData.append('bitrate', bitrate);
      }

      const response = await fetch('/api/audio/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi hệ thống khi xử lý âm thanh');
      }

      // Backend trả về blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi xảy ra trong quá trình xử lý');
    } finally {
      setProcessing(false);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setResultUrl(null);
    setErrorMsg(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="downloader-wrapper">
      <div className="downloader-header-section">
        <div className="header-icon-box" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.08)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
          <Music style={{ width: '40px', height: '40px' }} />
        </div>
        <h1 className="header-title glow-text-primary">
          Audio Studio
        </h1>
        <p className="header-desc">
          Công cụ cắt nhạc, nén size và ghép file âm thanh cực kỳ nhanh chóng.
        </p>
      </div>

      <div className="glass-panel downloader-form-card" style={{ maxWidth: '800px', width: '100%' }}>
        <div className="glow-spot-1" style={{ background: 'rgba(6, 182, 212, 0.06)' }} />
        <div className="glow-spot-2" style={{ background: 'rgba(168, 85, 247, 0.06)' }} />

        {/* Tabs */}
        {!resultUrl && !processing && (
          <div className="tabs-selector-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '28px' }}>
            <div 
              className={`tab-select-btn ${activeTab === 'trim' ? 'tab-select-btn-active-audio' : ''}`}
              onClick={() => { setActiveTab('trim'); setFiles([]); }}
            >
              <Scissors size={18} /> Cắt nhạc
            </div>
            <div 
              className={`tab-select-btn ${activeTab === 'merge' ? 'tab-select-btn-active-audio' : ''}`}
              onClick={() => { setActiveTab('merge'); setFiles([]); }}
            >
              <Layers size={18} /> Ghép nhạc
            </div>
            <div 
              className={`tab-select-btn ${activeTab === 'compress' ? 'tab-select-btn-active-audio' : ''}`}
              onClick={() => { setActiveTab('compress'); setFiles([]); }}
            >
              <Activity size={18} /> Ép size
            </div>
          </div>
        )}

        {!resultUrl && !processing && (
          <>
            {/* Upload Section */}
            <div 
              className="upload-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}
            >
              <UploadCloud style={{ width: '40px', height: '40px', color: 'hsl(var(--secondary))' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                  {activeTab === 'merge' ? 'Chọn nhiều file âm thanh' : 'Chọn file âm thanh'}
                </h3>
              </div>
              <input 
                type="file" 
                accept="audio/*" 
                multiple={activeTab === 'merge'}
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div style={{ marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  File đã chọn ({files.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {files.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <FileAudio size={18} style={{ color: 'hsl(var(--secondary))', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{formatBytes(file.size)}</span>
                        {activeTab === 'merge' && (
                          <button onClick={() => removeFile(idx)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings based on tab */}
            {files.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {activeTab === 'trim' && (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="field-label">Thời gian bắt đầu</label>
                      <input 
                        type="text" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="00:00:00"
                        className="glass-input" 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="field-label">Thời gian kết thúc</label>
                      <input 
                        type="text" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="00:00:30"
                        className="glass-input" 
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'compress' && (
                  <div>
                    <label className="field-label">Chọn Bitrate mong muốn</label>
                    <select 
                      value={bitrate} 
                      onChange={(e) => setBitrate(e.target.value)}
                      className="glass-input"
                      style={{ appearance: 'none' }}
                    >
                      <option value="320k" style={{ background: '#0f172a' }}>320 kbps (Chất lượng rất cao)</option>
                      <option value="256k" style={{ background: '#0f172a' }}>256 kbps</option>
                      <option value="192k" style={{ background: '#0f172a' }}>192 kbps (Chất lượng tốt)</option>
                      <option value="128k" style={{ background: '#0f172a' }}>128 kbps (Tiêu chuẩn)</option>
                      <option value="96k" style={{ background: '#0f172a' }}>96 kbps (Kích thước nhỏ gọn)</option>
                      <option value="64k" style={{ background: '#0f172a' }}>64 kbps (Thích hợp cho giọng nói)</option>
                    </select>
                  </div>
                )}

                {activeTab === 'merge' && files.length < 2 && (
                  <p style={{ color: '#fbbf24', fontSize: '0.85rem' }}>* Vui lòng chọn ít nhất 2 file để ghép.</p>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="error-alert-box" style={{ marginBottom: '24px' }}>
                {errorMsg}
              </div>
            )}

            {files.length > 0 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={resetAll} className="btn btn-secondary" style={{ flex: 1 }}>
                  Hủy
                </button>
                <button 
                  onClick={processAudio} 
                  className="btn btn-primary" 
                  style={{ flex: 2, background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--primary)) 100%)', boxShadow: '0 4px 20px -2px rgba(6, 182, 212, 0.4)' }}
                  disabled={activeTab === 'merge' && files.length < 2}
                >
                  <Settings size={18} /> Bắt đầu xử lý
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {processing && (
          <div className="loading-view-box">
            <div className="spinner-outer-ring" style={{ borderColor: 'rgba(6, 182, 212, 0.08)', borderTopColor: 'hsl(var(--secondary))' }}>
              <div className="spinner-inner-ring" style={{ borderColor: 'rgba(168, 85, 247, 0.08)', borderTopColor: 'hsl(var(--primary))' }}></div>
            </div>
            <h3 className="loading-title">Đang xử lý âm thanh...</h3>
            <p className="loading-subtitle">
              Máy chủ đang dùng FFmpeg để xử lý file của bạn. Quá trình này có thể mất chút thời gian.
            </p>
          </div>
        )}

        {/* Success View */}
        {resultUrl && (
          <div className="success-view-box">
            <div className="success-badge-glow" style={{ color: '#2dd4bf', background: 'rgba(45, 212, 191, 0.1)', borderColor: 'rgba(45, 212, 191, 0.3)', boxShadow: '0 10px 25px -5px rgba(45, 212, 191, 0.2)' }}>
              <CheckCircle style={{ width: '32px', height: '32px' }} />
            </div>
            
            <div className="success-meta-wrapper">
              <h3 className="success-title" style={{ color: '#2dd4bf' }}>Xử lý hoàn tất!</h3>
              <p className="success-format-type">
                Định dạng: MP3
              </p>
            </div>

            <div className="success-actions-row" style={{ marginTop: '24px' }}>
              <a 
                href={resultUrl} 
                download={`processed_audio.mp3`}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, #2dd4bf 100%)', boxShadow: '0 4px 20px -2px rgba(45, 212, 191, 0.4)' }}
              >
                <Download size={18} />
                Tải âm thanh về
              </a>
              <button 
                onClick={resetAll}
                className="btn btn-secondary"
              >
                <RefreshCw size={18} />
                Làm file khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
