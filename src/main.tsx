import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClientSubscribe } from '@tanstack/react-query-persist-client';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import zhCN from 'antd/locale/zh_CN';
import 'babel-polyfill';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'draft-js/dist/Draft.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App.tsx';
import './index.css';
dayjs.locale('zh-cn');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      cacheTime: Infinity,
      retry: false,
    },
  },
});
const persister = createSyncStoragePersister({ storage: window.localStorage });
// const persister = createSyncStoragePersister({ storage: window.localStorage });

persistQueryClientSubscribe({
  // @ts-ignore
  queryClient,
  persister: persister,
  maxAge: 1000 * 60 * 60 * 24 * 24, // 24 hours
  // dehydrateOptions: {
  //   dehydrateMutations: true,
  //   dehydrateQueries: true,
  // },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-center" reverseOrder={false} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);
