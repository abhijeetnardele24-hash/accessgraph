#!/usr/bin/env bash
set -euo pipefail

# RouteWitness — Google Cloud Run Candidate Deployment Script
# Deploys a tagged candidate revision with 0% traffic for pre-release witness replay.

PROJECT_ID="${GCP_PROJECT_ID:-accessgraph-transcend}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${CLOUD_RUN_SERVICE:-routewitness-app}"
IMAGE_TAG="${CI_COMMIT_SHA:-latest}"
REVISION_TAG="rev-${CI_COMMIT_SHORT_SHA:-candidate}"

IMAGE_URI="us-central1-docker.pkg.dev/${PROJECT_ID}/routewitness/app:${IMAGE_TAG}"

echo "==> Deploying RouteWitness candidate revision to Google Cloud Run..."
echo "    Project:  ${PROJECT_ID}"
echo "    Region:   ${REGION}"
echo "    Service:  ${SERVICE_NAME}"
echo "    Image:    ${IMAGE_URI}"
echo "    Revision: ${REVISION_TAG}"

# Deploy candidate with no initial traffic (0%)
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_URI}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --tag "${REVISION_TAG}" \
  --no-traffic \
  --quiet

CANDIDATE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --format='value(status.traffic[0].url)')

echo "==> Tagged candidate URL available for Journey Witness replay:"
echo "    ${CANDIDATE_URL}"
