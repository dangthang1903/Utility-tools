import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Require is safer for fluent-ffmpeg in NestJS
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  async processAudio(
    action: string, 
    files: Express.Multer.File[], 
    options: { startTime?: string, endTime?: string, bitrate?: string }
  ): Promise<string> {
    const tempDir = os.tmpdir();
    const sessionId = Date.now().toString() + '_' + Math.floor(Math.random() * 10000);
    
    // Save buffers to temp files
    const inputPaths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const p = path.join(tempDir, `input_${sessionId}_${i}.mp3`);
      fs.writeFileSync(p, files[i].buffer);
      inputPaths.push(p);
    }

    const outputPath = path.join(tempDir, `output_${sessionId}.mp3`);

    return new Promise((resolve, reject) => {
      try {
        let command = ffmpeg();

        if (action === 'merge') {
          inputPaths.forEach(p => command.input(p));
          command
            .on('error', (err: any) => {
              this.logger.error('FFmpeg merge error', err);
              reject(new Error('Failed to merge audio files: ' + err.message));
            })
            .on('end', () => {
              resolve(outputPath);
            })
            .mergeToFile(outputPath, tempDir);
            
        } else {
          // Trim or Compress (single file)
          if (inputPaths.length === 0) return reject(new Error('No input file'));
          
          command = command.input(inputPaths[0]);

          if (action === 'trim') {
            if (options.startTime) {
              command.setStartTime(options.startTime);
            }
            if (options.endTime) {
              // Add -to option to specify end time directly
              command.outputOptions([`-to ${options.endTime}`]);
            }
          } else if (action === 'compress') {
            if (options.bitrate) {
              const br = options.bitrate.replace('k', '');
              command.audioBitrate(br);
            }
          }

          command
            .on('error', (err: any) => {
              this.logger.error('FFmpeg process error', err);
              reject(new Error('Failed to process audio: ' + err.message));
            })
            .on('end', () => {
              resolve(outputPath);
            })
            .save(outputPath);
        }
      } catch (err: any) {
        reject(err);
      }
    });
  }
}
