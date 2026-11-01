import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';

const AuthCallback = lazy(() => import('./auth/AuthCallback').then((module) => ({ default: module.AuthCallback })));
const AuthPage = lazy(() => import('./auth/AuthPage').then((module) => ({ default: module.AuthPage })));
const PasswordUpdatePage = lazy(() => import('./auth/PasswordUpdatePage').then((module) => ({ default: module.PasswordUpdatePage })));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage').then((module) => ({ default: module.WorkspacePage })));

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<main className="screen-loader" aria-label="Loading Karacter AI"><span className="loader-orb" /></main>}>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/update-password" element={<PasswordUpdatePage />} />
            <Route path="/" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
