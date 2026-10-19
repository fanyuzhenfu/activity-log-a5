# Proposed correction to AI release review 1.0.6

> Status: Proposed by Codex after inspecting the real Copilot artifact and GitHub Actions run. This is not presented as the student's human-authored review. Awaiting confirmation by the student.

## Draft release notes

- Added a real GitHub Copilot CLI 1.0.96 release-notes agent using the account's Copilot Free included quota.
- The O-mode agent runs only after Staging succeeds, reads delimited commit history and the immutable artifact checksum, and uploads a reviewable Markdown artifact.
- Production in O mode can start only after the AI job and output validation succeed. The protected Production environment still requires manual approval.
- E mode remains independent: it skips the AI job and AI artifact while preserving Build, Dev, Staging, and protected Production deployment.

## Risk summary

- AI notes can be incomplete or misleading because commit subjects do not describe every code or operational change. This draft must be compared with the workflow diff and test evidence.
- Untrusted commit text could contain prompt-injection instructions. The workflow labels it as untrusted, runs Copilot in an empty directory, and denies shell, read, write, URL, and memory tools.
- Copilot Free quota exhaustion or npm/network unavailability will fail the AI job and correctly block O-mode Production; no paid overage is enabled.
- Installing a third-party CLI is a supply-chain risk. The workflow reduces this risk by pinning `@github/copilot` to version `1.0.96`.
- Verified immutable build SHA-256: `423ea5117a292fc1f914a13e9ecb66d8e0112e768cca26c2d67e63ebcd8a7e49` for Dev, Staging, and Production.

## Human review checklist

- Confirm Build, lint, all three unit tests, Dev, and Staging succeeded in Run #6.
- Compare commit `04a1f51` and the workflow diff with these release notes.
- Confirm the AI job has only `contents: read` and `copilot-requests: write` permissions and no Production credentials.
- Confirm the AI artifact contains the required release notes, risk summary, and checklist sections.
- Confirm Dev, Staging, and Production release assets have the same SHA-256 listed above.
- Record that a human, not the AI agent, approved the protected Production deployment.
