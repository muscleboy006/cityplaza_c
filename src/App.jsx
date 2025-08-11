import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './Pages/Main/Main';
import MainLayout from './Pages/Tabs';
import { useState, useEffect } from 'react';
import InstallPromptModal from './Modal/InstallPromptModal';
import IosInstallGuideModal from './Modal/IosInstallGuideModal';
import LoginPage from './Utils/LoginPage';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, PublicRoute } from './Utils/AuthRoutes';
import Debt from './Pages/Debt/Debt';
import Report from './Pages/Report/Report';
import AddContractPage from './Pages/Main/addCon';
import ConAccrual from './Pages/Main/ConAccrual';
import EditContractPage from './Pages/Main/editCon';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(
    localStorage.getItem('isAppInstalled') === 'true' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const alreadyShown = localStorage.getItem('iosInstallPromptShown') === 'true';
  
    if (!isAndroid && !isInStandalone && !alreadyShown) {
      setShowIosGuide(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }
  }, []);
  

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      if (!deferredPrompt) {
        setDeferredPrompt(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        localStorage.setItem('isAppInstalled', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={
              <LoginPage />
          } />

          {/* Protected routes with MainLayout */}
          <Route element={<ProtectedRoute />}>
            {/* <Route element={<MainLayout />}> */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/con/:id" element={<ConAccrual />} />
              <Route path="/con/e/:id" element={<EditContractPage />} />
              <Route path="/addcon" element={<AddContractPage />} />
              <Route path="/debts" element={<Debt />} />
              <Route path="/reports" element={<Report />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* </Route> */}
          </Route>

          {/* Catch all other routes and redirect */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>

        {/* Модалки нужно рендерить здесь */}
        {deferredPrompt && !isAppInstalled && (
          <InstallPromptModal onInstall={handleInstall} />
        )}

        {showIosGuide && (
          <IosInstallGuideModal onClose={() => setShowIosGuide(false)} />
        )}
      </Router>
    </AuthProvider>
  );
}

export default App;