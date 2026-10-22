# Google Cloud Run Deployment & Workload Identity Federation Guide

> **Project:** RouteWitness (Path B Entry — AccessGraph)  
> **Hackathon:** Life After Code — GitLab Transcend Hackathon  
> **Bonus Track:** Google Cloud Deployment Bonus (+0.2 points)

---

## 1. Architecture Overview

RouteWitness deploys to **Google Cloud Run** using a fully automated, keyless CI/CD pipeline from GitLab:
1. **OCI Image Packaging:** Multi-stage, non-root Alpine container pushed to GitLab Container Registry and mirrored to Google Artifact Registry.
2. **Workload Identity Federation (WIF):** Keyless authentication between GitLab CI OIDC and Google Cloud IAM, eliminating committed or long-lived service account keys.
3. **Tagged Canary Revision (0% Production Traffic):** Merge requests deploy a tagged candidate revision (e.g. `rev-a85d644`) that receives 0% production traffic.
4. **Deployed Witness Replay:** Pre-release verification script (`scripts/replay-deployment.ts`) calls the tagged candidate URL, checking `/healthz`, `/version.json`, and route invariants against the live container.
5. **Supervised Production Promotion:** Human maintainer triggers manual protected job in `.gitlab-ci.yml` to shift 100% traffic to the verified candidate revision.

---

## 2. Workload Identity Federation (WIF) Setup

To configure WIF in your Google Cloud Project:

```bash
# Run the automated setup script
bash deploy/workload-identity/setup-wif.sh
```

This script:
- Creates a Workload Identity Pool (`gitlab-pool`) and OIDC Provider (`gitlab-jwt`).
- Restricts token exchange to GitLab project path (`abhijeetnardele24-hash/accessgraph`).
- Creates a least-privilege service account `gitlab-ci-deployer` with `roles/run.admin` and `roles/artifactregistry.writer`.

### Required GitLab CI Variables

Set these in **Settings > CI/CD > Variables**:
- `GCP_PROJECT_ID`: Your Google Cloud Project ID.
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: `//iam.googleapis.com/projects/<PROJECT_NUM>/locations/global/workloadIdentityPools/gitlab-pool/providers/gitlab-jwt`
- `GCP_SERVICE_ACCOUNT`: `gitlab-ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com`

---

## 3. Cloud Run Deployment Command

The automated candidate deployment executes:

```bash
gcloud run deploy routewitness-app \
  --image us-central1-docker.pkg.dev/${GCP_PROJECT_ID}/routewitness/app:${CI_COMMIT_SHA} \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --tag "rev-${CI_COMMIT_SHORT_SHA}" \
  --no-traffic \
  --quiet
```

### Endpoints Verified on Deployed Container:
- `GET /healthz`: HTTP 200 JSON `{ "status": "ok" }`
- `GET /version.json`: Returns commit SHA, revision tag, and build timestamp
- `GET /evidence/latest.json`: Serves the latest canonical Release Receipt
- `GET /`: Serves the AccessGraph / RouteWitness single-page application

---

## 4. Rollback & Incident Recovery

If an issue is detected post-promotion:

```bash
# Instant traffic rollback to previous verified revision
gcloud run services update-traffic routewitness-app \
  --region us-central1 \
  --to-revisions=PREVIOUS_REVISION_NAME=100
```
