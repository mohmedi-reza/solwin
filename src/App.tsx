import "./App.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import WalletContextProvider from './providers/SOLWalletContextProvider'
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          theme="dark"
          pauseOnHover
        />
        <AppRoutes />
      </WalletContextProvider>
    </QueryClientProvider>

  );
}

export default App;
