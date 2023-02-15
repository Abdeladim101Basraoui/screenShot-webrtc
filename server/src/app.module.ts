import { Module } from '@nestjs/common';
import { ShotGatewayGateway } from './shot-gateway/shot-gateway.gateway';
@Module({
  imports: [],
  controllers: [],
  providers: [ShotGatewayGateway],
})
export class AppModule {}
