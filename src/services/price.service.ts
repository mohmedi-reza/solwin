import axios from 'axios';

interface BinancePriceResponse {
  symbol: string;
  price: string;
}

export class PriceService {
  static BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price';

  static async getSolanaPrice(): Promise<number> {
    try {
      const response = await axios.get<BinancePriceResponse>(
        `${PriceService.BINANCE_API_URL}?symbol=SOLUSDT`
      );
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Error fetching Solana price:', error);
      throw error;
    }
  }
} 