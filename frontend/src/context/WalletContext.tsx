'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'DONATION';
  amount: number;
  cryptoSymbol?: string;
  cryptoAmount?: string;
  txHash: string;
  causeId?: number | string;
  causeTitle?: string;
  status: 'CONFIRMED' | 'PENDING_VERIFICATION';
  paymentProof?: string;
  createdAt: string;
}

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  deposit: (data: {
    amountUsd: number;
    cryptoSymbol: string;
    cryptoAmount: string;
    txHash: string;
    paymentProof?: string;
  }) => Promise<void>;
  donateFromWallet: (data: {
    causeId: number | string;
    causeTitle: string;
    amountUsd: number;
    isAnonymous?: boolean;
    donorName?: string;
  }) => Promise<{ success: boolean; txHash: string; error?: string }>;
  refreshWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_BALANCE_KEY = 'adera_wallet_balance';
const STORAGE_TXS_KEY = 'adera_wallet_transactions';

const INITIAL_SAMPLE_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-init-1',
    type: 'DEPOSIT',
    amount: 150.00,
    cryptoSymbol: 'USDC',
    cryptoAmount: '150.00',
    txHash: '0x8f2a49b8192c7d9124be4c1e08924b12d7c001',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'tx-init-2',
    type: 'DONATION',
    amount: 50.00,
    cryptoSymbol: 'USDC',
    causeId: 33,
    causeTitle: 'Solar Water Filtration Well in Dire Dawa',
    txHash: '0x71a2e4c89110b98721c473fc4223a44d71facbe',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(100.00);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_SAMPLE_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage or default
  useEffect(() => {
    try {
      const savedBalance = localStorage.getItem(STORAGE_BALANCE_KEY);
      const savedTxs = localStorage.getItem(STORAGE_TXS_KEY);

      if (savedBalance !== null) {
        const parsed = parseFloat(savedBalance);
        if (!isNaN(parsed)) setBalance(parsed);
      } else {
        // Default seed balance for exciting instant testability
        setBalance(100.00);
        localStorage.setItem(STORAGE_BALANCE_KEY, '100.00');
      }

      if (savedTxs !== null) {
        const parsedTxs = JSON.parse(savedTxs);
        if (Array.isArray(parsedTxs) && parsedTxs.length > 0) {
          setTransactions(parsedTxs);
        }
      } else {
        localStorage.setItem(STORAGE_TXS_KEY, JSON.stringify(INITIAL_SAMPLE_TRANSACTIONS));
      }
    } catch (e) {
      console.warn('Failed to load wallet from storage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  const saveState = (newBalance: number, newTxs: WalletTransaction[]) => {
    setBalance(newBalance);
    setTransactions(newTxs);
    try {
      localStorage.setItem(STORAGE_BALANCE_KEY, newBalance.toFixed(2));
      localStorage.setItem(STORAGE_TXS_KEY, JSON.stringify(newTxs));
    } catch (e) {
      console.warn('Failed to write wallet to storage:', e);
    }
  };

  // Add Funds (Deposit)
  const deposit = async (data: {
    amountUsd: number;
    cryptoSymbol: string;
    cryptoAmount: string;
    txHash: string;
    paymentProof?: string;
  }) => {
    const newTx: WalletTransaction = {
      id: `tx-dep-${Date.now()}`,
      type: 'DEPOSIT',
      amount: data.amountUsd,
      cryptoSymbol: data.cryptoSymbol,
      cryptoAmount: data.cryptoAmount,
      txHash: data.txHash,
      status: data.paymentProof ? 'PENDING_VERIFICATION' : 'CONFIRMED',
      paymentProof: data.paymentProof,
      createdAt: new Date().toISOString(),
    };

    const nextBalance = balance + data.amountUsd;
    const nextTxs = [newTx, ...transactions];
    saveState(nextBalance, nextTxs);
  };

  // Donate Directly from Wallet Balance
  const donateFromWallet = async (data: {
    causeId: number | string;
    causeTitle: string;
    amountUsd: number;
    isAnonymous?: boolean;
    donorName?: string;
  }) => {
    if (balance < data.amountUsd) {
      return {
        success: false,
        txHash: '',
        error: `Insufficient wallet balance ($${balance.toFixed(2)} available). Please add funds to proceed.`,
      };
    }

    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const nextBalance = Math.max(0, balance - data.amountUsd);

    const newTx: WalletTransaction = {
      id: `tx-don-${Date.now()}`,
      type: 'DONATION',
      amount: data.amountUsd,
      cryptoSymbol: 'WALLET_USD',
      cryptoAmount: data.amountUsd.toFixed(2),
      causeId: data.causeId,
      causeTitle: data.causeTitle,
      txHash: mockTxHash,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    const nextTxs = [newTx, ...transactions];
    saveState(nextBalance, nextTxs);

    // Synchronize with backend API if valid cause
    try {
      const numericCauseId = typeof data.causeId === 'number' ? data.causeId : parseInt(String(data.causeId), 10);
      if (!isNaN(numericCauseId)) {
        await api.posts.donate(numericCauseId, {
          donorName: data.isAnonymous ? 'Anonymous Supporter' : (data.donorName || user?.name || 'Adera Wallet Donor'),
          donorEmail: user?.email,
          amountUsd: data.amountUsd,
          cryptoAmount: data.amountUsd.toFixed(2),
          cryptoSymbol: 'WALLET_USD',
          txHash: mockTxHash,
          isAnonymous: data.isAnonymous || false,
        });
      }
    } catch (err) {
      console.warn('Backend donation sync note (local balance deducted successfully):', err);
    }

    return {
      success: true,
      txHash: mockTxHash,
    };
  };

  const refreshWallet = useCallback(() => {
    try {
      const savedBalance = localStorage.getItem(STORAGE_BALANCE_KEY);
      if (savedBalance !== null) {
        const parsed = parseFloat(savedBalance);
        if (!isNaN(parsed)) setBalance(parsed);
      }
      const savedTxs = localStorage.getItem(STORAGE_TXS_KEY);
      if (savedTxs !== null) {
        setTransactions(JSON.parse(savedTxs));
      }
    } catch (e) {}
  }, []);

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        isLoading,
        deposit,
        donateFromWallet,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
