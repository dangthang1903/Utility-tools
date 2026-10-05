import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as fs from 'fs';
import { join } from 'path';
import { DownloadModule } from './download/download.module';
import { AudioModule } from './audio/audio.module';
import { MusicModule } from './music/music.module';

function getFrontendDistPath(): string {
  if (process.env.FRONTEND_PATH && fs.existsSync(process.env.FRONTEND_PATH)) {
    return process.env.FRONTEND_PATH;
  }
  const rootRelative = join(process.cwd(), 'frontend', 'dist');
  if (fs.existsSync(rootRelative)) {
    return rootRelative;
  }
  return join(__dirname, '..', '..', 'frontend', 'dist');
}

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: getFrontendDistPath(),
      exclude: ['/download(.*)', '/api/(.*)'],
    }),
    DownloadModule,
    AudioModule,
    MusicModule,
  ],
})
export class AppModule {}
