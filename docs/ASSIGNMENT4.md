# Assignment 4 deployment pipeline

## Pipeline

The workflow in `.github/workflows/assignment4-pipeline.yml` has two explicit modes.

### E mode

Pushes to `master`, or a manual run with `require_ai_review=false`, run these jobs:

1. Build, lint, test, package, and checksum one immutable artifact.
2. Publish the artifact as a dev prerelease.
3. Publish the same artifact as a staging prerelease.
4. Mark the AI job as skipped because it was not requested.
5. Wait at the protected production environment. Production runs only after a human approves it.

### O mode

A manual run with `require_ai_review=true` runs these jobs:

1. Build, lint, test, package, and checksum one immutable artifact.
2. Publish the artifact as a dev prerelease.
3. Publish the same artifact as a staging prerelease.
4. Run GitHub Copilot CLI with the account's Copilot Free included quota to draft release notes and a risk summary. The output is an artifact for human review.
5. Enter the protected production environment only if the AI job succeeded. Production still runs only after a human approves it.

An AI failure is never converted into success. It blocks Production in O mode but has no role in an E-mode run.

In E mode, Production downloads only the immutable build artifact and creates release notes from the protected production environment variables. In O mode, Production additionally downloads the AI review artifact, verifies that it is non-empty and contains all required review sections, and then includes it in the production release notes.

## Pipeline debugging evidence

Workflow run [#4](https://github.com/fanyuzhenfu/activity-log-a4/actions/runs/38323888922) is intentionally preserved as a real debugging record. Build, Dev, and Staging succeeded, the E-mode AI job was correctly skipped, and a human approved Production. Production then failed because its steps still attempted to download `ai-release-review-1.0.4`. The correction makes both AI artifact download and consumption conditional on O mode; it does not use `continue-on-error` or weaken the production approval rule.

## GitHub environments

Configure these environment variables:

| Environment | BUILD_TAG | RELEASE_NOTE |
| --- | --- | --- |
| `dev` | `dev` | `Development validation release` |
| `staging` | `staging` | `Pre-production validation release` |
| `production` | `prod` | `Approved production release` |

The `release-notes-ai` environment isolates the AI job from every deployment environment. The job uses GitHub's short-lived `GITHUB_TOKEN` with only `contents: read` and `copilot-requests: write`; it does not store a long-lived API key. Copilot Free overage is disabled, so exhausted included quota causes failure instead of a charge. The job has no production environment, production credentials, repository write token, deployment trigger, or approval capability.

Copilot CLI is pinned to version `1.0.96` and runs in an empty directory. Shell, file read/write, URL, and memory tools are denied. Only the artifact checksum and commit history are placed in the prompt, where commits are explicitly delimited as untrusted data. The generated Markdown must contain all required review sections and remain below the size limit before it can be uploaded.

Configure `production` with at least one required reviewer. Enable "Prevent self-review" when a separate reviewer is available, and disable administrator bypass when the repository plan supports it.

## Automation enhancements

- Semantic version: the package major/minor version plus `GITHUB_RUN_NUMBER` produces `1.0.N`.
- Quality gate: JavaScript syntax lint and unit tests run before packaging.
- Duplicate release safety: reruns update the existing release and replace the matching asset instead of failing or silently creating another version.
- Failed publication cleanup: a release and tag created by the current attempt are removed if asset publication fails.

## AI limitations and measurement

Commit messages are incomplete descriptions of code changes. The agent may miss behavioral changes, overstate a vague commit, or omit operational risk. The production reviewer must compare the draft with the diff, test results, and artifact checksum and edit the final notes when necessary.

Measure usefulness for five releases:

- Human editing time in minutes.
- Percentage of AI statements accepted without changes.
- Number of missing or incorrect claims found by the reviewer.
- Whether every high-risk change identified from the diff appears in the risk summary.

The agent adds value only if it reduces review time without increasing missed or incorrect claims.
