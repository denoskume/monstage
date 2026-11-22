import { HashRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';
import { ProtectedApp } from '../auth/ProtectedApp';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </HashRouter>
  );
}
