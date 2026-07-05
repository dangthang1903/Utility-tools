import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import youtubedl from 'youtube-dl-exec';
import * as express from 'express';

const DEFAULT_COBALT_INSTANCES = [
  'https://api.cobalt.tools',
  'https://cobalt.api.ryz.cx',
  'https://co.wuk.sh',
  'https://cobalt.k6.ovh',
  'https://api.cobalt.best'
];

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  // Lấy danh sách máy chủ API Cobalt từ tracker
  async getLiveInstances(): Promise<string[]> {
    try {
      this.logger.log('Fetching live instances from instances.cobalt.best...');
      const response = await fetch('https://instances.cobalt.best/api/instances.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch instances tracker: ${response.statusText}`);
      }
      const data: any = await response.json();
      
      const liveUrls = data
        .filter((inst: any) => inst.api_online)
        .map((inst: any) => inst.api);

      if (liveUrls && liveUrls.length > 0) {
        return Array.from(new Set([...liveUrls, ...DEFAULT_COBALT_INSTANCES]));
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch dynamic instances: ${error.message}. Using defaults.`);
    }
    return DEFAULT_COBALT_INSTANCES;
  }

  // Tải qua Cobalt API trung gian (dùng cho 1080p vì cần ghép Video + Audio bằng FFmpeg của Cobalt)
  async downloadViaCobalt(
    url: string,
    videoQuality?: string,
    isAudioOnly?: boolean,
    audioBitrate?: string
  ): Promise<any> {
    const liveInstances = await this.getLiveInstances();
    
    const payload: Record<string, any> = {
      url: url.trim(),
      filenamePattern: 'pretty'
    };

    if (isAudioOnly) {
      payload.isAudioOnly = true;
      payload.audioFormat = 'mp3';
      payload.audioBitrate = audioBitrate || '320';
    } else {
      payload.isAudioOnly = false;
      payload.videoQuality = videoQuality || '1080';
    }

    const endpointsToTry: string[] = [];
    for (const baseApi of liveInstances) {
      if (!baseApi) continue;
      const cleanBase = baseApi.replace(/\/$/, '');
      endpointsToTry.push(`${cleanBase}/api/json`); // v7
      endpointsToTry.push(`${cleanBase}/`);         // v8
      endpointsToTry.push(cleanBase);
    }

    let lastError = '';
    for (const endpoint of endpointsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      try {
        this.logger.log(`[Cobalt Fallback] Connecting to: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://cobalt.tools',
            'Referer': 'https://cobalt.tools/'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          this.logger.warn(`Server ${endpoint} returned error: ${errText}`);
          let parsedError = `HTTP Error ${response.status}`;
          try {
            const errObj = JSON.parse(errText);
            parsedError = errObj.text || errObj.error?.code || parsedError;
          } catch (e) {}
          throw new Error(parsedError);
        }

        const data: any = await response.json();
        
        if (data.status === 'error') {
          throw new Error(data.error?.code || data.text || 'API return error state');
        }

        if (data.status === 'redirect' || data.status === 'tunnel' || data.url) {
          this.logger.log(`[Cobalt Fallback] Success with: ${endpoint}`);
          return data;
        } else if (data.status === 'picker') {
          if (data.picker && data.picker.length > 0) {
            return {
              status: 'redirect',
              url: data.picker[0].url,
              filename: data.picker[0].filename || 'Youtube_Media_Download'
            };
          }
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err.name === 'AbortError' ? 'Connection Timeout (12s)' : err.message;
        this.logger.warn(`Failed connecting to ${endpoint}: ${lastError}`);
      }
    }

    throw new Error(lastError || 'Không thể kết nối đến máy chủ Cobalt nào.');
  }

  // Tải nội dung media (Đa chế độ: Tải cục bộ bằng ytdl-core, hoặc fallback sang Cobalt)
  async downloadMedia(
    url: string,
    videoQuality?: string,
    isAudioOnly?: boolean,
    audioBitrate?: string
  ): Promise<any> {
    if (!url) {
      throw new HttpException('Đường dẫn URL không được trống.', HttpStatus.BAD_REQUEST);
    }

    const cleanUrl = url.trim();

    // 1. Trường hợp 1080p: Luôn thử Cobalt trước (vì ytdl-core không gộp được video/audio 1080p nếu thiếu FFmpeg cục bộ)
    if (!isAudioOnly && videoQuality === '1080') {
      try {
        this.logger.log('1080p requested. Trying Cobalt API fallback first...');
        const result = await this.downloadViaCobalt(cleanUrl, videoQuality, isAudioOnly, audioBitrate);
        return result;
      } catch (err) {
        this.logger.warn(`Cobalt download failed for 1080p: ${err.message}. Falling back to local 720p extraction...`);
        // Fallback tự động xuống tải 720p cục bộ (để người dùng luôn tải được file xem được)
        return this.downloadLocally(cleanUrl, '720', false);
      }
    }

    // 2. Các trường hợp khác (720p, 360p, 240p, 144p hoặc Âm thanh): Tải cục bộ bằng ytdl-core cho ổn định 100%
    try {
      this.logger.log(`Extracting stream locally for ${isAudioOnly ? 'audio' : videoQuality + 'p'}...`);
      return await this.downloadLocally(cleanUrl, videoQuality || '720', !!isAudioOnly);
    } catch (err) {
      this.logger.warn(`Local extraction failed: ${err.message}. Trying Cobalt API fallback as last resort...`);
      // Nếu tải cục bộ lỗi (ví dụ: thuật toán signature thay đổi chưa update), fallback ngược sang Cobalt
      try {
        return await this.downloadViaCobalt(cleanUrl, videoQuality, isAudioOnly, audioBitrate);
      } catch (cobaltErr) {
        throw new HttpException(
          `Không thể tải video bằng cả phương thức cục bộ và dự phòng.\n\nChi tiết lỗi cục bộ: "${err.message}"\nChi tiết lỗi dự phòng: "${cobaltErr.message}"`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  // Tải trực tiếp bằng yt-dlp (qua youtube-dl-exec)
  private async downloadLocally(url: string, videoQuality: string, isAudioOnly: boolean): Promise<any> {
    const info: any = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      noPlaylist: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const title = info.title || 'Youtube_Download';
    const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '_'); // Xóa ký tự lỗi tên file

    let formatSelection = 'best';
    let ext = 'mp4';

    if (isAudioOnly) {
      // Tìm định dạng audio tốt nhất
      formatSelection = 'bestaudio[ext=m4a]/bestaudio';
      ext = 'm4a';
    } else {
      // Tìm định dạng Video + Audio kết hợp (combined format)
      const targetHeight = parseInt(videoQuality, 10);
      formatSelection = `bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`;
    }

    const filename = `${cleanTitle}.${ext}`;
    
    // Tạo đường dẫn redirect dạng tương đối để thông qua proxy của frontend (Vite)
    const streamUrl = `/download/stream?url=${encodeURIComponent(url)}&format=${encodeURIComponent(formatSelection)}&filename=${encodeURIComponent(filename)}`;
    
    return {
      status: 'redirect',
      url: streamUrl,
      filename: filename
    };
  }

  // Phương thức pipe stream dữ liệu trực tiếp về Express Response
  async pipeStream(url: string, formatId: string, res: express.Response): Promise<void> {
    this.logger.log(`[Piping Stream] Starting yt-dlp stream for format ${formatId}...`);
    
    const subprocess = youtubedl.exec(url, {
      format: formatId,
      output: '-', // Ghi luồng trực tiếp ra stdout
      noCheckCertificates: true,
      noWarnings: true,
      noPlaylist: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    if (subprocess.stdout) {
      subprocess.stdout.pipe(res);
    }

    if (subprocess.stderr) {
      subprocess.stderr.on('data', (data) => {
        // this.logger.debug(`yt-dlp stderr: ${data.toString()}`);
      });
    }

    return new Promise((resolve, reject) => {
      subprocess.on('close', (code) => {
        if (code === 0) {
          this.logger.log('[Piping Stream] Stream finished successfully.');
          resolve();
        } else {
          this.logger.warn(`[Piping Stream] Stream closed with code ${code}`);
          resolve(); // Resolve anyway because response might have been successfully piped partially
        }
      });
      subprocess.on('error', (err) => {
        this.logger.error(`[Piping Stream] Error: ${err.message}`);
        reject(err);
      });
    });
  }
}
