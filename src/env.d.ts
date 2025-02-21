/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_MAINNET: string
  readonly VITE_RPC_URL: string
  readonly VITE_TEST_RPC_URL: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 