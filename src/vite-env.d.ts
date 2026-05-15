/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_LITVM_CHAIN_ID?: string;
  readonly VITE_LITVM_RPC_URL?: string;
  readonly VITE_LITVM_EXPLORER_URL?: string;
  readonly VITE_LITVM_NETWORK_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
