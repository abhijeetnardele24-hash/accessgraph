import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";

async function isPortOpen(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/`);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function capture() {
  const screenshotDir = path.resolve(process.cwd(), "docs/assets/screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  let previewProcess: ChildProcess | null = null;
  const serverRunning = await isPortOpen(4173);

  if (!serverRunning) {
    console.log("Starting preview server on port 4173...");
    previewProcess = spawn("npx", ["vite", "preview", "--port", "4173", "--strictPort"], {
      shell: true,
      stdio: "pipe",
    });

    // Wait for server to come up
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 500));
      if (await isPortOpen(4173)) break;
      attempts++;
    }
    if (attempts >= 30) {
      throw new Error("Preview server failed to start on port 4173");
    }
  }

  const browser = await chromium.launch();

  try {
    // Desktop Context (1440x900)
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    console.log("Navigating to http://localhost:4173/ ...");
    await page.goto("http://localhost:4173/");
    await page.waitForSelector(".app-header");
    await page.waitForSelector(".planner-layout");
    await page.waitForTimeout(600);

    // 1. Desktop Wayfinding Planner (Default Fastest Route with Stairs)
    console.log("Capturing 01-wayfinding-planner.png ...");
    await page.screenshot({
      path: path.join(screenshotDir, "01-wayfinding-planner.png"),
      fullPage: false,
    });

    // 2. Step-Free Profile with Ramp Detour Proof
    console.log("Capturing 02-step-free-reroute.png ...");
    const stepFreeBtn = page.getByRole("radio", { name: /step-free/i });
    await stepFreeBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotDir, "02-step-free-reroute.png"),
      fullPage: false,
    });

    // 3. Access Debt Dashboard
    console.log("Capturing 03-access-debt-dashboard.png ...");
    const debtTabBtn = page.locator("button.nav-tab-btn", { hasText: "Access Debt Diagnostic" });
    await debtTabBtn.click();
    await page.waitForSelector(".debt-dashboard-container");
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotDir, "03-access-debt-dashboard.png"),
      fullPage: false,
    });

    await context.close();

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
    await mobilePage.waitForSelector(".planner-layout");
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "04-mobile-planner.png"),
      fullPage: false,
    });

    await mobileContext.close();
    console.log("All 4 screenshots captured successfully into docs/assets/screenshots/!");
  } finally {
    await browser.close();
    if (previewProcess && previewProcess.pid) {
      try {
        process.kill(previewProcess.pid);
      } catch {}
    }
    process.exit(0);
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});

