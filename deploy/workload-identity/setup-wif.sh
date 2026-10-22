#!/usr/bin/env bash
set -euo pipefail

# RouteWitness — Workload Identity Federation (WIF) Setup for GitLab CI <-> GCP
# Configures keyless OIDC authentication to avoid long-lived JSON service account keys.

PROJECT_ID="${GCP_PROJECT_ID:-accessgraph-transcend}"
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
POOL_NAME="gitlab-pool"
PROVIDER_NAME="gitlab-jwt"
SERVICE_ACCOUNT_NAME="gitlab-ci-deployer"
GITLAB_PROJECT_PATH="${GITLAB_PROJECT_PATH:-abhijeetnardele24-hash/accessgraph}"

echo "==> Configuring Workload Identity Pool on GCP..."
gcloud iam workload-identity-pools create "${POOL_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitLab CI Pool" || true

echo "==> Configuring Workload Identity Provider for GitLab OIDC..."
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_NAME}" \
  --display-name="GitLab Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.project_path=assertion.project_path" \
  --issuer-uri="https://gitlab.com" \
  --allowed-audiences="https://gitlab.com" || true

echo "==> Creating Least-Privilege Deployer Service Account..."
gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
  --display-name="GitLab CI Cloud Run Deployer" \
  --project="${PROJECT_ID}" || true

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "==> Binding Workload Identity User Role scoped to repository ${GITLAB_PROJECT_PATH}..."
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.project_path/${GITLAB_PROJECT_PATH}"

echo "==> Granting Cloud Run Admin and Artifact Registry Writer roles..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

echo "==> WIF setup complete! Use this audience in GitLab CI:"
echo "    //iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
