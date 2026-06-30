import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DownloadModule } from './download/download.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/download*', '/api/audio*'],
    }),
    DownloadModule,
    AudioModule,
  ],
})
export class AppModule {}
