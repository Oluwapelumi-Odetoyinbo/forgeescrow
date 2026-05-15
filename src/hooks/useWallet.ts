import { useCallback, useEffect, useState } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import toast from 'react-hot-toast';
import { WalletState } from '../types';
import {
  LITVM_CHAIN_ID,
  LITVM_EXPLORER_URL,
  LITVM_NETWORK_NAME,
  LITVM_RPC_URL,
} from '../config/contract';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const initialWallet: WalletState = {
  address: null,
  balance: '0',
  chainId: null,
  isConnected: false,
};

const toHexChainId = (chainId: number) => `0x${chainId.toString(16)}`;

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>(initialWallet);

  const refreshWallet = useCallback(async (address?: string) => {
    if (!window.ethereum) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = address
        ? [address]
        : ((await provider.send('eth_accounts', [])) as string[]);

      if (!accounts.length) {
        setWallet(initialWallet);
        return;
      }

      const network = await provider.getNetwork();

      // Balance fetch can fail on rate-limited RPCs — don't block connection
      let balance = '0';
      try {
        balance = (await provider.getBalance(accounts[0])).toString();
      } catch (balErr) {
        console.warn('Could not fetch balance (RPC may be rate-limited):', balErr);
      }

      setWallet({
        address: accounts[0],
        balance,
        chainId: Number(network.chainId),
        isConnected: true,
      });
    } catch (error) {
      console.error('Error refreshing wallet state:', error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this dApp');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = (await provider.send('eth_requestAccounts', [])) as string[];
      if (!accounts.length) {
        toast.error('No accounts returned from wallet');
        return;
      }

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Balance fetch can fail on rate-limited RPCs — don't block connection
      let balance = '0';
      try {
        balance = (await provider.getBalance(accounts[0])).toString();
      } catch (balErr) {
        console.warn('Could not fetch balance (RPC may be rate-limited):', balErr);
      }

      setWallet({
        address: accounts[0],
        balance,
        chainId,
        isConnected: true,
      });

      toast.success('Wallet connected');

      if (chainId !== LITVM_CHAIN_ID) {
        toast(`Connected to wrong network. Switch to ${LITVM_NETWORK_NAME}.`, {
          icon: '⚠️',
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error?.shortMessage || error?.message || 'Failed to connect wallet');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(initialWallet);
    toast.success('Wallet disconnected');
  }, []);

  const switchToLitVM = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('No wallet detected');
      return false;
    }

    const hexChainId = toHexChainId(LITVM_CHAIN_ID);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      toast.success(`Switched to ${LITVM_NETWORK_NAME}`);
      await refreshWallet();
      return true;
    } catch (switchError: any) {
      // 4902 = chain not added to MetaMask
      if (switchError?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChainId,
                chainName: LITVM_NETWORK_NAME,
                nativeCurrency: { name: 'zkLTC', symbol: 'zkLTC', decimals: 18 },
                rpcUrls: [LITVM_RPC_URL],
                blockExplorerUrls: [LITVM_EXPLORER_URL],
              },
            ],
          });
          toast.success(`Added ${LITVM_NETWORK_NAME}`);
          await refreshWallet();
          return true;
        } catch (addError: any) {
          console.error('Failed to add LitVM network:', addError);
          toast.error(addError?.message || 'Failed to add LitVM network');
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      toast.error(switchError?.message || 'Failed to switch network');
      return false;
    }
  }, [refreshWallet]);

  // Wire up MetaMask event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts.length) {
        setWallet(initialWallet);
      } else {
        void refreshWallet(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = Number(chainIdHex);
      setWallet((prev) => ({ ...prev, chainId }));
      void refreshWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Pick up an already-connected session on page load
    void refreshWallet();

    return () => {
      if (!window.ethereum) return;
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [refreshWallet]);

  const isWrongNetwork =
    wallet.isConnected && wallet.chainId !== null && wallet.chainId !== LITVM_CHAIN_ID;

  const formattedBalance = (() => {
    try {
      return Number(formatEther(wallet.balance || '0')).toFixed(4);
    } catch {
      return '0.0000';
    }
  })();

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchToLitVM,
    refreshWallet,
    isWrongNetwork,
    expectedChainId: LITVM_CHAIN_ID,
    expectedNetworkName: LITVM_NETWORK_NAME,
    formattedBalance,
  };
};
