import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { RouteInspector } from "./RouteInspector";
import { RouteControls } from "./RouteControls";
import { AccessDebtDashboard } from "./AccessDebtDashboard";
import { CustomProfileModal } from "./CustomProfileModal";
import { DEMO_CAMPUS } from "../data/demoCampus";
import { ROUTE_PROFILES } from "../domain/profiles";
import { findRoute } from "../domain/routeEngine";
import { evaluateAccessDebt } from "../domain/accessDebt";

describe("UI Component Tests", () => {
  it("renders Header with branding, synthetic tag, and tab navigation", () => {
    const handleTabChange = vi.fn();
    render(<Header currentTab="planner" onTabChange={handleTabChange} />);

    expect(screen.getByText("AccessGraph")).toBeInTheDocument();
    expect(screen.getByText("Synthetic Demo Campus")).toBeInTheDocument();
    
    const debtTabButton = screen.getByRole("button", { name: /Access Debt/i });
    expect(debtTabButton).toBeInTheDocument();
    fireEvent.click(debtTabButton);
    expect(handleTabChange).toHaveBeenCalledWith("access_debt");
  });

  it("renders RouteInspector with route metrics, explanation, and cost breakdown", () => {
    const originNode = DEMO_CAMPUS.nodes.find((n) => n.id === "node_lib_entrance");
    const destNode = DEMO_CAMPUS.nodes.find((n) => n.id === "node_sci_lab");
    const profile = ROUTE_PROFILES.fastest;
    const route = findRoute(DEMO_CAMPUS, originNode!.id, destNode!.id, profile, []);

    render(
      <RouteInspector
        route={route}
        profile={profile}
        originNode={originNode}
        destinationNode={destNode}
      />
    );

    expect(screen.getByText(/Route Itinerary & Cost Proof/i)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic Routing Proof/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Objective Cost Matrix/i)).toBeInTheDocument();
  });

  it("renders RouteInspector empty state when no route is found", () => {
    const originNode = DEMO_CAMPUS.nodes.find((n) => n.id === "node_lib_entrance");
    const destNode = DEMO_CAMPUS.nodes.find((n) => n.id === "node_sci_lab");
    const profile = ROUTE_PROFILES.step_free;

    render(
      <RouteInspector
        route={null}
        profile={profile}
        originNode={originNode}
        destinationNode={destNode}
      />
    );

    expect(screen.getByText(/No Feasible Accessible Route Found/i)).toBeInTheDocument();
  });

  it("renders AccessDebtDashboard with evaluated scenarios and ranked repairs", () => {
    const report = evaluateAccessDebt(DEMO_CAMPUS, DEMO_CAMPUS.defaultBarriers);
    const handleRepair = vi.fn();
    const handleReset = vi.fn();

    render(
      <AccessDebtDashboard
        report={report}
        onSimulateRepair={handleRepair}
        onResetBarriers={handleReset}
      />
    );

    expect(screen.getByText(/Prioritized Capital Repair & Intervention Ranking/i)).toBeInTheDocument();
    expect(screen.getByText(/Benchmark Accessibility Routes Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Synthetic Audit Fixture/i)).toBeInTheDocument();

    const fixButtons = screen.getAllByRole("button", { name: /Simulate Fix/i });
    expect(fixButtons.length).toBeGreaterThan(0);
    fireEvent.click(fixButtons[0]);
    expect(handleRepair).toHaveBeenCalled();
  });

  it("renders RouteControls and switches profile preset", () => {
    const handleProfileSelect = vi.fn();
    const handleOpenCustom = vi.fn();

    render(
      <RouteControls
        nodes={DEMO_CAMPUS.nodes}
        originId="node_lib_entrance"
        destinationId="node_sci_lab"
        selectedProfileId="fastest"
        currentProfile={ROUTE_PROFILES.fastest}
        activeBarriers={[]}
        onOriginChange={vi.fn()}
        onDestinationChange={vi.fn()}
        onSwapOriginDestination={vi.fn()}
        onProfileSelect={handleProfileSelect}
        onOpenCustomProfileModal={handleOpenCustom}
        onToggleBarrier={vi.fn()}
        onOpenAddBarrierModal={vi.fn()}
        onResetBarriers={vi.fn()}
      />
    );

    const stepFreeChip = screen.getByRole("radio", { name: /Step-Free/i });
    expect(stepFreeChip).toBeInTheDocument();
    fireEvent.click(stepFreeChip);
    expect(handleProfileSelect).toHaveBeenCalledWith("step_free");

    const customizeBtn = screen.getByRole("button", { name: /Customize/i });
    fireEvent.click(customizeBtn);
    expect(handleOpenCustom).toHaveBeenCalled();
  });

  it("renders CustomProfileModal with constraints and applies changes", () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <CustomProfileModal
        isOpen={true}
        onClose={handleClose}
        onSaveProfile={handleSave}
        initialProfile={ROUTE_PROFILES.step_free}
      />
    );

    expect(screen.getByText(/Customize Accessibility Profile/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Strictly Prohibit Stairs/i)).toBeInTheDocument();

    const maxSlopeInput = screen.getByLabelText(/Max Slope Limit/i);
    fireEvent.change(maxSlopeInput, { target: { value: "8" } });

    const applyButton = screen.getByRole("button", { name: /Apply Custom Profile/i });
    fireEvent.click(applyButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    const saved = handleSave.mock.calls[0][0];
    expect(saved.isCustom).toBe(true);
    expect(saved.maxSlopePct).toBe(8);
  });
});
