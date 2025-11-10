# Session 8 - Authentication Screens (PROPER TDD)

**Status**: Not Started
**Estimated Time**: 3-4 hours
**Philosophy**: RED → GREEN → REFACTOR (No shortcuts)

---

## Ground Rules (MANDATORY)

1. **NO code before tests** - Period. Not even a single component.
2. **RED phase first** - Write failing test, see it fail
3. **GREEN phase second** - Minimal code to pass test
4. **REFACTOR phase third** - Clean up, optimize, extract
5. **Run tests after EVERY change** - `npm run test:run`
6. **TypeScript strict mode** - Zero errors, zero `any` types
7. **Commit after each screen** - One screen = one commit

---

## Session 8 Scope

**What We're Building:**

- LoginScreen (React Hook Form + Zod + useLogin)
- RegisterScreen (React Hook Form + Zod + useRegister)
- OTPVerificationScreen (6-digit input + useVerifyOTP + useResendOTP)

**What We're NOT Building:**

- ~~ProjectsListScreen~~ (Session 9)
- ~~ProjectDetailScreen~~ (Session 9)
- ~~ProjectFormScreen~~ (Session 9)
- ~~ProfileScreen~~ (Already complete - just theme toggle)

---

## Part 1: LoginScreen (TDD)

### 1.1 RED - Write Failing Tests

**File**: `src/features/auth/screens/__tests__/LoginScreen.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LoginScreen } from '../LoginScreen'

// Test 1: Renders form elements
describe('LoginScreen', () => {
  it('should render email and password inputs', () => {
    // RED: This will fail - screen doesn't have form yet
  })

  it('should render login button', () => {
    // RED: This will fail
  })

  it('should render link to register screen', () => {
    // RED: This will fail
  })
})

// Test 2: Validation (Zod schema)
describe('LoginScreen - Validation', () => {
  it('should show error for invalid email', () => {
    // RED: No validation yet
  })

  it('should show error for empty password', () => {
    // RED: No validation yet
  })

  it('should not submit form with invalid data', () => {
    // RED: No form submission yet
  })
})

// Test 3: Form submission
describe('LoginScreen - Form Submission', () => {
  it('should call useLogin hook on valid submission', () => {
    // RED: No hook integration yet
  })

  it('should show loading state during login', () => {
    // RED: No loading state yet
  })

  it('should display error message on login failure', () => {
    // RED: No error handling yet
  })

  it('should navigate to Main stack on success', () => {
    // RED: No navigation on success yet
  })
})
```

**Run tests**: `npm run test:run src/features/auth/screens/__tests__/LoginScreen.test.tsx`
**Expected**: All RED (failing)

---

### 1.2 GREEN - Implement LoginScreen

**Steps** (in order):

1. **Minimal structure** - Just render form elements to pass "renders" tests
2. **Add Zod schema** - Import from `@/schemas/auth.schema.ts`
3. **Integrate React Hook Form** - `useForm` with `zodResolver`
4. **Add validation** - Show error messages to pass validation tests
5. **Integrate useLogin** - Call mutation hook to pass submission tests
6. **Add loading state** - Show loading during mutation
7. **Add error handling** - Display error message from mutation
8. **Add navigation** - Navigate on success (auth state auto-switches stack)

**After EACH step**: Run tests, ensure GREEN before next step

---

### 1.3 REFACTOR - Clean Up LoginScreen

- Extract form field components if >500 lines
- Extract validation error display logic
- Extract loading/error UI to components
- Ensure no code duplication
- Verify TypeScript strict mode (0 errors)

---

### 1.4 Commit LoginScreen

```bash
git add src/features/auth/screens/LoginScreen.tsx
git add src/features/auth/screens/__tests__/LoginScreen.test.tsx
git commit -m "feat(mobile): Implement LoginScreen with TDD

RED phase:
- Wrote 12 failing tests (render, validation, submission)
- All tests failed as expected

GREEN phase:
- Implemented form with React Hook Form + Zod
- Integrated useLogin mutation hook
- Added loading state and error handling
- Added navigation on success

REFACTOR phase:
- Extracted error display component
- Cleaned up validation logic

Tests: 12/12 passing
TypeScript: 0 errors
"
```

---

## Part 2: RegisterScreen (TDD)

### 2.1 RED - Write Failing Tests

**File**: `src/features/auth/screens/__tests__/RegisterScreen.test.tsx`

```typescript
// Test 1: Renders form elements
it('should render email, password, first name, last name inputs')
it('should render password confirmation input')
it('should render register button')
it('should render link to login screen')

// Test 2: Validation
it('should show error for invalid email')
it('should show error for weak password')
it('should show error when passwords do not match')
it('should show error for empty required fields')

// Test 3: Form submission
it('should call useRegister hook on valid submission')
it('should show loading state during registration')
it('should navigate to OTP screen with email on success')
it('should display error message on registration failure')
```

**Expected**: All RED

---

### 2.2 GREEN - Implement RegisterScreen

**Steps**:

