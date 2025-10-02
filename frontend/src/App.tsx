import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from './components/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <PersistGate loading={<div className="flex items-center justify-center min-h-screen">Loading...</div>} persistor={persistor}>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-background">
            <MainLayout />
            <Toaster />
            <Sonner />
          </div>
        </TooltipProvider>
      </PersistGate>
    </Provider>
  </ErrorBoundary>
);

export default App;