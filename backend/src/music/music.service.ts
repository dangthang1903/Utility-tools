import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
// @ts-ignore
const YTMusic = require('ytmusic-api');
import youtubedl from 'youtube-dl-exec';

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);
  private ytmusic: any;
  private isInitialized = false;

  constructor() {
    this.ytmusic = new YTMusic();
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.ytmusic.initialize();
      this.isInitialized = true;
    }
  }

  async search(query: string, type: 'song' | 'album' = 'song') {
    await this.ensureInitialized();
    
    if (type === 'album') {
      const results = await this.ytmusic.searchAlbums(query);
      return results.slice(0, 15);
    }
    
    const results = await this.ytmusic.search(query);
    // Filter out only songs or videos (not playlists/artists)
    return results.filter((item: any) => item.type === 'SONG' || item.type === 'VIDEO').slice(0, 15);
  }

  async getAlbum(albumId: string) {
    await this.ensureInitialized();
    return await this.ytmusic.getAlbum(albumId);
  }

  private getCookiesFilePath(): string | null {
    if (process.env.YOUTUBE_COOKIES_PATH && fs.existsSync(process.env.YOUTUBE_COOKIES_PATH)) {
      return process.env.YOUTUBE_COOKIES_PATH;
    }
    const cookieContent = process.env.YOUTUBE_COOKIES_CONTENT || process.env.YOUTUBE_COOKIES;
    if (cookieContent && cookieContent.trim().length > 0) {
      const cookieFilePath = path.join(os.tmpdir(), 'youtube_cookies.txt');
      try {
        fs.writeFileSync(cookieFilePath, cookieContent.trim(), 'utf-8');
        return cookieFilePath;
      } catch (err: any) {
        this.logger.error(`Failed to write cookies file: ${err.message}`);
      }
    }
    const localCookieRoot = path.join(process.cwd(), 'cookies.txt');
    if (fs.existsSync(localCookieRoot)) {
      return localCookieRoot;
    }
    return null;
  }

  async getStreamUrl(videoId: string): Promise<string> {
    try {
      const options: any = {
        getUrl: true,
        format: 'bestaudio',
        noWarnings: true,
        noCheckCertificates: true,
        extractorArgs: 'youtube:player_client=ios,android,web',
      };
      const cookiePath = this.getCookiesFilePath();
      if (cookiePath) {
        options.cookies = cookiePath;
      }
      const url = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, options);
      // The exec command returns string type but typed as generic, need to ensure string
      return (url as unknown as string).trim();
    } catch (error) {
      this.logger.error(`Failed to get stream url for ${videoId}`, error);
      throw error;
    }
  }
}
