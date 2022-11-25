import { WalletChain } from './WalletChainContext';
import { ConnectorList } from '@soroban-react/types';
import { freighter } from './connectors';

export const getDefaultConnectors = (
  {appName,chains,}: {appName: string; chains: WalletChain[];})
    : {

  connectors: ConnectorList;} => {
  const connectors: ConnectorList = [
    {
      groupName: 'Popular',
      connectors: [
        freighter({ appName, chains }),
      ],
    },
  ];

  return {
    connectors,
  };
};
