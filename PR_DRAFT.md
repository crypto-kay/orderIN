# PR Draft: chore: prep staging — cleanup, tests, build

## Branch
chore/prep-staging

## Description
This PR prepares the feature/tables-qr-finalize branch for staging release by performing cleanup, removing development artifacts, replacing hardcoded credentials with environment-driven configuration, and ensuring all quality checks pass.

### Changes Made
1. **Dev Artifact Cleanup**
   - Removed empty `$null` file
   - Added `.qodo/` directory to .gitignore
   - Updated .gitignore with additional dev patterns

2. **Credential Security**
   - Replaced hardcoded demo credentials with environment variables
   - Created `.env.example` with configuration template
   - Updated authStore.ts and LoginPage.tsx to use env variables
   - Added environment setup instructions to README.md

3. **Log Cleanup**
   - Gated remaining console.log statements behind NODE_ENV checks
   - Preserved console.error for production debugging

4. **Quality Assurance**
   - ✅ ESLint passes without errors
   - ✅ TypeScript compilation succeeds
   - ✅ Production build completes successfully
   - ⚠️ No test files exist (Vitest configured but no tests written)

### Build Notes
- Build succeeds with warnings about large chunks (>500KB)
- Main bundle: 712.17 kB (gzipped: 225.09 kB)
- Consider code-splitting for optimization in future iterations

## QA Checklist

### Authentication & Access Control
- [ ] Login as Admin - verify dashboard access
- [ ] Login as Staff - verify order/table management access
- [ ] Login as Kitchen - verify KDS access
- [ ] Verify unauthorized users are redirected appropriately

### Core Features
- [ ] **Tables Management**
  - [ ] Create new table
  - [ ] Edit existing table
  - [ ] Delete table
  - [ ] Generate QR code for table
  - [ ] Download QR code
  - [ ] Verify QR code scanning functionality

- [ ] **Order Lifecycle**
  - [ ] Create new order (Pending)
  - [ ] Update order to Preparing
  - [ ] Update order to Served
  - [ ] Cancel order when needed
  - [ ] Verify order status updates across all views

- [ ] **Menu Management**
  - [ ] Create new menu item
  - [ ] Edit existing menu item
  - [ ] Delete menu item
  - [ ] Toggle item availability
  - [ ] Verify menu updates reflect in order creation

### Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Configure environment variables as needed
- [ ] Verify app starts with custom configuration

### Console & Errors
- [ ] Open browser dev tools
- [ ] Verify no console errors in production mode
- [ ] Check that dev logs are properly gated

## Known Issues
1. **Large Bundle Size**: Main bundle exceeds 500KB warning threshold
   - Priority: Medium
   - Action: Consider code-splitting in future iteration
2. **No Test Coverage**: Project has Vitest configured but no test files
   - Priority: High
   - Action: Add unit tests for critical business logic
3. **PouchDB Dynamic Import Warning**: PouchDB is both statically and dynamically imported
   - Priority: Low
   - Action: Review import strategy for consistency

## Testing Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build

# Run tests (when available)
npm test
```

## Merge Requirements
- [ ] All QA checklist items completed
- [ ] No console errors in production mode
- [ ] Environment variables documented and working
- [ ] Build succeeds without critical errors