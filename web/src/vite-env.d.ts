/// <reference types="vite/client" />
//  define import.meta.env  intelligence

interface ImportMetaEnv {
  readonly __APP__name: string;
  readonly __APP__baseURL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace process {
  const env: Record<string, string>;
}
