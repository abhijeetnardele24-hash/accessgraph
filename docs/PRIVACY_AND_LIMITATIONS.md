# AccessGraph — Privacy Architecture, Disclosures & Limitations

> **Ethics, Privacy & Operational Boundaries**  
> **Repository:** `accessgraph`  
> **Last Verified:** 19 October 2026

---

## 1. Privacy Architecture & Guarantees

Mobility and cognitive accessibility preferences represent deeply sensitive personal information. Traditional route planning platforms track user locations, profile selections, and travel patterns to build monetization profiles. AccessGraph rejects this paradigm by design:

1. **100% Client-Side Execution:**  
   Every routing computation, constraint evaluation, and counterfactual repair simulation runs locally within the browser's JavaScript engine (V8 / JavaScriptCore / SpiderMonkey).
2. **Zero Telemetry or Third-Party Scripts:**  
   The application contains no Google Analytics, Segment, Sentry, Mixpanel, or advertising SDKs. The network panel remains completely silent after the initial bundle download.
3. **No User Tracking or Remote Logging:**  
   User profile preferences (e.g. Step-free, Low Vision, Sensory Sensitivities) and reported incident barriers are saved exclusively to the browser's local `localStorage` store. Data is never transmitted to an external server or cloud database.
4. **Offline Capability:**  
   A Service Worker (`sw.js`) caches the minimal production bundle (under 250 KB gzip). Once loaded, users can navigate the campus and inspect access debt offline without cellular or Wi-Fi connectivity.

---

## 2. Truthful Demonstration & Synthetic Data Disclosure

To ensure complete clarity for EurekaDev judges and community reviewers:

- **Synthetic Campus Topology:**  
  The Ashoka University campus graph (`src/data/demoCampus.ts`), including the 16 nodes, 18 path edges, building names, and coordinates, is a **synthetic demonstration fixture** designed to illustrate realistic multi-level wayfinding challenges (stairs vs. passenger lifts vs. courtyard covered ramp bridges). It does not represent an official or architecturally certified map of Ashoka University.
- **Simulated Maintenance Incidents:**  
  All barrier records (such as the Science Complex lift motor overhaul or dining terrace resurfacing) are simulated demonstration fixtures intended to showcase deterministic rerouting and Access Debt repair prioritization.
- **Honest Labeling:**  
  The application interface persistently displays a visible "Synthetic Demo Campus" badge in the navigation header and prominent disclosure notices in both the wayfinding planner and the Access Debt dashboard.

---

## 3. Disclaimers & Non-Medical Notice

1. **Not Medical Advice:**  
   AccessGraph provides algorithmic navigation assistance based on user-selected path preferences. It is not a medical device, nor does it provide personalized physical rehabilitation guidance.
2. **Not Certified Legal Compliance Advice:**  
   AccessGraph's "Access Debt" metric is a quantitative tool designed to help institutions prioritize physical infrastructure investments. It does not certify legal compliance with the Americans with Disabilities Act (ADA), Section 504 of the Rehabilitation Act, the Rights of Persons with Disabilities Act (RPwD India), or local building codes.
3. **Emergency Egress:**  
   In the event of a fire, earthquake, or emergency evacuation, **do not rely on AccessGraph**. Always follow designated physical emergency exit signage, illuminated egress pathways, and instructions from emergency personnel.

---

## 4. Known Technical Limitations & Future Roadmap

- **Static vs. Live Weather:** Current sun exposure penalties are calculated from static path attributes (`shade: 0 | 1 | 2`). Integrating live solar angle calculations based on real-time solar azimuth and campus building shadow modeling is an exciting area for future research.
- **Barrier Synchronization:** Barriers are currently scoped to the user's local browser storage. A production campus deployment would connect to the university facilities work-order system (e.g., ARCHIBUS, Maximo, or ServiceNow) with role-based access for grounds crews.
- **Indoor Turn-by-Turn Positioning:** AccessGraph provides step-by-step schematic instructions. Real-time blue-dot positioning inside multi-story facilities would require campus-wide Bluetooth Low Energy (BLE) beacon or Wi-Fi RTT deployment.
