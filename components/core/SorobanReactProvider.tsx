import React, {useEffect, useRef} from 'react';
import * as SorobanClient from 'soroban-client';
import { Connector, WalletChain } from "@soroban-react/types";
import freighterApi from "@stellar/freighter-api";


import { SorobanContext, SorobanContextType, defaultSorobanContext } from './';
 
/**
 * @param children - A React subtree that needs access to the context.
 */

export interface SorobanReactProviderProps {
  appName?: string;
  autoconnect?: boolean;
  chains: WalletChain[];
  children: React.ReactNode;
  connectors: Connector[];
}

function networkToActiveChain(networkDetails: any, chains:any){
  const supported = networkDetails && chains.find((c: any) => c.networkPassphrase === networkDetails?.networkPassphrase)
  const activeChain = networkDetails && {
      id: supported?.id ?? networkDetails.networkPassphrase,
      name: supported?.name ?? networkDetails.network,
      networkPassphrase: networkDetails.networkPassphrase,
      iconBackground: supported?.iconBackground,
      iconUrl: supported?.iconUrl,
      unsupported: !supported,
  }
  return activeChain
}

export function SorobanReactProvider({
  appName,
  autoconnect = false,
  chains,
  children,
  connectors,
}: SorobanReactProviderProps) {


  const activeConnector = connectors.length == 1 ? connectors[0] : undefined;
  const isConnectedRef = useRef(false);

  const [mySorobanContext, setSorobanContext] = React.useState<SorobanContextType>({
    ...defaultSorobanContext,
    appName, 
    autoconnect,
    chains,
    connectors,
    activeConnector,
    activeChain: chains.length == 1 ? chains[0] : undefined,
    connect: async () => {
      let networkDetails = await mySorobanContext.activeConnector?.getNetworkDetails()

      if( ! chains.find((c: any) => c.networkPassphrase === networkDetails?.networkPassphrase)){
        const error = new Error("Your Wallet network is not supported in this app")
        throw error;
      }
      
      let activeChain = networkToActiveChain(networkDetails, chains)

      let address = await mySorobanContext.activeConnector?.getPublicKey()
      let server = networkDetails && new SorobanClient.Server(
        networkDetails.networkUrl,
        { allowHttp: networkDetails.networkUrl.startsWith("http://") }
      )

      // Now we can track that the wallet is finally connected
      isConnectedRef.current = true;
      
      setSorobanContext((c:any ) => ({
        ...c,
        activeChain,
        address,
        server,
      }));
    },
    disconnect: async () => {
      isConnectedRef.current = false;
      // TODO: Maybe reset address to undefined
      // TODO: Handle other things here, such as perhaps resetting address to undefined.
    }
  });

  // Handle changes of address/network in "realtime"
  React.useEffect(() => {
    let timeoutId: NodeJS.Timer | null = null;
    
    // If it turns out that requesting an update from Freighter is too taxing,
    // then this could be increased. Humans perceive 100ms response times as instantaneous
    // (source: https://www.pubnub.com/blog/how-fast-is-realtime-human-perception-and-technology/)
    // but you also have to consider the re-render time of components.
    const freighterCheckIntervalMs = 200;

    async function checkForWalletChanges () {
      // Returns if not installed / not active / not connected (TODO: currently always isConnected=true)
      if (!mySorobanContext.activeConnector || !mySorobanContext.activeConnector.isConnected() || !isConnectedRef.current || !mySorobanContext.activeChain) return;
      let hasNoticedWalletUpdate = false;

      try {
        let chain = networkToActiveChain(await mySorobanContext.activeConnector?.getNetworkDetails(), chains)
        
        // NOTICE: If the user logs out from or uninstalls the Freighter extension while they are connected
        // on this site, then a dialog will appear asking them to sign in again. We need a way to ask Freighter
        // if there is _any_ connected user, without actually asking them to sign in. Unfortunately, that is not
        // supported at this time; but it would be easy to submit a PR to the extension to add support for it.
        let address = await mySorobanContext.activeConnector?.getPublicKey();

        // TODO: If you want to know when the user has disconnected, then you can set a timeout for getPublicKey.
        // If it doesn't return in X milliseconds, you can be pretty confident that they aren't connected anymore.

        if (mySorobanContext.address !== address) {
          console.log("SorobanReactProvider: address changed from:", mySorobanContext.address," to: ", address);
          hasNoticedWalletUpdate = true;
          
          console.log("SorobanReactProvider: reconnecting")
          mySorobanContext.connect();

        } else if (mySorobanContext.activeChain.networkPassphrase != chain.networkPassphrase) {
            console.log(  "SorobanReactProvider: networkPassphrase changed from: ",
                          mySorobanContext.activeChain.networkPassphrase,
                          " to: ",
                          chain.networkPassphrase)
          hasNoticedWalletUpdate = true;

          console.log("SorobanReactProvider: reconnecting")
          mySorobanContext.connect();
        }
      } catch (error) {
        // I would recommend keeping the try/catch so that any exceptions in this async function
        // will get handled. Otherwise React could complain. I believe that eventually it may cause huge
        // problems, but that might be a NodeJS specific approach to exceptions not handled in promises.

        console.error("SorobanReactProvider: error: ", error);
      } finally {
        if (!hasNoticedWalletUpdate) timeoutId = setTimeout(checkForWalletChanges, freighterCheckIntervalMs);
      }
    }

    checkForWalletChanges();

    return () => {
      if (timeoutId != null) clearTimeout(timeoutId);
    }
  }, [mySorobanContext]);

  React.useEffect(() => {
    // TODO: When the page loads and the user is not signed in, this gets called twice
    // (due to the sorobanContext.activeWallet being seen as different by React), which causes
    // the Freighter window to appear twice.
    // I think an easy approach will be to use a ref in the connect function so that if it's already
    // trying to connect from somewhere else, then it doesn't try again
    // (since getPublicKey is what is causing the popup to appear)

    console.log("Something changing... in SorobanReactProvider.tsx")
    if (mySorobanContext.address) return;
    if (!mySorobanContext.activeConnector) return;

    if (mySorobanContext.autoconnect || mySorobanContext.activeConnector.isConnected()) {
      console.log("mySorobanContext.autoconnect: ", mySorobanContext.autoconnect)
      console.log("mySorobanContext.address: ", mySorobanContext.address)
      console.log("mySorobanContext.activeConnector.isConnected(): ", mySorobanContext.activeConnector.isConnected())
      freighterApi?.isConnected().then(result =>{
        console.log("freighterApi?.isConnected(): ", result)
      })
      // freighterApi?.getPublicKey().then(result =>{
      //   console.log("freighterApi?.getPublicKey(): ", result)
      // })
      // freighterApi?.getNetwork().then(result =>{
      //   console.log("freighterApi?.getNetwork(): ", result)
      // })
      // freighterApi?.getNetworkDetails().then(result =>{
      //   console.log("freighterApi?.getNetworkDetails(): ", result)
      // })
      freighterApi?.isAllowed().then(result =>{
        console.log("freighterApi?.isAllowed(): ", result)
      })
      //mySorobanContext.connect();
    }
  }, [mySorobanContext.activeConnector, mySorobanContext.autoconnect]);


  return (
    <SorobanContext.Provider value={mySorobanContext}>
      {children}
    </SorobanContext.Provider>
  );
}