1. Render form elements (email, password, confirmPassword, firstName, lastName)
2. Add Zod schema with password confirmation validation
3. Integrate React Hook Form
4. Show validation errors
5. Integrate useRegister hook
6. Add loading state
7. Add error handling
8. Navigate to OTPVerification with email param on success

**After EACH step**: Run tests, ensure GREEN

---

### 2.3 REFACTOR - Clean Up RegisterScreen

- Extract password strength indicator (if added)
- Extract form field wrapper component
- Clean up validation logic
- Verify 0 TypeScript errors

---

### 2.4 Commit RegisterScreen

---

## Part 3: OTPVerificationScreen (TDD)

### 3.1 RED - Write Failing Tests

**File**: `src/features/auth/screens/__tests__/OTPVerificationScreen.test.tsx`

```typescript
// Test 1: Renders OTP input
it('should render 6-digit OTP input')
it('should display email from route params')
it('should render verify button')
it('should render resend OTP button')

// Test 2: OTP input validation
it('should only accept numeric input')
it('should limit input to 6 digits')
it('should auto-focus next input on digit entry')
it('should enable verify button when 6 digits entered')

// Test 3: Countdown timer
it('should display countdown timer for resend')
it('should disable resend button during countdown')
it('should enable resend button after countdown')

// Test 4: Form submission
it('should call useVerifyOTP hook on verify')
it('should show loading state during verification')
it('should navigate to Main stack on success')
it('should display error message on invalid OTP')

// Test 5: Resend OTP
it('should call useResendOTP hook on resend click')
it('should restart countdown after resend')
it('should show success message after resend')
```

**Expected**: All RED

---

### 3.2 GREEN - Implement OTPVerificationScreen

**Steps**:

1. Render 6-digit OTP input (TextInput array)
2. Display email from route.params
3. Add numeric input validation
4. Add auto-focus logic (refs + onChangeText)
5. Add countdown timer (useState + useEffect + setInterval)
6. Integrate useVerifyOTP hook
7. Integrate useResendOTP hook
8. Add loading states
9. Add error handling
10. Navigate on success

**After EACH step**: Run tests, ensure GREEN

---

### 3.3 REFACTOR - Clean Up OTPVerificationScreen

- Extract OTP input component (6 TextInputs)
- Extract countdown timer component
- Clean up refs logic
- Verify 0 TypeScript errors

---

### 3.4 Commit OTPVerificationScreen

---

## Part 4: Final Verification

### 4.1 Run Full Test Suite

```bash
npm run test:run
```

**Expected**:

- All auth screen tests passing
- No regressions in other tests
- Test count: 139 + ~30 new tests = ~169 passing

---

### 4.2 TypeScript Check

```bash
npm run type-check
```

**Expected**: 0 errors (production code)

---

### 4.3 Manual Testing (Optional but Recommended)

```bash
npm start
```

**Test Flow**:

1. See LoginScreen (not authenticated)
2. Click "Create Account" → RegisterScreen
3. Fill form → Submit → OTPVerificationScreen
4. Enter OTP → Verify → ProjectsListScreen (authenticated)
5. Logout → LoginScreen (back to auth flow)

---

## Exit Criteria (Session 8)

- [ ] LoginScreen: 12+ tests passing
- [ ] RegisterScreen: 12+ tests passing
- [ ] OTPVerificationScreen: 15+ tests passing
- [ ] All existing tests still passing (139)
- [ ] Total tests: ~169 passing (93%+)
- [ ] TypeScript errors: 0 (production code)
- [ ] Manual auth flow works end-to-end
- [ ] Forms validate correctly (Zod schemas)
- [ ] API calls work (useLogin, useRegister, useVerifyOTP, useResendOTP)
- [ ] Navigation flows correctly (auth → app)

---

## Success Metrics

**Code Quality**:

- ✅ 100% TDD compliance (tests written FIRST)
- ✅ 0 TypeScript errors
- ✅ 0 `any` types
- ✅ Max 500 lines per file
- ✅ All functions have explicit return types

**Testing**:

- ✅ 93%+ test pass rate
- ✅ All auth screens have comprehensive tests
- ✅ Forms validated with Zod
- ✅ API integration tested

**UX**:

- ✅ Forms are keyboard-friendly
- ✅ Validation errors are clear
- ✅ Loading states visible
- ✅ Error messages helpful

---

## Time Estimate Breakdown

- LoginScreen (TDD): 1 hour
- RegisterScreen (TDD): 1 hour
- OTPVerificationScreen (TDD): 1.5 hours
- Final verification + manual testing: 30 min

**Total**: 4 hours (with proper TDD discipline)

---

## Lessons Learned (Session 7)

1. **Never violate TDD** - Even for "simple" placeholders
2. **Tests first, always** - No exceptions
3. **Commit frequently** - After each screen
4. **Run tests after EVERY change** - Catch regressions early
5. **TypeScript strict mode** - Zero tolerance for errors

---

## Ready to Start?

When you're ready for Session 8, we'll follow this plan TO THE LETTER:

1. Create test file
2. Write RED tests
3. Watch them fail
4. Implement GREEN (minimal code)
5. Watch tests pass
6. REFACTOR (clean up)
7. Commit

**No shortcuts. No rushing. TDD all the way.** 🎯
