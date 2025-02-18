import { useCallback, useMemo } from 'react'
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
import { clusterApiUrl } from '@solana/web3.js'
import {
  SolflareWalletAdapter,
  // SolletExtensionWalletAdapter,
  // SolletWalletAdapter,
  TorusWalletAdapter,
  PhantomWalletAdapter,
  LedgerWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets'

import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
  SolanaMobileWalletAdapter,
} from '@solana-mobile/wallet-adapter-mobile'

const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {

  const network = import.meta.env.VITE_IS_MAINNET === 'true' 
    ? WalletAdapterNetwork.Mainnet 
    : WalletAdapterNetwork.Devnet

  const endpoint = useMemo(() => {
    if (import.meta.env.VITE_IS_MAINNET === 'true') {
      return import.meta.env.VITE_RPC_URL || clusterApiUrl('mainnet-beta')
    }
    return import.meta.env.VITE_TEST_RPC_URL || clusterApiUrl('devnet')
  }, [])

  const wallets = useMemo(
    () => [
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolflareWalletAdapter(),
      // new SolletWalletAdapter({ network }),
      // new SolletExtensionWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new PhantomWalletAdapter(),
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          icon: '',
          name: '',
          uri: '',
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
        cluster: network
      }),
    ],
    [network]
  )

  const onError = useCallback<(error: WalletError, adapter?: Adapter) => void>(
    (error) => {
      console.error(error)
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
