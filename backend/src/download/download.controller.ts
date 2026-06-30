import { Controller, Post, Get, Body, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { DownloadService } from './download.service';
import * as express from 'express';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post()
  async downloadMedia(
    @Body() body: { 
      url: string; 
      videoQuality?: string; 
      isAudioOnly?: boolean; 
      audioBitrate?: string; 
    }
  ) {
    const { url, videoQuality, isAudioOnly, audioBitrate } = body;
    return this.downloadService.downloadMedia(url, videoQuality, isAudioOnly, audioBitrate);
  }

  @Get('stream')
  async streamMedia(
    @Query('url') url: string,
    @Query('format') formatStr: string,
    @Query('filename') filename: string,
    @Res() res: express.Response
  ) {
    if (!url || !formatStr) {
      throw new HttpException('Thiếu tham số url hoặc format.', HttpStatus.BAD_REQUEST);
    }
    
    // Giải mã tên file để hiển thị đúng tiếng Việt / ký tự đặc biệt
    const decodedFilename = filename ? decodeURIComponent(filename) : 'download';
    
    // Cấu hình header tải file
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(decodedFilename)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    try {
      await this.downloadService.pipeStream(url, formatStr, res);
    } catch (err) {
      if (!res.headersSent) {
        throw new HttpException(`Lỗi khi stream media: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
