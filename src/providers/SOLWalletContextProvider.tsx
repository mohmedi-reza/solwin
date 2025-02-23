import { useCallback, useMemo, ReactNode } from 'react'
import {
  Adapter,
  WalletAdapterNetwork,
  WalletError,
} from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  SolflareWalletAdapter,
  TorusWalletAdapter,
  PhantomWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
  SolanaMobileWalletAdapter,
} from '@solana-mobile/wallet-adapter-mobile'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletContextProviderProps {
  children: ReactNode
}

const WalletContextProvider = ({ children }: WalletContextProviderProps) => {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new LedgerWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new PhantomWalletAdapter(),
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          icon: 'favicon.ico',
          name: 'RocketBet',
          uri: 'http://localhost:5173/',
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
        cluster: network
      }),
    ],
    [network]
  )

  const onError = useCallback(
    (error: WalletError, adapter?: Adapter) => {
      console.error('Wallet error:', error, adapter?.name)
    },
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletContextProvider