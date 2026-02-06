import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import AppRoutes from './routes/AppRoutes';
import { AlertProvider, ConfirmProvider } from './components/ui';
import { I18nProvider } from './i18n';
import './styles/App.css';
import './styles/index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AlertProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ConfirmProvider>
          </AlertProvider>
        </I18nProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
