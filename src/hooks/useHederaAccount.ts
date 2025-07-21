import { useState, useEffect } from 'react';
import { HederaAccount } from '@/types/hedera';

const STORAGE_KEY = 'hedera_account';

export function useHederaAccount() {
  const [account, setAccount] = useState<HederaAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load account from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAccount(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored account:', err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveAccount = (accountData: HederaAccount) => {
    setAccount(accountData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accountData));
  };

  const clearAccount = () => {
    setAccount(null);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  };

  const connectAccount = async (accountId: string, privateKey: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual Hedera SDK integration
      // For now, we'll create a mock account
      const accountData: HederaAccount = {
        accountId,
        privateKey,
        balance: '0',
        tokens: []
      };
      
      saveAccount(accountData);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect account');
      setIsLoading(false);
      return false;
    }
  };

  return {
    account,
    isLoading,
    error,
    connectAccount,
    clearAccount,
    saveAccount
  };
}