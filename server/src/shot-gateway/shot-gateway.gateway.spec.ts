import { Test, TestingModule } from '@nestjs/testing';
import { ShotGatewayGateway } from './shot-gateway.gateway';

describe('ShotGatewayGateway', () => {
  let gateway: ShotGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShotGatewayGateway],
    }).compile();

    gateway = module.get<ShotGatewayGateway>(ShotGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
