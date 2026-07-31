import { Controller, Get, Query, Res, Req, HttpException, HttpStatus } from '@nestjs/common';
import { MusicService } from './music.service';
import type { Request, Response } from 'express';
import * as https from 'https';

@Controller('api/music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('search')
  async search(@Query('q') q: string, @Query('type') type: 'song' | 'album' = 'song') {
    if (!q) {
      throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.musicService.search(q, type);
    } catch (e: any) {
      console.error("Search error:", e);
      throw new HttpException(e.message || 'Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('album')
  async getAlbum(@Query('id') id: string) {
    if (!id) {
      throw new HttpException('Album ID is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.musicService.getAlbum(id);
    } catch (e: any) {
      console.error("Album fetch error:", e);
      throw new HttpException(e.message || 'Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stream')
  async stream(@Req() req: Request, @Query('videoId') videoId: string, @Res() res: Response) {
    if (!videoId) {
      throw new HttpException('videoId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const streamUrl = await this.musicService.getStreamUrl(videoId);
      
      const options: https.RequestOptions = {};
      if (req.headers.range) {
        options.headers = { Range: req.headers.range };
      }
      
      https.get(streamUrl, options, (audioStream) => {
        // Forward status and headers
        res.status(audioStream.statusCode || 200);
        
        // Pass essential headers for streaming and audio player
        const headersToPass = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
        for (const header of headersToPass) {
          if (audioStream.headers[header]) {
            res.setHeader(header, audioStream.headers[header] as string);
          }
        }
        
        audioStream.pipe(res);
      }).on('error', (err) => {
        console.error('Error fetching audio stream:', err);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error fetching audio stream');
        }
      });
    } catch (error) {
      if (!res.headersSent) {
        throw new HttpException('Failed to get audio stream', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get('download')
  async download(@Query('videoId') videoId: string, @Query('name') name: string, @Res() res: Response) {
    if (!videoId) {
      throw new HttpException('videoId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const streamUrl = await this.musicService.getStreamUrl(videoId);
      
      https.get(streamUrl, (audioStream) => {
        res.status(audioStream.statusCode || 200);
        
        const headersToPass = ['content-type', 'content-length'];
        for (const header of headersToPass) {
          if (audioStream.headers[header]) {
            res.setHeader(header, audioStream.headers[header] as string);
          }
        }
        
        const fileName = name || 'song';
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}.mp3`);
        
        audioStream.pipe(res);
      }).on('error', (err) => {
        console.error('Error fetching audio for download:', err);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error fetching audio for download');
        }
      });
    } catch (error) {
      if (!res.headersSent) {
        throw new HttpException('Failed to download audio', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
