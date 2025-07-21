import { useState, useEffect } from 'react';
import { 
  Client, 
  AccountId, 
  PrivateKey, 
  AccountBalanceQuery,
  AccountInfoQuery,
  TransferTransaction,
  Hbar,
  TokenCreateTransaction,
  TokenAssociateTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId
} from '@hashgraph/sdk';
import { HederaAccount, TransactionResult, TokenCreationResult, TopicCreationResult, TopicMessageResult } from '@/types/hedera';

const STORAGE_KEY = 'hedera_account';

export function useHederaAccount() {
  const [account, setAccount] = useState<HederaAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    // Load account from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const accountData = JSON.parse(stored);
        setAccount(accountData);
        // Initialize client with stored credentials
        initializeClient(accountData.accountId, accountData.privateKey);
      } catch (err) {
        console.error('Failed to parse stored account:', err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const initializeClient = (accountId: string, privateKey: string) => {
    try {
      const newClient = Client.forTestnet();
      const operatorAccountId = AccountId.fromString(accountId);
      const operatorKey = PrivateKey.fromStringECDSA(privateKey);
      
      newClient.setOperator(operatorAccountId, operatorKey);
      setClient(newClient);
      return newClient;
    } catch (err) {
      console.error('Failed to initialize Hedera client:', err);
      throw new Error('Invalid credentials');
    }
  };

  const refreshAccountInfo = async (): Promise<void> => {
    if (!account || !client) return;

    try {
      setIsLoading(true);
      
      // Get account balance
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(account.accountId);
      
      const balance = await balanceQuery.execute(client);
      
      // Get account info for tokens
      const accountInfoQuery = new AccountInfoQuery()
        .setAccountId(account.accountId);
      
      const info = await accountInfoQuery.execute(client);
      
      const tokens = info.tokenRelationships ? 
        Object.entries(info.tokenRelationships).map(([tokenId, relationship]) => ({
          tokenId,
          balance: relationship?.balance?.toString() || '0',
          name: undefined,
          symbol: undefined,
          decimals: relationship?.decimals || 0
        })) : [];

      const updatedAccount = {
        ...account,
        balance: balance.hbars.toString(),
        tokens
      };

      saveAccount(updatedAccount);
    } catch (err) {
      console.error('Failed to refresh account info:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh account');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAccount = (accountData: HederaAccount) => {
    setAccount(accountData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accountData));
  };

  const clearAccount = () => {
    setAccount(null);
    setClient(null);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  };

  const connectAccount = async (accountId: string, privateKey: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newClient = initializeClient(accountId, privateKey);
      
      // Test the connection by getting account balance
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(accountId);
      
      const balance = await balanceQuery.execute(newClient);
      
      // Get account info for tokens
      const accountInfoQuery = new AccountInfoQuery()
        .setAccountId(accountId);
      
      const info = await accountInfoQuery.execute(newClient);
      
      const tokens = info.tokenRelationships ? 
        Object.entries(info.tokenRelationships).map(([tokenId, relationship]) => ({
          tokenId,
          balance: relationship?.balance?.toString() || '0',
          name: undefined,
          symbol: undefined,
          decimals: relationship?.decimals || 0
        })) : [];

      const accountData: HederaAccount = {
        accountId,
        privateKey,
        balance: balance.hbars.toString(),
        tokens
      };
      
      saveAccount(accountData);
      setClient(newClient);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect account');
      setIsLoading(false);
      return false;
    }
  };

  const sendHbar = async (recipientId: string, amount: string): Promise<TransactionResult> => {
    if (!client || !account) {
      throw new Error('Client not initialized');
    }

    try {
      const transferTransaction = new TransferTransaction()
        .addHbarTransfer(account.accountId, Hbar.fromTinybars(-parseFloat(amount) * 100000000))
        .addHbarTransfer(recipientId, Hbar.fromTinybars(parseFloat(amount) * 100000000))
        .freezeWith(client);

      const response = await transferTransaction.execute(client);
      const receipt = await response.getReceipt(client);

      await refreshAccountInfo();

      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString(),
        message: receipt.status.toString() === 'SUCCESS' ? 'HBAR sent successfully' : 'Transaction failed',
        receipt
      };
    } catch (err) {
      return {
        success: false,
        transactionId: '',
        message: err instanceof Error ? err.message : 'Failed to send HBAR'
      };
    }
  };

  const createToken = async (name: string, symbol: string, supply: string): Promise<TokenCreationResult> => {
    if (!client || !account) {
      throw new Error('Client not initialized');
    }

    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setDecimals(0)
        .setInitialSupply(parseInt(supply))
        .setTreasuryAccountId(account.accountId)
        .setAdminKey(PrivateKey.fromStringECDSA(account.privateKey))
        .setSupplyKey(PrivateKey.fromStringECDSA(account.privateKey))
        .freezeWith(client);

      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);

      await refreshAccountInfo();

      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString(),
        message: receipt.status.toString() === 'SUCCESS' ? 'Token created successfully' : 'Token creation failed',
        tokenId: receipt.tokenId?.toString(),
        receipt
      };
    } catch (err) {
      return {
        success: false,
        transactionId: '',
        message: err instanceof Error ? err.message : 'Failed to create token'
      };
    }
  };

  const associateToken = async (tokenId: string): Promise<TransactionResult> => {
    if (!client || !account) {
      throw new Error('Client not initialized');
    }

    try {
      const transaction = new TokenAssociateTransaction()
        .setAccountId(account.accountId)
        .setTokenIds([tokenId])
        .freezeWith(client);

      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);

      await refreshAccountInfo();

      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString(),
        message: receipt.status.toString() === 'SUCCESS' ? 'Token associated successfully' : 'Token association failed',
        receipt
      };
    } catch (err) {
      return {
        success: false,
        transactionId: '',
        message: err instanceof Error ? err.message : 'Failed to associate token'
      };
    }
  };

  const sendToken = async (recipientId: string, tokenId: string, amount: string): Promise<TransactionResult> => {
    if (!client || !account) {
      throw new Error('Client not initialized');
    }

    try {
      const transaction = new TransferTransaction()
        .addTokenTransfer(tokenId, account.accountId, -parseInt(amount))
        .addTokenTransfer(tokenId, recipientId, parseInt(amount))
        .freezeWith(client);

      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);

      await refreshAccountInfo();

      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString(),
        message: receipt.status.toString() === 'SUCCESS' ? 'Token sent successfully' : 'Token transfer failed',
        receipt
      };
    } catch (err) {
      return {
        success: false,
        transactionId: '',
        message: err instanceof Error ? err.message : 'Failed to send token'
      };
    }
  };

  const createTopic = async (memo: string, isPrivate: boolean): Promise<TopicCreationResult> => {
    if (!client || !account) {
      throw new Error('Client not initialized');
    }

    try {
      let transaction = new TopicCreateTransaction()
        .setTopicMemo(memo);

      if (isPrivate) {
        transaction = transaction.setSubmitKey(PrivateKey.fromStringECDSA(account.privateKey));
      }

      transaction = transaction.freezeWith(client);

      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);

      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString(),
        message: receipt.status.toString() === 'SUCCESS' ? 'Topic created successfully' : 'Topic creation failed',
        topicId: receipt.topicId?.toString(),
        receipt
      };
    } catch (err) {
      return {
        success: false,
        transactionId: '',
        message: err instanceof Error ? err.message : 'Failed to create topic'
      };
    }
  };

  const sendTopicMessage = async (topicId: string, message: string): Promise<TopicMessageResult> => {
    if (!client || !account) {
      throw new Error('Client not initialized');
    }

    try {
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(message)
        .freezeWith(client);

      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);

      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString(),
        message: receipt.status.toString() === 'SUCCESS' ? 'Message sent successfully' : 'Message sending failed',
        sequenceNumber: receipt.topicSequenceNumber?.toNumber(),
        receipt
      };
    } catch (err) {
      return {
        success: false,
        transactionId: '',
        message: err instanceof Error ? err.message : 'Failed to send message'
      };
    }
  };

  return {
    account,
    isLoading,
    error,
    client,
    connectAccount,
    clearAccount,
    saveAccount,
    refreshAccountInfo,
    sendHbar,
    createToken,
    associateToken,
    sendToken,
    createTopic,
    sendTopicMessage
  };
}