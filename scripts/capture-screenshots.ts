import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

async function capture() {
  const screenshotDir = path.resolve(process.cwd(), "docs/assets/screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch();

  // Desktop Page (1440x900)
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:4173/ ...");
  await page.goto("http://localhost:4173/");
  await page.waitForSelector(".app-header");
  await page.waitForTimeout(500);

  // 1. Desktop Wayfinding Planner (Default Fastest Route with Stairs)
  console.log("Capturing 01-wayfinding-planner.png ...");
  await page.screenshot({
    path: path.join(screenshotDir, "01-wayfinding-planner.png"),
    fullPage: false,
  });

  // 2. Step-Free Profile with Ramp Detour Proof
  console.log("Capturing 02-step-free-reroute.png ...");
  const stepFreeBtn = page.locator("button.profile-card-btn", { hasText: "Step-free" });
  await stepFreeBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(screenshotDir, "02-step-free-reroute.png"),
    fullPage: false,
  });

  // 3. Access Debt Dashboard
  console.log("Capturing 03-access-debt-dashboard.png ...");
  const debtTabBtn = page.locator("button.nav-tab-btn", { hasText: "Access Debt Diagnostic" });
  await debtTabBtn.click();
  await page.waitForSelector(".debt-dashboard-container");
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(screenshotDir, "03-access-debt-dashboard.png"),
    fullPage: false,
  });

  // 4. Mobile Viewport (iPhone 14 / 390x844)
  console.log("Capturing 04-mobile-planner.png ...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:4173/");
  await mobilePage.waitForSelector(".app-header");
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "04-mobile-planner.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("All screenshots captured successfully into docs/assets/screenshots/!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
