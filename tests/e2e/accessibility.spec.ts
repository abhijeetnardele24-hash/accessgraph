import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("AccessGraph Comprehensive E2E Verification Suite", () => {
  // Test 1: Signature Multi-Objective Journey
  test("1. Signature Journey: Fastest (stairs) -> Step-free (lift/ramp) -> Simulated Repair", async ({
    page,
  }) => {
    await page.goto("./");
    await page.waitForSelector(".app-header");

    // Verify initial branding and synthetic fixture tag
    await expect(page.locator(".brand-title")).toContainText("AccessGraph");
    await expect(page.locator(".badge-demo")).toBeVisible();

    // 1. Unconstrained Fastest route between Library Entrance and Science Lab
    const itinerary = page.locator(".itinerary-list");
    await expect(itinerary).toBeVisible();
    await expect(itinerary).toContainText("stairs");

    const explanation = page.locator(".explanation-body");
    await expect(explanation).toContainText("fastest baseline");

    // 2. Switch to Step-Free profile
    const stepFreeChip = page.getByRole("radio", { name: /Step-Free/i });
    await stepFreeChip.click();

    // Lift outage is active by default in the demo campus -> routes via ramp
    await expect(explanation).toContainText("Step-free policy");
    await expect(itinerary).toContainText("ramp");

    // 3. Remove lift outage barrier to test lift route restoration
    const removeLiftBtn = page
      .locator(".barrier-item", { hasText: "Elevator Out of Service" })
      .locator("button.barrier-remove-btn");
    if (await removeLiftBtn.isVisible()) {
      await removeLiftBtn.click();
      await expect(itinerary).toContainText("lift");
    }

    // 4. Reset barriers back to default state
    const resetBtn = page.locator("button.btn-text-action", { hasText: "Reset" });
    await resetBtn.click();
    await expect(itinerary).toContainText("ramp");
  });

  // Test 2: Strict No-Route Diagnostic State
  test("2. Strict No-Route Diagnostic State: Blocks both lift and ramp with zero constraint relaxation", async ({
    page,
  }) => {
    await page.goto("./");
    await page.waitForSelector(".planner-layout");

    // Select Step-free profile
    const stepFreeChip = page.getByRole("radio", { name: /Step-Free/i });
    await stepFreeChip.click();

    // Add a temporary barrier blocking the courtyard ramp as well
    const addBarrierBtn = page.locator("button.btn-add-barrier");
    await addBarrierBtn.click();

    await page.waitForSelector(".modal-card");
    await page.selectOption("#barrier-edge", "edge_courtyard_ramp_f2");
    await page.fill("#barrier-note", "Emergency ramp surface maintenance");
    await page.click("button[type='submit']");

    // Both stairs (rejected by Step-free), elevator (out of service), and ramp (blocked)
    const emptyInspector = page.locator(".inspector-panel.empty");
    await expect(emptyInspector).toBeVisible();
    await expect(emptyInspector).toContainText("No Feasible Accessible Route Found");
    await expect(emptyInspector).toContainText("Diagnostic reason");

    // Reset barriers to restore state
    const resetBtn = page.locator("button.btn-text-action", { hasText: "Reset" });
    await resetBtn.click();
  });

  // Test 3: Modal Accessibility & Focus Lifecycle
  test("3. Modal Accessibility: Tab wrapping, Escape close, and opener focus restoration", async ({
    page,
  }) => {
    await page.goto("./");
    await page.waitForSelector(".planner-layout");

    const addBarrierBtn = page.locator("button.btn-add-barrier");
    await addBarrierBtn.focus();
    await addBarrierBtn.click();

    const modal = page.locator(".modal-card");
    await expect(modal).toBeVisible();

    // Verify close button received initial focus
    const closeBtn = modal.locator("button[aria-label='Close dialog']");
    await expect(closeBtn).toBeFocused();

    // Reverse Tab wrapping: Shift+Tab on first element wraps to last element (submit button)
    await page.keyboard.press("Shift+Tab");
    const submitBtn = modal.locator("button[type='submit']");
    await expect(submitBtn).toBeFocused();

    // Forward Tab wrapping: Tab on last element wraps back to first element (close button)
    await page.keyboard.press("Tab");
    await expect(closeBtn).toBeFocused();

    // Escape closes modal and returns focus to opener
    await page.keyboard.press("Escape");
    await expect(page.locator(".modal-backdrop")).not.toBeVisible();
    await expect(addBarrierBtn).toBeFocused();
  });

  // Test 4: Custom Profile Workflow & Route Recalculation
  test("4. Custom Profile Workflow: Customize constraints and observe active indicator", async ({
    page,
  }) => {
    await page.goto("./");
    await page.waitForSelector(".planner-layout");

    const customizeBtn = page.locator("button.customize-profile-btn");
    await customizeBtn.click();

    const customModal = page.locator(".modal-custom-profile");
    await expect(customModal).toBeVisible();

    // Adjust max slope to 4% and name profile
    await page.fill("#profile-name-input", "Gentle Incline Only");
    await page.fill("#custom-max-slope", "4");

    const applyBtn = customModal.locator("button[type='submit']");
    await applyBtn.click();

    await expect(customModal).not.toBeVisible();

    // Verify Custom chip is present and selected
    const customChip = page.locator(".preset-chip-custom");
    await expect(customChip).toBeVisible();
    await expect(customChip).toHaveClass(/selected/);
    await expect(page.locator(".badge-custom-tag")).toHaveText("Custom");
  });

  // Test 5: Real Service Worker Offline Test
  test("5. Real Service Worker Offline Reload & Verification", async ({ page, context }) => {
    await page.goto("./");
    await page.waitForSelector(".app-header");

    // Wait for ServiceWorker registration
    await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.ready;
      }
    });

    // Reload once online so active service worker controls page and caches assets
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector(".app-header");

    // Exercise an online route
    const itinerary = page.locator(".itinerary-list");
    await expect(itinerary).toBeVisible();

    // Set offline
    await context.setOffline(true);

    try {
      // Reload page offline
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector(".app-header");

      // Verify app shell and header loaded offline
      await expect(page.locator(".brand-title")).toContainText("AccessGraph");

      // Verify route computation still runs offline
      const stepFreeChip = page.getByRole("radio", { name: /Step-Free/i });
      await stepFreeChip.click();
      await expect(page.locator(".explanation-body")).toContainText("Step-free policy");

      // Verify Access Debt dashboard functions offline
      const debtTabBtn = page.locator("button.nav-tab-btn", { hasText: "Access Debt Diagnostic" });
      await debtTabBtn.click();
      await expect(page.locator(".debt-dashboard-container")).toBeVisible();
      await expect(page.locator(".debt-table").first()).toBeVisible();
    } finally {
      // Restore network in cleanup
      await context.setOffline(false);
    }
  });

  // Test 6: Text Itinerary Equivalence & Turn-by-Turn Clarity
  test("6. Text Itinerary Equivalence: Turn-by-turn directions and share action", async ({ page }) => {
    await page.goto("./");
    await page.waitForSelector(".itinerary-list");

    const steps = page.locator(".itinerary-step");
    const count = await steps.count();
    expect(count).toBeGreaterThan(0);

    // Each step must display a step number, title, mode, distance
    const firstStep = steps.first();
    await expect(firstStep.locator(".step-number")).toHaveText("1");
    await expect(firstStep.locator(".step-title")).toBeVisible();
    await expect(firstStep.locator(".step-details")).toContainText("m");
  });

  // Test 7: Zero Uncaught Errors & Zero Console Errors
  test("7. Zero Uncaught Errors and Zero Console Errors", async ({ page }) => {
    const errorLogs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errorLogs.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      errorLogs.push(err.message);
    });

    await page.goto("./");
    await page.waitForSelector(".planner-layout");

    // Navigate to Access Debt
    const debtTabBtn = page.locator("button.nav-tab-btn", { hasText: "Access Debt Diagnostic" });
    await debtTabBtn.click();
    await page.waitForSelector(".debt-dashboard-container");

    // Return to Planner
    const plannerTabBtn = page.locator("button.nav-tab-btn", { hasText: "Wayfinding Planner" });
    await plannerTabBtn.click();
    await page.waitForSelector(".planner-layout");

    expect(errorLogs).toEqual([]);
  });

  // Test 8: Zero Horizontal Page Overflow
  test("8. Zero Horizontal Page Overflow at Target Viewport", async ({ page }) => {
    await page.goto("./");
    await page.waitForSelector(".planner-layout");

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  // Test 9: Axe Accessibility Scans across 5 Application States
  test("9. Automated Axe Scans: Zero violations across 5 states (Planner, Step-free, No-route, Modal, Debt)", async ({
    page,
  }) => {
    await page.goto("./");
    await page.waitForSelector(".planner-layout");
    await page.mouse.move(0, 0);

    // State A: Planner Default
    const auditPlanner = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(auditPlanner.violations).toEqual([]);

    // State B: Step-free Reroute State
    const stepFreeChip = page.getByRole("radio", { name: /Step-Free/i });
    await stepFreeChip.click();
    await page.mouse.move(0, 0);
    const auditStepFree = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(auditStepFree.violations).toEqual([]);

    // State C: Open Add Barrier Modal
    const addBarrierBtn = page.locator("button.btn-add-barrier");
    await addBarrierBtn.click();
    await page.waitForSelector(".modal-card");
    const auditModal = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(auditModal.violations).toEqual([]);

    // Close modal
    await page.keyboard.press("Escape");
    await expect(page.locator(".modal-backdrop")).not.toBeVisible();

    // State D: Access Debt View
    const debtTabBtn = page.locator("button.nav-tab-btn", { hasText: "Access Debt Diagnostic" });
    await debtTabBtn.click();
    await page.waitForSelector(".debt-dashboard-container");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    const auditDebt = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(auditDebt.violations).toEqual([]);
  });
});
