# Assignment 5 — Automated Testing in GitHub Workflow

This repository demonstrates a free GitHub Actions pipeline for Assignment 5.

## Pipeline

`Build → Unit (Node 20/22) → Integration → Coverage Gate → Dev → Staging → Production`

The `assignment5-testing.yml` workflow has separate jobs and explicit `needs` dependencies. A failed unit, integration, or coverage job prevents every release job from running. The `test_scenario` input is available only through `workflow_dispatch`; normal pull requests always run the passing test suite without creating releases.

## Tests and reports

- Unit tests cover placeholder replacement, merged pull requests, and private-repository hiding.
- Integration tests use fixed fixtures and a fake Octokit-shaped client, so they do not call GitHub or require secrets.
- Node 20 and Node 22 run the unit matrix.
- Node 22 runs the native coverage gate and uploads LCOV data.
- Unit and integration jobs upload JUnit XML with `if: always()`.

## Environments

Configure `dev`, `staging`, and `production` in the repository settings. Production must use a required reviewer named `fanyuzhenfu`, with administrator bypass disabled. The production job is intentionally not self-approved by automation.

## Demonstrations

Run the workflow manually with `fail-integration` to show a real failed integration job and skipped releases. Run with `pass` to reach the production environment approval gate. The same uploaded ZIP and SHA-256 checksum are downloaded and verified by every deployment job.
