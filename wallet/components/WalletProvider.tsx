import React from 'react';
import * as SorobanClient from 'soroban-client';
import { SorobanContext, SorobanContextType, defaultSorobanContext } from '..//soroban-react/';
import { ConnectorsList } from "../types";
import { WalletChain, } from '../WalletChainContext';

export interface WalletProviderProps {
  appName?: string;
  autoconnect?: boolean;
  chains: WalletChain[];
  children: React.ReactNode;
  connectors: ConnectorsList;
}

export function WalletProvider({
  appName,
  autoconnect = false,
  chains,
  children,
  connectors,
}: WalletProviderProps) {

  const flatWallets = connectors.flatMap(w => w.connectors);
  const activeWallet = flatWallets.length == 1 ? flatWallets[0] : undefined;
  const [sorobanContext, setSorobanContext] = React.useState<SorobanContextType>({
    ...defaultSorobanContext,
    appName,
    autoconnect,
    chains,
    connectors,
    activeWallet,
    activeChain: chains.length == 1 ? chains[0] : undefined,
    connect: async () => {
      let networkDetails = await sorobanContext.activeWallet?.getNetworkDetails()
      const supported = networkDetails && chains.find(c => c.networkPassphrase === networkDetails?.networkPassphrase)
      const activeChain = networkDetails && {
          id: supported?.id ?? networkDetails.networkPassphrase,
          name: supported?.name ?? networkDetails.network,
          networkPassphrase: networkDetails.networkPassphrase,
          iconBackground: supported?.iconBackground,
          iconUrl: supported?.iconUrl,
          unsupported: !supported,
      }
      let address = await sorobanContext.activeWallet?.getPublicKey()
      let server = networkDetails && new SorobanClient.Server(
        networkDetails.networkUrl,
        { allowHttp: networkDetails.networkUrl.startsWith("http://") }
      )
      setSorobanContext(c => ({
        ...c,
        activeChain,
        address,
        server,
      }));
    },
  });

  React.useEffect(() => {
    console.log("Something changing... in WalletProvider.tsx")
    if (sorobanContext.address) return;
    if (!sorobanContext.activeWallet) return;
    if (sorobanContext.autoconnect || sorobanContext.activeWallet.isConnected()) {
      sorobanContext.connect();
    }
  }, [sorobanContext.address, sorobanContext.activeWallet, sorobanContext.autoconnect]);


  return (
    <SorobanContext.Provider value={sorobanContext}>
      {children}
    </SorobanContext.Provider>
  );
}
