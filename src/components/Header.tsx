import React, { useState, useEffect } from "react";
import { Compass, BarChart2, Github, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  currentTab: "planner" | "access_debt";
  onTabChange: (tab: "planner" | "access_debt") => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo" aria-hidden="true">
          AG
        </div>
        <div>
          <h1 className="brand-title">AccessGraph</h1>
          <p className="brand-sub">
            Constraint-Aware Campus Navigation &amp; Access Debt Diagnostics
          </p>
        </div>
      </div>

      <div className="header-badges">
        <span className="badge-tag badge-demo">
          Synthetic Demo Campus
        </span>

        <span
          id="network-indicator"
          className={`badge-tag ${isOnline ? "badge-online" : "badge-offline"}`}
        >
          {isOnline ? (
            <>
              <Wifi size={12} aria-hidden="true" />
              <span>Online / Offline Ready</span>
            </>
          ) : (
            <>
              <WifiOff size={12} aria-hidden="true" />
              <span>Offline Cache Active</span>
            </>
          )}
        </span>
      </div>

      <nav className="header-nav" aria-label="Main Navigation">
        <button
          className={`nav-tab-btn ${currentTab === "planner" ? "active" : ""}`}
          onClick={() => onTabChange("planner")}
          aria-current={currentTab === "planner" ? "page" : undefined}
        >
          <Compass size={17} aria-hidden="true" />
          <span>Wayfinding Planner</span>
        </button>

        <button
          className={`nav-tab-btn ${currentTab === "access_debt" ? "active" : ""}`}
          onClick={() => onTabChange("access_debt")}
          aria-current={currentTab === "access_debt" ? "page" : undefined}
        >
          <BarChart2 size={17} aria-hidden="true" />
          <span>Access Debt Diagnostic</span>
        </button>

        <a
          href="https://github.com/abhijeetnardele24-hash/accessgraph"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-tab-btn"
          title="View GitHub Repository"
          aria-label="View AccessGraph Source Code on GitHub"
        >
          <Github size={17} aria-hidden="true" />
          <span className="sr-only">GitHub</span>
        </a>
      </nav>
    </header>
  );
};
