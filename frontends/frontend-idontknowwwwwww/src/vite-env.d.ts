/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL du backend Portfolio Polyglotte, sans /api à la fin. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
