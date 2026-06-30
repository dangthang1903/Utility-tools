import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dns from 'dns';

// Ưu tiên phân giải tên miền IPv4 trước để tránh lỗi 'fetch failed' liên quan đến IPv6 trên Node.js
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho phép frontend React kết nối
  app.enableCors();

  // Chạy trên cổng 3001 để tránh xung đột với cổng 3000 của các ứng dụng khác (như LIMS)
  await app.listen(process.env.PORT ?? 3009);
  console.log(`[NestJS Backend] Running on: http://localhost:3009`);
}
bootstrap();
