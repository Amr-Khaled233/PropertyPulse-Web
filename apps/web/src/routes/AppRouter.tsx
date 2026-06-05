// Application routes. View layer entry — maps URLs to pages.

import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../views/pages/DashboardPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      {/* TODO: add /search, /property/:id, /analysis/:id, /reports, /watchlist, /chat, /login */}
    </Routes>
  );
}
