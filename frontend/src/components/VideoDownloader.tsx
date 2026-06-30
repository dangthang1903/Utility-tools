import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Film, 
  Music, 
  AlertTriangle, 
  CheckCircle, 
  Clipboard, 
  Trash2, 
  RefreshCw, 
  ExternalLink
} from 'lucide-react';

const Youtube = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [videoQuality, setVideoQuality] = useState<string>('1080');
  const [audioBitrate, setAudioBitrate] = useState<string>('320');
  
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Giả lập các bước xử lý để trải nghiệm mượt mà hơn
  useEffect(() => {
    if (!loading) return;
    
    const stages = [
      'Đang gửi yêu cầu tới NestJS Backend...',
      'Backend đang tìm kiếm máy chủ API rảnh...',
      'Đang phân tích và giải mã luồng video...',
      downloadType === 'video' && parseInt(videoQuality) >= 720 
        ? 'Đang tiến hành ghép luồng hình ảnh & âm thanh chất lượng cao...' 
        : 'Đang khởi tạo file tải về...',
      'Hoàn thành! Chuẩn bị nhận link tải...',
    ].filter(Boolean) as string[];

    let currentStageIndex = 0;
    setLoadingStage(stages[0]);

    const interval = setInterval(() => {
      if (currentStageIndex < stages.length - 1) {
        currentStageIndex++;
        setLoadingStage(stages[currentStageIndex]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [loading, downloadType, videoQuality]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        setUrl(text);
        setError(null);
      } else {
        setUrl(text);
        setError('Đường dẫn đã dán có vẻ không phải từ YouTube, nhưng chúng tôi vẫn sẽ thử xử lý.');
      }
    } catch (err) {
      setError('Không thể tự động dán từ Clipboard. Bạn vui lòng tự dán bằng tổ hợp phím Ctrl+V.');
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    setDownloadUrl(null);
    setFileName(null);
  };

  const validateUrl = (testUrl: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(testUrl.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!validateUrl(url)) {
      setError('Vui lòng nhập đường dẫn YouTube hợp lệ (ví dụ: https://www.youtube.com/watch?v=...)');
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    setFileName(null);

    const payload = {
      url: url.trim(),
      videoQuality,
      isAudioOnly: downloadType === 'audio',
      audioBitrate
    };

    try {
      // Gửi yêu cầu tới API (Monolith)
      const response = await fetch('/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi hệ thống từ Backend (${response.status})`);
      }

      const data = await response.json();
      
      if (data.status === 'redirect' || data.status === 'tunnel' || data.url) {
        setDownloadUrl(data.url);
        setFileName(data.filename || 'Youtube_Media_Download');
      } else {
        throw new Error('Phản hồi từ server không chứa link tải hợp lệ.');
      }
    } catch (err: any) {
      setError(
        'Tải video thất bại qua máy chủ Backend.\n\n' +
        `Chi tiết lỗi: "${err.message}"\n\n` +
        'Gợi ý khắc phục:\n' +
        '1. Đảm bảo máy chủ NestJS của bạn đang chạy ở cổng 3009 (npm run start:dev trong thư mục backend).\n' +
        '2. Kiểm tra log của NestJS trong Terminal để xem chi tiết lý do máy chủ Cobalt bị từ chối.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="downloader-wrapper">
      
      {/* Downloader Header */}
      <div className="downloader-header-section">
        <div className="header-icon-box">
          <Youtube style={{ width: '40px', height: '40px' }} />
        </div>
        <h1 className="header-title glow-text-youtube">
          YouTube Downloader
        </h1>
        <p className="header-desc">
          Tải video chất lượng cao hoặc trích xuất nhạc MP3 từ YouTube cực nhanh, bảo mật và hoàn toàn miễn phí.
        </p>
      </div>

      <div className="glass-panel downloader-form-card">
        
        {/* Glowing Blobs inside Card */}
        <div className="glow-spot-1" />
        <div className="glow-spot-2" />

        {/* Downloader Form */}
        {!downloadUrl && !loading && (
          <form onSubmit={handleSubmit} className="downloader-form">
            
            {/* Link Input Section */}
            <div>
              <label className="field-label">
                Nhập đường dẫn video YouTube
              </label>
              <div className="url-input-container">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="glass-input url-input-field"
                  required
                />
                <div className="url-input-actions">
                  {url && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="url-btn-clear"
                      title="Xóa đường dẫn"
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="url-btn-paste"
                    title="Dán từ bộ nhớ đệm"
                  >
                    <Clipboard style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Type Selector (Video / Audio Tabs) */}
            <div>
              <label className="field-label">
                Chọn loại định dạng tải về
              </label>
              <div className="tabs-selector-grid">
                <button
                  type="button"
                  onClick={() => setDownloadType('video')}
                  className={`tab-select-btn ${downloadType === 'video' ? 'tab-select-btn-active-video' : ''}`}
                >
                  <Film style={{ width: '16px', height: '16px' }} />
                  Video (.MP4)
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadType('audio')}
                  className={`tab-select-btn ${downloadType === 'audio' ? 'tab-select-btn-active-audio' : ''}`}
                >
                  <Music style={{ width: '16px', height: '16px' }} />
                  Âm thanh (.MP3)
                </button>
              </div>
            </div>

            {/* Quality Selector */}
            <div>
              <label className="field-label">
                Chọn chất lượng tải về
              </label>
              
              {downloadType === 'video' ? (
                /* Video Quality Cards */
                <div className="quality-cards-grid">
                  {[
                    { val: '1080', label: '1080p (Full HD)', desc: 'Chất lượng nét tốt nhất' },
                    { val: '720', label: '720p (HD)', desc: 'Chất lượng tiêu chuẩn' },
                    { val: '360', label: '360p (SD)', desc: 'Dung lượng nhẹ' },
                    { val: '240', label: '240p', desc: 'Tiết kiệm bộ nhớ' },
                    { val: '144', label: '144p', desc: 'Siêu nhẹ' }
                  ].map((q) => (
                    <button
                      key={q.val}
                      type="button"
                      onClick={() => setVideoQuality(q.val)}
                      className={`quality-option-card ${videoQuality === q.val ? 'quality-option-card-active-video' : ''}`}
                    >
                      <span className="quality-card-label">{q.label}</span>
                      <span className="quality-card-desc">{q.desc}</span>
                    </button>
                  ))}
                </div>
              ) : (
                /* Audio Quality Cards */
                <div className="quality-cards-grid">
                  {[
                    { val: '320', label: '320kbps (Best)', desc: 'Chất lượng cao nhất' },
                    { val: '256', label: '256kbps (High)', desc: 'Âm thanh chất lượng' },
                    { val: '128', label: '128kbps (Std)', desc: 'Chất lượng mặc định' }
                  ].map((b) => (
                    <button
                      key={b.val}
                      type="button"
                      onClick={() => setAudioBitrate(b.val)}
                      className={`quality-option-card ${audioBitrate === b.val ? 'quality-option-card-active-audio' : ''}`}
                    >
                      <span className="quality-card-label">{b.label}</span>
                      <span className="quality-card-desc">{b.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <div className="error-alert-box">
                <AlertTriangle className="error-alert-icon" style={{ width: '20px', height: '20px' }} />
                <div className="error-alert-text">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary submit-btn-full"
            >
              <Download style={{ width: '18px', height: '18px' }} />
              Bắt đầu tải ngay
            </button>
          </form>
        )}

        {/* Loading Screen */}
        {loading && (
          <div className="loading-view-box">
            <div className="spinner-outer-ring">
              <div className="spinner-inner-ring" />
            </div>
            <h3 className="loading-title">Đang xử lý media...</h3>
            <p className="loading-subtitle">
              {loadingStage}
            </p>
            <span className="loading-tip-badge">Quá trình này có thể mất từ 10-30 giây tùy thuộc vào chất lượng video</span>
          </div>
        )}

        {/* Success Screen */}
        {downloadUrl && !loading && (
          <div className="success-view-box">
            <div className="success-badge-glow">
              <CheckCircle style={{ width: '32px', height: '32px' }} />
            </div>
            
            <div className="success-meta-wrapper">
              <h3 className="success-title">Chuyển đổi thành công!</h3>
              <p className="success-format-type">
                {downloadType === 'video' ? `Định dạng: Video MP4 - ${videoQuality}p` : `Định dạng: Audio MP3 - ${audioBitrate}kbps`}
              </p>
              {fileName && (
                <div className="result-filename-card">
                  {fileName}
                </div>
              )}
            </div>

            <div className="success-actions-row">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink style={{ width: '16px', height: '16px' }} />
                Tải trực tiếp về máy
              </a>
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                Tải video khác
              </button>
            </div>
            
            <p className="success-tip-small">
              Mẹo: Nếu file tự động phát trên trình duyệt thay vì tải về, bạn chỉ cần nhấn chuột phải vào video chọn "Lưu video thành..." (hoặc nhấn tổ hợp phím Ctrl+S).
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
