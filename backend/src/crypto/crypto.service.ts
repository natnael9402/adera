import { Injectable, Logger } from '@nestjs/common';

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private cache: CryptoData[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 60 * 1000; // 60 seconds

  async getPrices(): Promise<CryptoData[]> {
    const now = Date.now();
    
    // Return cached data if valid
    if (this.cache && (now - this.lastFetchTime < this.CACHE_TTL)) {
      return this.cache;
    }

    try {
      this.logger.log('Fetching live crypto prices from CoinGecko...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,usd-coin',
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      const data: CryptoData[] = await response.json();
      
      // Update cache
      this.cache = data;
      this.lastFetchTime = now;
      
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch crypto prices', error);
      
      // If fetch fails but we have stale cache, return it to prevent frontend errors
      if (this.cache) {
        this.logger.warn('Returning stale cached data due to fetch error');
        return this.cache;
      }
      
      // Return reliable fallback prices
      return [
        { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png", current_price: 67432, price_change_percentage_24h: 2.4 },
        { id: "ethereum", symbol: "eth", name: "Ethereum", image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png", current_price: 3521, price_change_percentage_24h: 1.8 },
        { id: "usd-coin", symbol: "usdc", name: "USDC", image: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png", current_price: 1.00, price_change_percentage_24h: 0.01 },
      ];
    }
  }
}
