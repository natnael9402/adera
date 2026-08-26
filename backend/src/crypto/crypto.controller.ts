import { Controller, Get } from '@nestjs/common';
import { CryptoService, CryptoData } from './crypto.service';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('prices')
  async getPrices(): Promise<CryptoData[]> {
    return this.cryptoService.getPrices();
  }
}
