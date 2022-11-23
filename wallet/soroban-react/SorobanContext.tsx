import React, {createContext} from "react";
import * as SorobanClient from "soroban-client";
import { ChainMetadata } from "./provideWalletChains";
import { Connector, ConnectorsList } from "./Wallet";

export const defaultSorobanContext: SorobanContextType = {
  appName: undefined,
  chains: [],
  connectors: [],
  server: new SorobanClient.Server("https://soroban-rpc.stellar.org"),
  async connect() {},
};

export interface SorobanContextType {
  autoconnect?: boolean;
  appName?: string;
  chains: ChainMetadata[];
  connectors: ConnectorsList;
  activeChain?: ChainMetadata;
  address?: string;
  activeWallet?: Connector;
  server?: SorobanClient.Server;
  connect: () => Promise<void>;
  date: any
}

export const SorobanContext = createContext<SorobanContextType | undefined>(undefined)