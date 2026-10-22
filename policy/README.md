# RouteWitness — Policy Boundary & Governance

This directory defines the protected invariants, benchmark scenario suite, and evidence schema governing RouteWitness releases.

## Protection Model

1. **Target Branch Authority**: In GitLab CI, policy files are read from the protected target branch (`main`), not candidate branches. This ensures that a pull/merge request cannot alter or weaken its own evaluation rules.
2. **Integrity Checksum**: Scripts verify the SHA-256 hash of canonical policy files before evaluation. Any unauthorized deviation halts the pipeline.
3. **Protected Approval**: Merging changes to `policy/` requires code review and human maintainer sign-off via `CODEOWNERS`.

## Files

- `route-invariants.json`: Definitions of hard accessibility constraints (INV-01 through INV-04).
- `benchmark-scenarios.json`: Benchmark routing scenarios evaluated on every MR affecting routing files.
- `evidence.schema.json`: JSON Schema for all generated evidence artifacts.
