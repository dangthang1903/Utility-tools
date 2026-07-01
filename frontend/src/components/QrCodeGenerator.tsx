import { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Link,
  AlignLeft,
  Mail,
  Phone,
  Wifi,
  Download,
  Copy,
  Info
} from 'lucide-react';

type TabType = 'url' | 'text' | 'email' | 'phone' | 'wifi';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const PREDEFINED_COLORS = ['#000000', '#0ea5e9', '#10b981', '#8b5cf6', '#ef4444'];

export default function QrCodeGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>('url');

  // Data State
  const [url, setUrl] = useState('https://dangthang.io.vn');
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Style State
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(320);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>('M');
  const [margin, setMargin] = useState(4);

  const qrRef = useRef<HTMLDivElement>(null);

  const generateQrValue = () => {
    switch (activeTab) {
      case 'url': return url;
      case 'text': return text;
      case 'email': return `mailto:${email}`;
      case 'phone': return `tel:${phone}`;
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden};;`;
      default: return url;
    }
  };

  const qrValue = generateQrValue();

  const handleDownloadPNG = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById('qr-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'qrcode.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  const handleCopy = async () => {
    try {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('Đã sao chép mã QR vào clipboard!');
          }
        });
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Lỗi khi sao chép mã QR.');
    }
  };

  return (
    <div className="qr-generator-container animate-fade-in">
      {/* Left Panel: Controls */}
      <div className="qr-controls-panel card">

        {/* Tabs */}
        <div className="qr-tabs">
          <button
            className={`qr-tab ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <Link className="tab-icon" /> URL
          </button>
          <button
            className={`qr-tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <AlignLeft className="tab-icon" /> Text
          </button>
          <button
            className={`qr-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail className="tab-icon" /> Email
          </button>
          <button
            className={`qr-tab ${activeTab === 'phone' ? 'active' : ''}`}
            onClick={() => setActiveTab('phone')}
          >
            <Phone className="tab-icon" /> Phone
          </button>
          <button
            className={`qr-tab ${activeTab === 'wifi' ? 'active' : ''}`}
            onClick={() => setActiveTab('wifi')}
          >
            <Wifi className="tab-icon" /> WiFi
          </button>
        </div>

        {/* Input Fields */}
        <div className="qr-input-section">
          {activeTab === 'url' && (
            <div className="input-group">
              <label>Đường dẫn URL</label>
              <input
                type="text"
                className="input-field"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="input-group">
              <label>Nội dung văn bản</label>
              <textarea
                className="input-field"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập văn bản của bạn vào đây..."
                rows={4}
              />
            </div>
          )}

          {activeTab === 'email' && (
            <div className="input-group">
              <label>Địa chỉ Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
          )}

          {activeTab === 'phone' && (
            <div className="input-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 123 456 789"
              />
            </div>
          )}

          {activeTab === 'wifi' && (
            <div className="qr-wifi-grid">
              <div className="input-group">
                <label>Tên mạng (SSID)</label>
                <input
                  type="text"
                  className="input-field"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="Tên WiFi"
                />
              </div>
              <div className="input-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  className="input-field"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Mật khẩu"
                />
              </div>
              <div className="input-group">
                <label>Bảo mật</label>
                <select
                  className="input-field"
                  value={wifiEncryption}
                  onChange={(e) => setWifiEncryption(e.target.value)}
                >
                  <option value="WPA">WPA/WPA2/WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Không có (Mở)</option>
                </select>
              </div>
              <div className="input-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                  />
                  Mạng ẩn
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Customization Options */}
        <div className="qr-customization">
          <div className="input-group">
            <label>Màu mã QR</label>
            <div className="color-picker-group">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-swatch ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  className="color-picker-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <div
                  className={`color-swatch color-custom-btn ${!PREDEFINED_COLORS.includes(color) ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <div className="flex-between">
              <label>Kích thước</label>
              <span className="size-value">{size} px</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min="100"
              max="1000"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
            />
          </div>

          <div className="qr-settings-grid">
            <div className="input-group">
              <label>Mức sửa lỗi</label>
              <div className="toggle-group">
                {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => (
                  <button
                    key={level}
                    className={`toggle-btn ${errorCorrectionLevel === level ? 'active' : ''}`}
                    onClick={() => setErrorCorrectionLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Viền (margin)</label>
              <div className="toggle-group">
                {[0, 2, 4].map((m) => (
                  <button
                    key={m}
                    className={`toggle-btn ${margin === m ? 'active' : ''}`}
                    onClick={() => setMargin(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Panel: Preview */}
      <div className="qr-preview-panel">
        <div className="card preview-card">
          <div className="preview-header">
            <h3>XEM TRƯỚC</h3>
            <span className="preview-meta">{activeTab.toUpperCase()} · {size}px</span>
          </div>

          <div className="qr-code-wrapper" ref={qrRef}>
            <div className="qr-code-inner">
              {/* Hidden Canvas for PNG Download */}
              <div style={{ display: 'none' }}>
                <QRCodeCanvas
                  id="qr-canvas"
                  value={qrValue || ' '}
                  size={size}
                  fgColor={color}
                  level={errorCorrectionLevel}
                  marginSize={margin}
                />
              </div>

              {/* Visible SVG for Preview and SVG Download */}
              <QRCodeSVG
                id="qr-svg"
                value={qrValue || ' '}
                size={Math.min(size, 300)} // scale down for preview if too large
                style={{ width: '100%', height: 'auto', maxWidth: `${size}px` }}
                fgColor={color}
                level={errorCorrectionLevel}
                marginSize={margin}
              />
            </div>
          </div>

          <div className="preview-actions">
            <button className="btn btn-dark" onClick={handleDownloadPNG}>
              <Download className="btn-icon" /> Tải PNG
            </button>
            <button className="btn btn-outline" onClick={handleDownloadSVG}>
              <Download className="btn-icon" /> Tải SVG
            </button>
            <button className="btn btn-outline" onClick={handleCopy}>
              <Copy className="btn-icon" /> Sao chép
            </button>
          </div>
        </div>

        <div className="info-alert">
          <Info className="info-icon" />
          <p>Mã QR được tạo trực tiếp trên trình duyệt của bạn — không có dữ liệu nào được gửi lên máy chủ.</p>
        </div>
      </div>
    </div>
  );
}
