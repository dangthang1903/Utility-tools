import { 
  Controller, 
  Post, 
  UploadedFiles, 
  UseInterceptors, 
  Body, 
  Res,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';
import type { Response } from 'express';
import * as multer from 'multer';

@Controller('api/audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('process')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  }))
  async processAudio(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Res() res: Response
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

    const { action, startTime, endTime, bitrate } = body;

    try {
      const resultPath = await this.audioService.processAudio(action, files, {
        startTime,
        endTime,
        bitrate
      });

      res.download(resultPath, 'processed_audio.mp3', (err) => {
        // Cleanup after send could be done here, but usually best to clean up via background job or after response finishes
        if (err) {
          console.error("Error sending file:", err);
        }
      });
    } catch (error: any) {
      console.error("Audio processing error:", error);
      throw new HttpException(error.message || 'Processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
