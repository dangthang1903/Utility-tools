import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DownloadModule } from './download/download.module';
import { AudioModule } from './audio/audio.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/download(.*)', '/api/(.*)'],
    }),
    DownloadModule,
    AudioModule,
    MusicModule,
  ],
})
export class AppModule {}
