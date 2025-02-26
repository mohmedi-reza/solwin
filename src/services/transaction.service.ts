import {
  TransactionResponse,
  determineTransactionType,
} from "../types/transaction.interface";
import apiClient from "./api.service";

export class TransactionService {
  private static readonly BASE_PATH = "/wallet/transactions";

  static async getTransactions(params: {
    limit?: number;
    before?: string;
    page?: number;
  }): Promise<TransactionResponse> {
    try {
      const { limit = 20, before, page = 1 } = params;
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(before && { before }),
      });

      const response = await apiClient.get<TransactionResponse>(
        `${this.BASE_PATH}?${queryParams}`
      );

      // Detailed logging of raw response
      console.log('=== Transaction Response Details ===');
      console.log('Full response:', response.data);
      console.log('Sample transaction:', response.data.data[0]);
      console.log('Program ID:', response.data.data[0]?.programId);
      console.log('Instruction details:', response.data.data[0]?.data);
      console.log('================================');

      if (!response.data.success) {
        throw new Error("Failed to fetch transactions");
      }

      // Process each transaction to determine its type if not already set
      if (response.data.success) {
        response.data.data = response.data.data.map((tx) => {
          const processedTx = {
            ...tx,
            type: determineTransactionType(tx),
          };
          return processedTx;
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
}
