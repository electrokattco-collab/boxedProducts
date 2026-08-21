# Git Workflow Guide - Boxed Sneakers

Proper Git workflow for developing the React migration without breaking the live site.

---

## Branch Overview

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production code | GitHub Pages (live) |
| `development` | Integration branch | Staging environment |
| `feature/*` | New features | Preview deployments |
| `hotfix/*` | Urgent fixes | Production (emergency) |

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Git Workflow                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐   │
│  │  Feature │      │  Feature │      │  Feature │      │  Hotfix  │   │
│  │   Auth   │      │   Cart   │      │   React  │      │  Critical│   │
│  └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘   │
│       │                 │                 │                 │          │
│       │ PR              │ PR              │ PR              │ PR       │
│       ▼                 ▼                 ▼                 ▼          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      development branch                           │  │
│  │                   (Staging: dev.boxedsneakers.com)                │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │                                      │
│                                  │ PR (after testing)                   │
│                                  ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         main branch                               │  │
│  │              (Production: boxedsneakers.com)                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference Commands

### Starting New Work

```bash
# 1. Make sure you're on development branch
git checkout development
git pull origin development

# 2. Create feature branch
git checkout -b feature/react-migration

# 3. Work on your changes...
# ... edit files ...

# 4. Commit changes
git add .
git commit -m "feat: add React router configuration"

# 5. Push to remote
git push origin feature/react-migration

# 6. Create Pull Request on GitHub
```

### Syncing Changes

```bash
# Update your local development branch
git checkout development
git pull origin development

# Update feature branch with latest development
git checkout feature/react-migration
git merge development
# or
git rebase development
```

### Completing Work

```bash
# Push final changes
git push origin feature/react-migration

# On GitHub:
# 1. Create PR: feature/react-migration → development
# 2. Request review
# 3. Merge after approval

# Clean up local branch
git checkout development
git branch -d feature/react-migration
```

---

## Detailed Workflow

### 1. Feature Development

```bash
# Start from development
git checkout development
git pull origin development

# Create descriptive branch name
git checkout -b feature/add-product-filters

# Make small, focused commits
git add src/components/Filters/
git commit -m "feat: add product filter components"

git add src/hooks/useFilters.js
git commit -m "feat: add useFilters hook with category filtering"

# Push regularly
git push origin feature/add-product-filters
```

### 2. Code Review Process

```bash
# Before creating PR, ensure clean history
git checkout development
git pull origin development
git checkout feature/add-product-filters
git rebase development

# Push (force if rebased)
git push origin feature/add-product-filters --force-with-lease

# Create PR on GitHub with template
```

### 3. Staging Deployment

```bash
# After PR is approved and merged to development
git checkout development
git pull origin development

# This triggers automatic staging deployment
# Verify at: https://dev.boxedsneakers.com
```

### 4. Production Release

```bash
# When ready to release
git checkout main
git pull origin main
git merge development

# Create version tag
git tag -a v1.0.0 -m "Release version 1.0.0 - React migration"
git push origin main --tags

# This triggers production deployment
# Verify at: https://boxedsneakers.com
```

---

## Commit Message Convention

Use conventional commits for clear history:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Use When |
|------|----------|
| `feat` | Adding new feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
# Feature
git commit -m "feat(products): add real-time product sync with Firebase"

# Bug fix
git commit -m "fix(cart): resolve quantity update bug"

# Documentation
git commit -m "docs(readme): update deployment instructions"

# Breaking change
git commit -m "feat(auth): switch to Firebase Auth

BREAKING CHANGE: localStorage auth tokens no longer supported"
```

---

## Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation
- [ ] Refactoring

## Testing
<!-- How did you test? -->
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested

## Screenshots
<!-- If UI changes -->

## Related Issues
<!-- Link to issues -->
Fixes #123
```

---

## Emergency Hotfix Workflow

For critical production issues:

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-checkout-bug

# 2. Fix the issue
git add .
git commit -m "hotfix: resolve checkout payment error"

# 3. Push and create PR to main
git push origin hotfix/fix-checkout-bug

# 4. After PR merged, also merge to development
git checkout development
git merge hotfix/fix-checkout-bug
git push origin development

# 5. Clean up
git branch -d hotfix/fix-checkout-bug
```

---

## Branch Protection Rules

Set up in GitHub Settings > Branches:

### Main Branch
- [ ] Require pull request reviews before merging (1 reviewer)
- [ ] Require status checks to pass
- [ ] Require branches to be up to date
- [ ] Include administrators
- [ ] Restrict pushes that create files larger than 100MB

### Development Branch
- [ ] Require pull request reviews before merging
- [ ] Require status checks to pass
- [ ] Allow force pushes (for maintainers)

---

## Common Scenarios

### Scenario 1: Need to switch tasks

```bash
# Stash current work
git stash push -m "WIP: product filters"

# Switch to other branch
git checkout other-feature

# Later, return and restore
git checkout feature/product-filters
git stash pop
```

### Scenario 2: Made changes to wrong branch

```bash
# Save changes
git stash

# Switch to correct branch
git checkout correct-branch

# Apply changes
git stash pop
```

### Scenario 3: Need to undo last commit

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1

# If already pushed (use carefully!)
git revert HEAD
git push origin branch-name
```

### Scenario 4: Merge conflict

```bash
# During merge/rebase
git status

# Edit conflicted files, look for <<<<<<< markers
# Resolve conflicts

git add <resolved-files>
git commit  # or git rebase --continue
```

---

## Useful Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
    # Quick status
    s = status -sb
    
    # Better log
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    
    # Feature workflow
    feature = "!f() { git checkout development && git pull origin development && git checkout -b feature/$1; }; f"
    
    # Publish current branch
    publish = "!git push -u origin $(git branch --show-current)"
    
    # Undo last commit
    undo = reset --soft HEAD~1
    
    # Sync development
    sync = "!git checkout development && git pull origin development"
```

---

## Checklist for Each Work Session

### Before Starting
- [ ] `git checkout development`
- [ ] `git pull origin development`
- [ ] `git checkout -b feature/descriptive-name` (or existing branch)

### During Work
- [ ] Make small, focused commits
- [ ] Write clear commit messages
- [ ] Push regularly to remote

### Before PR
- [ ] `git checkout development`
- [ ] `git pull origin development`
- [ ] `git checkout feature/branch`
- [ ] `git rebase development` (resolve conflicts if any)
- [ ] Test locally
- [ ] Push: `git push origin feature/branch --force-with-lease`

### After PR Merge
- [ ] Delete local branch: `git branch -d feature/branch`
- [ ] Delete remote branch: `git push origin --delete feature/branch`
- [ ] Verify deployment

---

## Current Status

**Current Branch:** `development`

**Protected Branches:**
- `main` - Production (requires PR + review)
- `development` - Staging (requires PR)

**Live Sites:**
- Production: https://electrokattco-collab.github.io/boxedProducts/
- Staging: (to be configured)

---

*Last updated: 2026-05-18*
