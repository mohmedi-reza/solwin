import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../configs/firebaseConfig';
import { GameData, GameType } from '../types/game';
import { GameHistory, Transaction, UserProfile } from '../types/user';

export class UserService {
  private static USERS_COLLECTION = 'users';

  static async getUserByWallet(walletAddress: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, walletAddress));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async createUser(walletAddress: string): Promise<UserProfile> {
    try {
      const newUser: UserProfile = {
        id: walletAddress,
        username: null,
        avatar: null,
        createdAt: new Date(),
        lastLogin: new Date(),
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          totalBets: 0,
          totalWinnings: 0,
          highestWin: 0,
          lastGamePlayed: new Date(),
          winRate: 0,
          totalWagered: 0,
          netProfit: 0,
          favoriteGame: '',
          gamesPlayed: {
            poker: 0,
            crash: 0,
          }
        },
        gameHistory: [],
        transactions: [],
        preferences: {
          theme: 'system',
          soundEnabled: true,
          notifications: true,
          autoExitCrash: false,
          defaultBetAmount: 0.1,
        },
        balance: {
          available: 0,
          locked: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
        },
        activeGame: null,
      };

      await setDoc(doc(db, this.USERS_COLLECTION, walletAddress), newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getOrCreateUser(walletAddress: string): Promise<UserProfile> {
    try {
      const existingUser = await this.getUserByWallet(walletAddress);
      if (existingUser) {
        // Update last login
        await this.updateLastLogin(walletAddress);
        return existingUser;
      }
      return await this.createUser(walletAddress);
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      throw error;
    }
  }

  static async updateLastLogin(walletAddress: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, walletAddress), {
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  static async addGameToHistory(
    walletAddress: string,
    gameType: GameType,
    gameData: GameData
  ): Promise<void> {
    try {
      const gameHistory: GameHistory = {
        id: crypto.randomUUID(),
        gameType,
        startedAt: new Date(),
        endedAt: new Date(),
        bet: gameData.bet,
        result: gameData.result || 0,
        profit: gameData.profit || 0,
      };

      const userRef = doc(db, this.USERS_COLLECTION, walletAddress);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const updatedHistory = [...userData.gameHistory, gameHistory];
        
        // Update user stats
        const stats = userData.stats;
        stats.totalGames += 1;
        stats.gamesPlayed[gameType] += 1;
        stats.totalBets += gameData.bet;
        stats.lastGamePlayed = new Date();
        
        if (gameData.profit && gameData.profit > 0) {
          stats.wins += 1;
          stats.totalWinnings += gameData.profit;
          stats.highestWin = Math.max(stats.highestWin, gameData.profit);
        } else {
          stats.losses += 1;
        }
        
        stats.winRate = (stats.wins / stats.totalGames) * 100;
        stats.netProfit = stats.totalWinnings - stats.totalWagered;

        await updateDoc(userRef, {
          gameHistory: updatedHistory,
          stats,
        });
      }
    } catch (error) {
      console.error('Error adding game to history:', error);
      throw error;
    }
  }

  static async updateUserBalance(
    walletAddress: string,
    amount: number,
    type: Transaction['type']
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, walletAddress);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const balance = userData.balance;

        switch (type) {
          case 'deposit':
            balance.available += amount;
            balance.totalDeposited += amount;
            break;
          case 'withdraw':
            balance.available -= amount;
            balance.totalWithdrawn += amount;
            break;
          case 'bet':
            balance.available -= amount;
            balance.locked += amount;
            break;
          case 'win':
            balance.locked -= amount;
            balance.available += amount;
            break;
        }

        await updateDoc(userRef, { balance });
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }
} 