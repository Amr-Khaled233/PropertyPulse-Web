// Authenticated app shell: dark sidebar + topbar + routed content.

import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from './Toaster';
import { ThemeLangToggle } from './ThemeLangToggle';
import { NotificationsBell } from './NotificationsBell';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';

interface AppShellProps {
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function AppShell({ title, actions, children }: AppShellProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebar = useUiStore((s) => s.setSidebar);
  const user = useAuthStore((s) => s.user);
  const initials = (user?.fullName ?? 'PP')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebar(false)} />}
      <Sidebar />
      <div className="app-main">
        <header className="topbar">
          <div className="center-row">
            <button className="icon-btn menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
              ☰
            </button>
            <h1>{title}</h1>
          </div>
          <div className="center-row">
            {actions}
            <ThemeLangToggle />
            <NotificationsBell />
            <div className="avatar" title={user?.email}>{initials}</div>
          </div>
        </header>
        <main className="app-content">{children ?? <Outlet />}</main>
      </div>
      <Toaster />
    </div>
  );
}
