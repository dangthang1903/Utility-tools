import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dns from 'dns';

// Ưu tiên phân giải tên miền IPv4 trước để tránh lỗi 'fetch failed' liên quan đến IPv6 trên Node.js
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho phép frontend React kết nối
  app.enableCors();

  const port = process.env.PORT ?? 3100;
  await app.listen(port, '0.0.0.0');
  console.log(`[NestJS Backend] Running on: http://0.0.0.0:${port}`);
}
bootstrap();
