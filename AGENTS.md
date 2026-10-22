# Autonomous Execution Directive

## 1. Zero Routine Permission Prompts
- **Never pause to ask for permission** for standard engineering tasks: running terminal commands, creating files, modifying code, building projects, running tests, or making Git commits.
- **Never use interactive modals (`ask_question`)** for routine architectural choices, minor clarifications, or routine decisions. Autonomously choose the most robust, high-performance, and standard solution and execute it directly.

## 2. End-to-End Autonomous Execution
- When given a task or bug, proceed end-to-end autonomously through analysis, implementation, automated testing, quality validation, and commits until the goal is fully achieved.
- Proactively fix errors, linter warnings, or test failures encountered along the way without stopping to request user guidance.

## 3. High-Impact Safeguard Threshold
- ONLY halt or request explicit user confirmation for irreversible catastrophic data loss (such as permanently deleting an entire unbacked-up project directory or running an unrecoverable hard reset on remote repositories).
- All normal development, refactoring, and verification tasks must proceed directly without interruption.

## 4. High-Performance Delivery Workflow
- For substantial builds, refactors, difficult bugs, or hackathon projects, use the `evidence-driven-project-execution` skill as the coordinating workflow and load only the specialized skills relevant to the current task.
- Convert the request into a compact completion contract, then implement in working vertical slices. Do not spend the turn repeatedly rewriting plans or reporting that a process is still running.
- Run targeted checks during development. Start the expensive full verification suite only after targeted checks are stable; retain and poll its existing process instead of launching duplicates.
- Diagnose failures at the root cause with `systematic-debugging`; use `verification-before-completion` before claiming success.
- For frontend work, establish an intentional visual direction before implementation. Use `reference-driven-interface` whenever a website or screenshot is supplied, then apply `frontend-design`, `impeccable`, and `web-design-guidelines` as relevant.
- Use current authoritative library documentation through Context7 when API details or versions may have changed. Never guess a current API when documentation can be queried.
- Completion reports must lead with the delivered outcome and measured evidence, not a long activity transcript.
