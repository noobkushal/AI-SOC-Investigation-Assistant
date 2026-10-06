import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Alerts } from './pages/Alerts';
import { AlertDetails } from './pages/AlertDetails';
import { Incidents } from './pages/Incidents';
import { IncidentInvestigation } from './pages/IncidentInvestigation';
import { AIInvestigator } from './pages/AIInvestigator';
import { ThreatIntel } from './pages/ThreatIntel';
import { MitreAttack } from './pages/MitreAttack';
import { DetectionRules } from './pages/DetectionRules';
import { Assets } from './pages/Assets';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className="pl-60">
        <Header />
        <main className="pt-14 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:id" element={<AlertDetails />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<IncidentInvestigation />} />
          <Route path="/investigation" element={<AIInvestigator />} />
          <Route path="/threat-intelligence" element={<ThreatIntel />} />
          <Route path="/mitre-attack" element={<MitreAttack />} />
          <Route path="/detection-rules" element={<DetectionRules />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
