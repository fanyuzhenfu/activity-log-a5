#!/usr/bin/env bash
set -euo pipefail

: "${GH_REPO:?GH_REPO is required}"
: "${RELEASE_TAG:?RELEASE_TAG is required}"
: "${RELEASE_TITLE:?RELEASE_TITLE is required}"
: "${RELEASE_NOTES_FILE:?RELEASE_NOTES_FILE is required}"
: "${RELEASE_ASSET:?RELEASE_ASSET is required}"

prerelease_flag=()
if [[ "${PRERELEASE:-false}" == "true" ]]; then
  prerelease_flag=(--prerelease)
fi

created_by_this_attempt=false
cleanup_failed_release() {
  exit_code=$?
  if [[ $exit_code -ne 0 && "$created_by_this_attempt" == "true" ]]; then
    echo "Release publication failed. Removing the release and tag created by this attempt."
    gh release delete "$RELEASE_TAG" --repo "$GH_REPO" --cleanup-tag --yes || true
  fi
  exit "$exit_code"
}
trap cleanup_failed_release EXIT

if gh release view "$RELEASE_TAG" --repo "$GH_REPO" >/dev/null 2>&1; then
  echo "Release $RELEASE_TAG already exists. Updating notes and replacing the asset safely."
  gh release edit "$RELEASE_TAG" \
    --repo "$GH_REPO" \
    --title "$RELEASE_TITLE" \
    --notes-file "$RELEASE_NOTES_FILE" \
    "${prerelease_flag[@]}"
  gh release upload "$RELEASE_TAG" "$RELEASE_ASSET" --repo "$GH_REPO" --clobber
else
  created_by_this_attempt=true
  gh release create "$RELEASE_TAG" "$RELEASE_ASSET" \
    --repo "$GH_REPO" \
    --target "$GITHUB_SHA" \
    --title "$RELEASE_TITLE" \
    --notes-file "$RELEASE_NOTES_FILE" \
    "${prerelease_flag[@]}"
fi

created_by_this_attempt=false
trap - EXIT
gh release view "$RELEASE_TAG" --repo "$GH_REPO" --json url,tagName,isPrerelease
