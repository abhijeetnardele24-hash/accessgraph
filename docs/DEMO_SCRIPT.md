# AccessGraph — Demonstration Video Script (3:20 Timed Guide)

> **Submission Media Script**  
> **Target Duration:** Exactly 3 minutes and 20 seconds (200 seconds)  
> **Pacing:** Clear, deliberate, authoritative, and focused on tangible civic impact.

---

### [0:00 - 0:35] The Problem: Why Traditional Navigation Fails Disabled Students
- **Visual:** Screen opens on AccessGraph landing page. Crisp, clean UI displaying the Ashoka University synthetic demonstration campus map.
- **Narrator (Voiceover):**  
  *"Every semester, millions of students with physical disabilities, mobility aids, temporary injuries, or sensory sensitivities navigate university campuses. But standard navigation apps are built on an able-bodied assumption: they optimize strictly for walking speed and distance. A route that looks 30 seconds faster on paper will guide a wheelchair user directly into a flight of stairs, or leave a student stranded in front of a broken elevator with no alternative path.*  
  *Meanwhile, university facilities managers operate with limited capital budgets, prioritizing repairs by whoever sends the most urgent email. This is AccessGraph: constraint-aware campus wayfinding that transforms daily detour burdens into actionable infrastructure repair priorities."*

---

### [0:35 - 1:15] The Signature Journey: Stairs, Lift & Courtyard Ramp Reroute
- **Visual:** Cursor selects Origin: **Library Entrance** and Destination: **Science Lab (Floor 2)**.
- **Narrator (Voiceover):**  
  *"Let's observe our signature demonstration. Under the default 'Fastest' profile, the engine calculates the direct path: 455 meters in 6 minutes, utilizing the central atrium stairs up to the second floor mezzanine.*  
  *Now watch what happens when we switch to the 'Step-Free' profile.*  
  *(Click 'Step-Free' card)*  
  *Instantly, the hard constraint filter rejects the stairs. But notice our active incident banner: the Science Complex passenger elevator is undergoing a traction motor overhaul.*  
  *Rather than failing or showing an impassable dead end, AccessGraph deterministically reroutes the student through the central courtyard and across the covered elevated ramp bridge—guaranteeing continuous, step-free access."*

---

### [1:15 - 1:45] Deterministic Proof & Multi-Objective Matrix
- **Visual:** Zoom into the Route Inspector panel on the right.
- **Narrator (Voiceover):**  
  *"Look at the Route Inspector below. AccessGraph provides mathematical proof for every turn. It explicitly states: 'The 455m unconstrained route contains stairs and was rejected by the Step-free policy. Elevator outage avoided; rerouted via covered courtyard ramp.'*  
  *In our cost matrix, you can inspect the multi-objective score: walking duration, slope effort, lighting quality, and sensory load penalties are transparently itemized. A 4-key tie-breaker ensures identical route calculation every single time, eliminating confusing path oscillation."*

---

### [1:45 - 2:30] The Innovation: Access Debt Diagnostic Dashboard
- **Visual:** Click "Access Debt Diagnostic" in the header navigation. The dashboard cards and repair table appear.
- **Narrator (Voiceover):**  
  *"Now let's switch to the institutional view: The Access Debt Dashboard.*  
  *Access Debt is our proprietary equity metric. Across 8 calibrated campus benchmark scenarios, we calculate the ratio of accessible transit time to fastest unconstrained travel time.*  
  *Under current conditions, campus travelers face an average 1.21x time penalty—a 21% transit tax simply to reach their classes.*  
  *Below, our counterfactual simulation engine tests the resolution of every reported barrier on campus and ranks them by immediate ROI.*  
  *Ranked #1 is the Science Complex Lift Outage. Repairing this single elevator recovers 2.9 minutes per transit trip and reconnects isolated second-floor labs.*  
  *When facilities managers click 'Simulate Fix'...*  
  *(Click 'Simulate Fix' button)*  
  *...the elevator outage is instantly resolved, campus travel debt drops, and connectivity is restored across the entire university."*

---

### [2:30 - 2:55] 100% Client-Side Privacy & Offline Capability
- **Visual:** Disconnect Wi-Fi (toggle offline mode in devtools) and refresh the page. The application reloads instantly and functions seamlessly.
- **Narrator (Voiceover):**  
  *"Accessibility data is deeply personal. AccessGraph is engineered with zero telemetry, zero analytics, zero external API calls, and zero third-party trackers. All graph algorithms execute locally in your browser in under 2 milliseconds.*  
  *Thanks to our Service Worker architecture, the entire application is offline-ready. If a storm cuts campus Wi-Fi, students can still navigate safely and access essential detour paths without an internet connection."*

---

### [2:55 - 3:20] Verification & Closing
- **Visual:** Show terminal running test suite (27 unit tests passing, 15 Playwright tests across 5 viewports passing, 0 Axe violations).
- **Narrator (Voiceover):**  
  *"AccessGraph isn't a concept mockup—it is fully audited engineering. Our automated test suite includes 27 Vitest unit tests with over 95% statement coverage, full end-to-end Playwright tests across five responsive viewports, and zero automated WCAG 2.2 Level AA violations.*  
  *By uniting daily student wayfinding with systemic infrastructure auditing, AccessGraph ensures that accessibility is no longer an afterthought—it's a measurable, solvable priority.*  
  *Thank you."*
