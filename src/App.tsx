import "./App.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import WalletContextProvider from './providers/SOLWalletContextProvider'
import AppRoutes from "./routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletContextProvider>
        <AppRoutes />
      </WalletContextProvider>
    </QueryClientProvider>
  );
}

export default App;
