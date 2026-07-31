import React, { useState, useRef, useEffect } from 'react';
import { Search, Play, Pause, SkipForward, SkipBack, Music, Disc, ArrowLeft, Download } from 'lucide-react';

interface SearchResult {
  type: string;
  videoId?: string;
  albumId?: string;
  name: string;
  artist: { name: string };
  thumbnails: { url: string }[];
  duration?: number;
  year?: number;
}

interface AlbumDetails {
  albumId: string;
  name: string;
  artist: { name: string };
  thumbnails: { url: string }[];
  songs: SearchResult[];
}

export default function MusicPlayer() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'song' | 'album'>('song');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [viewingAlbum, setViewingAlbum] = useState<AlbumDetails | null>(null);
  const [loadingAlbum, setLoadingAlbum] = useState(false);

  const [currentSong, setCurrentSong] = useState<SearchResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const searchQuery = query.trim() || 'nhạc trẻ thịnh hành';
      setLoading(true);
      setError('');
      
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
        if (!res.ok) throw new Error('Không thể tìm kiếm');
        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tìm kiếm');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchType]);

  const handleAlbumClick = async (album: SearchResult) => {
    if (!album.albumId) return;
    setLoadingAlbum(true);
    try {
      const res = await fetch(`/api/music/album?id=${album.albumId}`);
      if (!res.ok) throw new Error('Không thể lấy chi tiết album');
      const data = await res.json();
      setViewingAlbum(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải album');
    } finally {
      setLoadingAlbum(false);
    }
  };

  const playSong = (song: SearchResult) => {
    if (song.videoId) {
      setCurrentSong(song);
      setIsPlaying(true);
      setIsBuffering(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.play().catch(e => console.error("Error playing audio", e));
      setIsPlaying(true);
    }
  }, [currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || currentSong?.duration || 1;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const duration = audioRef.current.duration || currentSong?.duration || 1;
      const seekTime = (parseFloat(e.target.value) / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
      setCurrentTime(seekTime);
    }
  };

  return (
    <div className="downloader-wrapper">
      <div className="downloader-header-section">
        <div className="header-icon-box" style={{ background: 'rgba(192, 132, 252, 0.1)' }}>
          <Music style={{ width: '40px', height: '40px', color: '#c084fc' }} />
        </div>
        <h1 className="header-title glow-text-primary">
          Trình Phát Nhạc
        </h1>
        <p className="header-desc">
          Tìm kiếm và phát nhạc trực tiếp từ YouTube Music với chất lượng tuyệt vời mà không cần tải về.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-spot-1" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(192,132,252,0.15) 0%, transparent 50%)', width: '300px', height: '300px' }} />
        <div className="glow-spot-2" style={{ background: 'radial-gradient(circle at 100% 100%, rgba(45,212,191,0.15) 0%, transparent 50%)', width: '300px', height: '300px' }} />
        
        {!viewingAlbum ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setSearchType('song')}
                  className={`btn ${searchType === 'song' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '0.875rem' }}
                >
                  <Music style={{ width: '16px', height: '16px' }} /> Bài hát
                </button>
                <button 
                  onClick={() => setSearchType('album')}
                  className={`btn ${searchType === 'album' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '0.875rem' }}
                >
                  <Disc style={{ width: '16px', height: '16px' }} /> Album
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={searchType === 'song' ? "Nhập tên bài hát, nghệ sĩ..." : "Nhập tên Album..."}
                  className="glass-input url-input-field"
                  style={{ width: '100%', paddingLeft: '56px', paddingRight: '56px', height: '56px', fontSize: '1.1rem', borderRadius: '28px' }}
                />
                {loading && (
                  <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
                    <div className="spinner-inner-ring" style={{ width: '20px', height: '20px', borderWidth: '2px', margin: 0 }} />
                  </div>
                )}
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>}
            
            {!query.trim() && results.length > 0 && (
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔥 {searchType === 'song' ? 'Bài Hát' : 'Album'} Thịnh Hành
              </h3>
            )}

            <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px', position: 'relative', zIndex: 1 }} className="custom-scrollbar">
              {results.map(item => (
                <div 
                  key={item.videoId || item.albumId} 
                  className={`tool-card ${currentSong?.videoId === item.videoId ? 'tool-card-active' : ''}`}
                  style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    padding: '12px', 
                    alignItems: 'center', 
                    cursor: 'pointer', 
                    background: currentSong?.videoId === item.videoId ? 'rgba(192, 132, 252, 0.1)' : undefined,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                  onClick={() => {
                    if (searchType === 'album') handleAlbumClick(item);
                    else playSong(item);
                  }}
                >
                  <img 
                    src={item.thumbnails[0]?.url} 
                    alt={item.name} 
                    style={{ width: searchType === 'album' ? '70px' : '60px', height: searchType === 'album' ? '70px' : '60px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#f8fafc' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                      {item.artist?.name || 'Unknown Artist'} {item.year ? `• ${item.year}` : ''}
                    </p>
                  </div>
                  {item.duration && (
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      {formatDuration(item.duration)}
                    </div>
                  )}
                  {searchType === 'album' && (
                    <div style={{ color: '#c084fc', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Disc style={{ width: '16px', height: '16px' }} />
                    </div>
                  )}
                </div>
              ))}
              
              {results.length === 0 && !loading && !error && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                  Không tìm thấy kết quả nào.
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' }}>
            <button 
              onClick={() => setViewingAlbum(null)}
              className="btn btn-secondary"
              style={{ alignSelf: 'flex-start', marginBottom: '20px', padding: '8px 16px', borderRadius: '20px' }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} /> Trở lại tìm kiếm
            </button>
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '24px' }}>
              <img 
                src={viewingAlbum.thumbnails[viewingAlbum.thumbnails.length - 1]?.url || viewingAlbum.thumbnails[0]?.url} 
                alt={viewingAlbum.name} 
                style={{ width: '150px', height: '150px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} 
              />
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#c084fc', fontWeight: 'bold' }}>Album</span>
                <h2 style={{ fontSize: '2rem', margin: '8px 0', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{viewingAlbum.name}</h2>
                <p style={{ margin: 0, fontSize: '1rem', color: '#94a3b8' }}>{viewingAlbum.artist?.name} • {viewingAlbum.songs.length} bài hát</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
              {viewingAlbum.songs.map((song, index) => (
                <div 
                  key={song.videoId || index} 
                  style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    padding: '12px 16px', 
                    alignItems: 'center', 
                    cursor: 'pointer', 
                    borderRadius: '8px',
                    background: currentSong?.videoId === song.videoId ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  className="album-song-row"
                  onClick={() => playSong(song)}
                >
                  <div style={{ width: '24px', textAlign: 'center', color: currentSong?.videoId === song.videoId ? '#c084fc' : '#94a3b8' }}>
                    {currentSong?.videoId === song.videoId ? <Play style={{ width: '16px', height: '16px' }} /> : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', color: currentSong?.videoId === song.videoId ? '#c084fc' : '#f8fafc' }}>{song.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>{song.artist?.name || viewingAlbum.artist?.name}</p>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    {formatDuration(song.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {loadingAlbum && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
          <div className="spinner-outer-ring">
            <div className="spinner-inner-ring" />
          </div>
        </div>
      )}

      {currentSong && (
        <div className="glass-panel" style={{ 
          marginTop: '24px', 
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          position: 'sticky',
          bottom: '24px',
          zIndex: 100,
          border: '1px solid rgba(192, 132, 252, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <img 
            src={currentSong.thumbnails?.[0]?.url || (viewingAlbum && viewingAlbum.thumbnails[0]?.url) || ''} 
            alt={currentSong.name} 
            style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} 
          />
          <div style={{ flex: 1, minWidth: 0, maxWidth: '250px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentSong.name}
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.artist?.name || viewingAlbum?.artist?.name}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: '40px', textAlign: 'right' }}>
              {formatDuration(currentTime)}
            </span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress || 0} 
              onChange={handleSeek}
              style={{ flex: 1, height: '4px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: '40px' }}>
              {formatDuration(currentSong.duration)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ padding: '10px', borderRadius: '50%' }} onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0; }}>
              <SkipBack style={{ width: '20px', height: '20px' }} />
            </button>
            <button onClick={togglePlay} className="btn btn-primary" style={{ padding: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px' }}>
              {isBuffering ? (
                <div className="spinner-inner-ring" style={{ width: '24px', height: '24px', borderWidth: '2px', margin: 0 }} />
              ) : isPlaying ? (
                <Pause style={{ width: '24px', height: '24px' }} />
              ) : (
                <Play style={{ width: '24px', height: '24px', marginLeft: '4px' }} />
              )}
            </button>
            <button className="btn btn-secondary" style={{ padding: '10px', borderRadius: '50%' }}>
              <SkipForward style={{ width: '20px', height: '20px' }} />
            </button>
            
            <a 
              href={`/api/music/download?videoId=${currentSong.videoId}&name=${encodeURIComponent(currentSong.name)}`}
              download
              className="btn btn-secondary" 
              style={{ padding: '10px', borderRadius: '50%', marginLeft: '8px' }}
              title="Tải bài hát này"
            >
              <Download style={{ width: '20px', height: '20px' }} />
            </a>
          </div>
          
          <audio 
            ref={audioRef} 
            src={`/api/music/stream?videoId=${currentSong.videoId}`}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onLoadStart={() => setIsBuffering(true)}
            autoPlay
          />
        </div>
      )}
    </div>
  );
}
