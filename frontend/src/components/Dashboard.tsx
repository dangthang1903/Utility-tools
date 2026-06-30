import React, { useState } from 'react';
import { 
  Search, 
  Code, 
  Clock, 
  Palette, 
  Sparkles, 
  Menu, 
  X,
  Layers,
  Wrench,
  ChevronRight,
  Image as ImageIcon,
  Music
} from 'lucide-react';
import VideoDownloader from './VideoDownloader';
import ImageTool from './ImageTool';
import AudioTool from './AudioTool';

const Youtube = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style || { width: '20px', height: '20px' }}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isAvailable: boolean;
  component?: React.ReactNode;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeToolId, setActiveToolId] = useState('youtube-downloader');
  const [searchQuery, setSearchQuery] = useState('');

  const tools: Tool[] = [
    {
      id: 'youtube-downloader',
      name: 'YouTube Downloader',
      description: 'Tải video 1080p và MP3 320kbps cực nhanh.',
      icon: <Youtube className="text-red-500" />,
      category: 'media',
      isAvailable: true,
      component: <VideoDownloader />
    },
    {
      id: 'image-optimizer',
      name: 'Image Optimizer',
      description: 'Ép size, đổi định dạng và thu phóng ảnh mượt mà.',
      icon: <ImageIcon style={{ width: '20px', height: '20px' }} className="text-purple-400" />,
      category: 'media',
      isAvailable: true,
      component: <ImageTool />
    },
    {
      id: 'audio-studio',
      name: 'Audio Studio',
      description: 'Cắt nhạc, ghép nối và ép dung lượng file âm thanh.',
      icon: <Music style={{ width: '20px', height: '20px' }} className="text-cyan-400" />,
      category: 'media',
      isAvailable: true,
      component: <AudioTool />
    },
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Làm đẹp, thu gọn và validate dữ liệu JSON.',
      icon: <Code style={{ width: '20px', height: '20px' }} className="text-cyan-400" />,
      category: 'developer',
      isAvailable: false
    },
    {
      id: 'glassmorphism-gen',
      name: 'Glassmorphism Generator',
      description: 'Tạo hiệu ứng kính mờ và copy code CSS.',
      icon: <Palette style={{ width: '20px', height: '20px' }} className="text-purple-400" />,
      category: 'design',
      isAvailable: false
    },
    {
      id: 'pomodoro-timer',
      name: 'Pomodoro Focus Timer',
      description: 'Đồng hồ quả cà chua giúp quản lý sự tập trung.',
      icon: <Clock style={{ width: '20px', height: '20px' }} className="text-pink-400" />,
      category: 'productivity',
      isAvailable: false
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả công cụ', icon: <Layers style={{ width: '16px', height: '16px' }} /> },
    { id: 'media', name: 'Tải Media', icon: <Youtube style={{ width: '16px', height: '16px' }} /> },
    { id: 'developer', name: 'Lập trình viên', icon: <Code style={{ width: '16px', height: '16px' }} /> },
    { id: 'design', name: 'Thiết kế', icon: <Palette style={{ width: '16px', height: '16px' }} /> },
    { id: 'productivity', name: 'Năng suất', icon: <Clock style={{ width: '16px', height: '16px' }} /> },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="dashboard-layout">
      
      {/* Mobile Top Navbar */}
      <header className="mobile-navbar">
        <div className="sidebar-brand" style={{ marginBottom: 0 }}>
          <div className="brand-icon-container" style={{ padding: '8px' }}>
            <Wrench style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
          <span className="brand-name" style={{ fontSize: '1.15rem' }}>OmniTools</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
        >
          {sidebarOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        
        {/* Sidebar Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-container">
            <Wrench style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <span className="brand-name">OmniTools</span>
        </div>

        {/* Search Input */}
        <div className="sidebar-search-container">
          <Search className="search-icon" style={{ width: '16px', height: '16px' }} />
          <input 
            type="text"
            placeholder="Tìm kiếm công cụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Categories Section */}
        <div>
          <h3 className="sidebar-section-title">Danh mục</h3>
          <nav className="category-nav">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSidebarOpen(false);
                }}
                className={`category-btn ${activeCategory === cat.id ? 'category-btn-active' : ''}`}
              >
                <div className="category-btn-inner">
                  {cat.icon}
                  <span>{cat.name}</span>
                </div>
                <ChevronRight style={{ width: '14px', height: '14px', opacity: 0.4 }} />
              </button>
            ))}
          </nav>
        </div>

        {/* Tools Quick List */}
        <div className="sidebar-tools-list">
          <h3 className="sidebar-section-title">Công cụ</h3>
          {filteredTools.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: '#64748b', paddingLeft: '8px', fontStyle: 'italic' }}>Không tìm thấy công cụ</p>
          ) : (
            filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  if (tool.isAvailable) {
                    setActiveToolId(tool.id);
                    setSidebarOpen(false);
                  }
                }}
                className={`tool-list-item ${activeToolId === tool.id && tool.isAvailable ? 'tool-list-item-active' : ''} ${!tool.isAvailable ? 'tool-list-item-disabled' : ''}`}
              >
                <div className="tool-item-icon-wrapper">
                  {tool.icon}
                </div>
                <div className="tool-item-meta">
                  <div className="tool-item-title-row">
                    <span className="tool-item-name">{tool.name}</span>
                    {!tool.isAvailable && (
                      <span className="tool-badge-soon">Soon</span>
                    )}
                  </div>
                  <span className="tool-item-desc">{tool.description}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer-container">
          <div className="footer-avatar">O</div>
          <div className="footer-meta">
            <p className="footer-title">Utility Tools Hub</p>
            <p className="footer-version">Phiên bản 1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="sidebar-overlay"
        />
      )}

      {/* Main Workspace Area */}
      <main className="dashboard-main-content">
        <div className="workspace-inner">
          {activeTool && activeTool.isAvailable ? (
            activeTool.component
          ) : (
            <div className="coming-soon-wrapper">
              <div className="coming-soon-icon-bg">
                <Sparkles style={{ width: '40px', height: '40px', color: '#c084fc' }} className="animate-pulse-glow" />
              </div>
              <h2 className="coming-soon-title glow-text-primary">
                Đang phát triển thêm
              </h2>
              <p className="coming-soon-desc">
                Chúng tôi đang phát triển thêm các công cụ tuyệt vời khác như Trình định dạng JSON, Trình tạo CSS Glassmorphism và Đồng hồ tập trung Pomodoro. Hãy theo dõi nhé!
              </p>
              <button 
                onClick={() => setActiveToolId('youtube-downloader')}
                className="btn btn-primary"
              >
                Quay lại Trình tải YouTube
              </button>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
