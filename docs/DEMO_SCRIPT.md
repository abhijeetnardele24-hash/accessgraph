# AccessGraph — Demonstration Video Script (3:20 Timed Guide)

> **Submission Media Script**  
> **Target Duration:** Exactly 3 minutes and 20 seconds (200 seconds)  
> **Pacing:** Clear, deliberate, authoritative, and focused on tangible civic impact.

---

### [0:00 - 0:35] The Problem: Why Traditional Navigation Fails Disabled Students
- **Visual:** Screen opens on AccessGraph landing page. Crisp, clean UI displaying the Synthetic Demo Campus map.
- **Narrator (Voiceover):**  
  *"Students with physical disabilities, mobility aids, temporary injuries, or sensory sensitivities frequently encounter hidden campus barriers. General-purpose navigation may prioritize distance and walking time without modeling every mobility constraint. A route that looks faster can still include stairs or rely on a lift that is out of service.*
  *Meanwhile, university facilities managers operate with limited capital budgets. This is AccessGraph: constraint-aware campus wayfinding that transforms daily detour burdens into actionable infrastructure repair priorities."*

---

### [0:35 - 1:15] The Signature Journey: Stairs, Lift & Courtyard Ramp Reroute
- **Visual:** Cursor selects Origin: **Library Entrance** and Destination: **Science Lab (Floor 2)**.
- **Narrator (Voiceover):**  
  *"Let's observe our signature demonstration. Under the default 'Fastest' profile, the engine calculates the direct path: 455 meters in 5 minutes 50 seconds, utilizing the central atrium stairs up to the second floor mezzanine.*  
  *Now watch what happens when we switch to the 'Step-Free' profile.*  
  *(Click 'Step-Free' chip)*  
  *Instantly, the hard constraint filter rejects the stairs. But notice our active incident banner: the Science Complex passenger elevator is undergoing a traction motor overhaul.*  
  *For this synthetic campus fixture, AccessGraph finds a valid alternative through the central courtyard and across the covered elevated ramp, keeping the demonstrated route step-free."*

---

### [1:15 - 1:45] Deterministic Proof & Multi-Objective Matrix
- **Visual:** Zoom into the Route Inspector panel on the right.
- **Narrator (Voiceover):**  
  *"Look at the Route Inspector on the right. AccessGraph provides mathematical proof for every turn. It explicitly states: 'The 455m unconstrained route contains stairs and was rejected by the Step-free policy. Elevator outage avoided; rerouted via covered courtyard ramp.'*  
  *In our cost matrix, you can inspect the multi-objective score: walking duration, slope effort, lighting quality, and sensory load penalties are transparently itemized. A 4-key tie-breaker ensures identical route calculation every single time, eliminating confusing path oscillation across edge shuffles."*

---

### [1:45 - 2:30] The Innovation: Access Debt Diagnostic Dashboard
- **Visual:** Click "Access Debt Diagnostic" in the header navigation. The dashboard cards and repair table appear.
- **Narrator (Voiceover):**  
  *"Now let's switch to the institutional view: The Access Debt Dashboard.*  
  *Access Debt is the equity metric we defined for this prototype. Across 8 deterministic synthetic benchmark scenarios, we calculate the ratio of accessible transit time to fastest unconstrained travel time.*
  *Under current conditions, campus travelers face an average 1.22x access penalty—an extra 22% transit burden simply to reach classes.*  
  *Below, our counterfactual simulation engine tests the resolution of every reported barrier on campus and ranks them by immediate ROI.*  
  *Ranked #1 is the Science Complex Lift Outage. In this fixture, resolving it recovers 2.9 minutes on the affected benchmark trip and reduces the step-free detour burden.*
  *When facilities managers click 'Simulate Fix'...*  
  *(Click 'Simulate Fix' button)*  
  *...the simulation removes that synthetic outage and recalculates the campus benchmark so facilities teams can compare the projected impact before prioritizing work."*

---

### [2:30 - 2:55] Local Computation & Tested Offline Reload
- **Visual:** Disconnect Wi-Fi (toggle offline mode in devtools) and refresh the page. The application reloads instantly and functions seamlessly.
- **Narrator (Voiceover):**  
  *"Accessibility preferences can be sensitive. AccessGraph keeps routing and Access Debt calculations in the browser and includes no application telemetry or third-party tracking scripts. On the test host, the committed benchmark measured sub-millisecond median calculations.*
  *After one online load installs the Service Worker, our automated browser test disconnects the network, reloads the app, and verifies that the cached interface and local routing journey still work offline."*

---

### [2:55 - 3:20] Verification & Closing
- **Visual:** Show terminal running test suite (83 unit tests passing, 50 Playwright test executions across 5 viewports passing, 0 Axe violations).
- **Narrator (Voiceover):**  
  *"AccessGraph and RouteWitness provide a working hackathon prototype with reproducible automated evidence. The suite includes 83 Vitest unit, domain, and verification tests with over 82% statement coverage and 50 Playwright executions across five responsive viewports. Axe detected zero violations in the tested interaction states.*
  *By uniting daily student wayfinding with systemic infrastructure auditing and supervised release twins, RouteWitness ensures that accessibility is no longer an afterthought—it's a measurable, solvable priority.*  
  *Thank you."*
