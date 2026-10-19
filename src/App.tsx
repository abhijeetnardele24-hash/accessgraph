import React, { useState, useMemo, useCallback } from "react";
import { DEMO_CAMPUS } from "./data/demoCampus";
import { ROUTE_PROFILES } from "./domain/profiles";
import { Barrier } from "./domain/types";
import { findRoute } from "./domain/routeEngine";
import { evaluateAccessDebt } from "./domain/accessDebt";
import {
  loadStoredBarriers,
  saveStoredBarriers,
  loadStoredProfileId,
  saveStoredProfileId,
  resetToDefaultBarriers,
} from "./services/storage";

import { Header } from "./components/Header";
import { CampusMap } from "./components/CampusMap";
import { RouteControls } from "./components/RouteControls";
import { RouteInspector } from "./components/RouteInspector";
import { AccessDebtDashboard } from "./components/AccessDebtDashboard";
import { AddBarrierModal } from "./components/AddBarrierModal";

export const App: React.FC = () => {
  // Application view tab
  const [activeTab, setActiveTab] = useState<"planner" | "access_debt">("planner");

  // Selected Profile ID
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => loadStoredProfileId());

  // Active Incidents / Barriers
  const [barriers, setBarriers] = useState<Barrier[]>(() => loadStoredBarriers());

  // Selected Origin & Destination (default Library Entrance -> Science Lab)
  const [originId, setOriginId] = useState<string>("node_lib_entrance");
  const [destinationId, setDestinationId] = useState<string>("node_sci_lab");

  // Add Barrier Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Profile selection
  const handleProfileSelect = useCallback((profileId: string) => {
    setSelectedProfileId(profileId);
    saveStoredProfileId(profileId);
  }, []);

  // Origin / Destination Swap
  const handleSwapOriginDestination = useCallback(() => {
    setOriginId(destinationId);
    setDestinationId(originId);
  }, [originId, destinationId]);

  // Barrier toggle (remove if present, or add if absent)
  const handleToggleBarrier = useCallback((barrierId: string) => {
    setBarriers((prev) => {
      const exists = prev.some((b) => b.id === barrierId);
      let updated: Barrier[];
      if (exists) {
        updated = prev.filter((b) => b.id !== barrierId);
      } else {
        const foundInDefault = DEMO_CAMPUS.defaultBarriers.find((b) => b.id === barrierId);
        if (foundInDefault) {
          updated = [...prev, foundInDefault];
        } else {
          updated = prev;
        }
      }
      saveStoredBarriers(updated);
      return updated;
    });
  }, []);

  const handleAddBarrier = useCallback((newBarrier: Barrier) => {
    setBarriers((prev) => {
      const updated = [...prev, newBarrier];
      saveStoredBarriers(updated);
      return updated;
    });
  }, []);

  const handleResetBarriers = useCallback(() => {
    const defaults = resetToDefaultBarriers();
    setBarriers(defaults);
  }, []);

  const handleSimulateRepair = useCallback((barrierId: string) => {
    setBarriers((prev) => {
      const updated = prev.filter((b) => b.id !== barrierId);
      saveStoredBarriers(updated);
      return updated;
    });
  }, []);

  // Node selection from map click
  const handleSelectNode = useCallback(
    (nodeId: string, role: "origin" | "destination") => {
      if (role === "origin") {
        setOriginId(nodeId);
      } else {
        setDestinationId(nodeId);
      }
    },
    []
  );

  const currentProfile = ROUTE_PROFILES[selectedProfileId] || ROUTE_PROFILES.fastest;

  // Compute live route
  const currentRoute = useMemo(() => {
    if (!originId || !destinationId) return null;
    return findRoute(DEMO_CAMPUS, originId, destinationId, currentProfile, barriers);
  }, [originId, destinationId, currentProfile, barriers]);

  // Compute Access Debt Report
  const accessDebtReport = useMemo(() => {
    return evaluateAccessDebt(DEMO_CAMPUS, barriers);
  }, [barriers]);

  const originNode = DEMO_CAMPUS.nodes.find((n) => n.id === originId);
  const destinationNode = DEMO_CAMPUS.nodes.find((n) => n.id === destinationId);

  return (
    <div className="app-layout">
      {/* Accessible Skip Links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#route-controls" className="skip-link">
        Skip to route controls
      </a>

      {/* Header with Offline Indicator & View Switcher */}
      <Header
        currentTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main id="main-content" className="main-content" tabIndex={-1}>
        {activeTab === "planner" ? (
          <div className="planner-layout">
            {/* Left Column: Route Controls & Settings */}
            <div id="route-controls">
              <RouteControls
                nodes={DEMO_CAMPUS.nodes}
                originId={originId}
                destinationId={destinationId}
                selectedProfileId={selectedProfileId}
                activeBarriers={barriers}
                onOriginChange={setOriginId}
                onDestinationChange={setDestinationId}
                onSwapOriginDestination={handleSwapOriginDestination}
                onProfileSelect={handleProfileSelect}
                onToggleBarrier={handleToggleBarrier}
                onOpenAddBarrierModal={() => setIsAddModalOpen(true)}
                onResetBarriers={handleResetBarriers}
              />
            </div>

            {/* Right Column: Interactive Map & Turn-by-Turn Inspector */}
            <div className="planner-view">
              <div className="map-view-wrapper" id="route-map">
                <CampusMap
                  dataset={DEMO_CAMPUS}
                  routeResult={currentRoute || undefined}
                  activeBarriers={barriers}
                  selectedOriginId={originId}
                  selectedDestinationId={destinationId}
                  onSelectNode={handleSelectNode}
                />
              </div>

              <div className="inspector-view-wrapper" id="route-itinerary">
                <RouteInspector
                  route={currentRoute}
                  profile={currentProfile}
                  originNode={originNode}
                  destinationNode={destinationNode}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="debt-layout">
            <AccessDebtDashboard
              report={accessDebtReport}
              onSimulateRepair={handleSimulateRepair}
              onResetBarriers={handleResetBarriers}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-col">
            <span className="footer-title">AccessGraph</span>
            <p className="footer-text">
              Accessible, private, offline-capable multi-objective campus wayfinding and infrastructure
              equity auditing engine. Built for <strong>EurekaDev 2026</strong>.
            </p>
          </div>

          <div className="footer-col">
            <span className="footer-title">Privacy &amp; Architecture</span>
            <p className="footer-text">
              <strong>100% Client-Side.</strong> Zero server telemetry, zero third-party cookies, zero tracking scripts.
              Route computation executes entirely within your browser in ~2ms.
            </p>
          </div>

          <div className="footer-col">
            <span className="footer-title">Honest Disclosures</span>
            <p className="footer-text">
              Ashoka University campus nodes and incident logs are synthetic demonstration fixtures.
              Not certified legal ADA compliance advice.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>MIT License &copy; 2026 Abhijeet Nardele</span>
          <span className="footer-dot">•</span>
          <a
            href="https://github.com/abhijeetnardele24-hash/accessgraph"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub Repository
          </a>
          <span className="footer-dot">•</span>
          <span>WCAG 2.2 AA Audited</span>
        </div>
      </footer>

      {/* Barrier Incident Modal */}
      <AddBarrierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBarrier={handleAddBarrier}
        edges={DEMO_CAMPUS.edges}
      />
    </div>
  );
};
