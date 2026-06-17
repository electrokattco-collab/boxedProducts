# Security Policy for BoxedProducts

Thank you for taking the time to responsibly disclose security issues in BoxedProducts. We take security seriously — this document explains how to report vulnerabilities and what to expect.

Contact
-------
- Preferred: Open a GitHub Security Advisory or create a private security issue in this repository.
- If you cannot use GitHub security features, email: security@electrokatt.co

Reporting Guidelines
--------------------
Please include:
- A clear description of the vulnerability and steps to reproduce it (minimal PoC if possible).
- Impact (data exposure, remote code execution, privilege escalation, etc.).
- Affected versions/branches and any remediation suggestions.
- Any exploit code, screenshots, or logs that help triage the issue.

Handling & Timeline
-------------------
- We will acknowledge receipt within 72 hours.
- For valid security issues we will:
  1. Triage and assign severity.
  2. Create a private issue or advisory to track remediation.
  3. Provide status updates as we work on a fix.
- We follow coordinated disclosure practices. For non-critical issues we may ask for up to 90 days to prepare a fix and release. For critical issues we will prioritize faster fixes and coordinate with the reporter.

Public Disclosure & CVEs
------------------------
- We will work with reporters on coordinated disclosure and will credit reporters who follow responsible disclosure.
- If appropriate, we will request a CVE and include details in release notes after a fix is released.

What We Provide
----------------
- Acknowledgement and status updates.
- A public advisory and release notes once a fix is available (timing depends on severity and coordination).

Security Practices in this Repository
-------------------------------------
- Dependabot configuration added to keep dependencies updated: .github/dependabot.yml (automated weekly checks and PRs for dependency updates).
- We recommend enabling GitHub code scanning and secret scanning for this repository and running `npm audit` locally/CI.

Next Steps (recommended)
------------------------
- Run `npm audit` and fix any reported issues locally or through Dependabot PRs.
- Enable GitHub Actions to run `npm audit --audit-level=moderate` on push/PR.
- Consider enabling GitHub Advanced Security (code scanning) if available to your organization.
- Review and merge Dependabot PRs regularly and test each dependency upgrade.

Thanks
------
Security team — BoxedProducts
