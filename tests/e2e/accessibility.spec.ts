import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("AccessGraph Signature Demonstration & Accessibility Verification", () => {
  test("Deterministic signature journey: Stairs -> Ramp Reroute -> Lift on Repair -> Access Debt Ranking", async ({
    page,
  }) => {
    // 1. Load application (served by preview webserver)
    await page.goto("./");
    await page.waitForSelector(".app-header");

    // Verify initial branding and synthetic fixture tag
    await expect(page.locator(".brand-title")).toContainText("AccessGraph");
    await expect(page.locator(".badge-demo")).toBeVisible();

    // 2. Default state: unconstrained Fastest profile between Library Entrance and Science Lab
    // Verify that the route uses stairs
    const itinerary = page.locator(".itinerary-list");
    await expect(itinerary).toBeVisible();
    await expect(itinerary).toContainText("stairs");

    const explanation = page.locator(".explanation-body");
    await expect(explanation).toContainText("fastest baseline");

    // 3. Switch to Step-Free profile
    const stepFreeBtn = page.locator("button.profile-card-btn", { hasText: "Step-free" });
    await stepFreeBtn.click();

    // Since lift outage is active by default in the demo campus, the Step-free policy
    // rejects stairs and detours via the covered ramp bridge!
    await expect(explanation).toContainText("Step-free policy");
    await expect(itinerary).toContainText("ramp");

    // 4. Remove lift outage barrier to test lift restoration
    const removeLiftBtn = page.locator(".barrier-item", { hasText: "Elevator Out of Service" }).locator("button", { hasText: "Remove" });
    if (await removeLiftBtn.isVisible()) {
      await removeLiftBtn.click();
      // With lift available, the route uses the lift
      await expect(itinerary).toContainText("lift");
    }

    // Reset barriers to default state (restoring lift outage)
    const resetBtn = page.locator("button", { hasText: "Reset" });
    await resetBtn.click();
    await expect(itinerary).toContainText("ramp");

    // 5. Navigate to Access Debt Diagnostic tab
    const debtTabBtn = page.locator("button.nav-tab-btn", { hasText: "Access Debt Diagnostic" });
    await debtTabBtn.click();

    // Verify Access Debt dashboard loaded
    await expect(page.locator(".debt-dashboard-container")).toBeVisible();
    await expect(page.locator(".stat-title", { hasText: "Evaluated Scenarios" })).toBeVisible();

    // Verify Prioritized Repair Candidates table exists and contains the lift outage as Rank #1
    const topRankRow = page.locator(".debt-table tbody tr.top-priority-row");
    await expect(topRankRow).toBeVisible();
    await expect(topRankRow).toContainText("lift outage");
    await expect(topRankRow).toContainText("#1");

    // 6. Interactive Repair Simulation: Click Simulate Fix
    const simulateFixBtn = topRankRow.locator("button", { hasText: "Simulate Fix" });
    await simulateFixBtn.scrollIntoViewIfNeeded();
    await simulateFixBtn.click();

    // Verify lift outage repair was simulated and removed from candidates
    const repairCandidatesTable = page.getByRole("table", { name: "Prioritized repair candidates" });
    await expect(repairCandidatesTable).not.toContainText("lift outage");
  });

  test("WCAG 2.2 AA Automated Accessibility Audit across Planner and Access Debt views", async ({
    page,
  }) => {
    await page.goto("./");
    await page.waitForSelector(".planner-layout");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);

    // Axe audit on Planner View
    const plannerAudit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(plannerAudit.violations).toEqual([]);

    // Navigate to Access Debt view
    const debtTabBtn = page.locator("button.nav-tab-btn", { hasText: "Access Debt Diagnostic" });
    await debtTabBtn.click();
    await page.waitForSelector(".debt-dashboard-container");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);

    // Axe audit on Access Debt View
    const debtAudit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(debtAudit.violations).toEqual([]);
  });

  test("Keyboard Navigation & Skip Link Accessibility", async ({ page }) => {
    await page.goto("./");

    // Press Tab to focus first element (Skip link)
    await page.keyboard.press("Tab");
    const activeElementText = await page.evaluate(() => document.activeElement?.textContent);
    expect(activeElementText).toContain("Skip to main content");

    // Press Enter to follow skip link
    await page.keyboard.press("Enter");
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(focusedTag).toBe("main");
  });
});
