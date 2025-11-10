# Mobile App - React Native

Full-featured React Native mobile application with authentication, project management, and offline-first architecture.

## Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript (strict mode)
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation v6
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + React Native Testing Library
- **Date Pickers**: react-native-paper-dates

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- iOS Simulator (macOS only) or Android Emulator
- Expo Go app on physical device (optional)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Running on Device/Emulator

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR code from terminal)
npm start
```

## Scripts

### Development
```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
```

### Testing
```bash
npm test               # Run tests in watch mode
npm run test:run       # Run tests once
npm run test:ui        # Open Vitest UI
npm run test:coverage  # Generate coverage report
```

### Quality Checks
```bash
npm run type-check     # TypeScript type checking
npm run lint           # ESLint
npm run format         # Prettier formatting
npm run format:check   # Check formatting
```

## Project Structure

```
mobile/
├── src/
│   ├── api/                 # Auto-generated API client (from OpenAPI)
│   ├── components/          # Shared components
│   ├── config/              # Configuration (API URLs, constants)
│   ├── constants/           # App-wide constants (colors, labels)
│   ├── features/            # Feature-based modules
│   │   ├── auth/            # Authentication feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── __tests__/
│   │   └── projects/        # Projects feature
│   │       ├── components/  # ProjectCard, etc.
│   │       ├── hooks/       # useProjects, useProject, etc.
│   │       ├── screens/     # ProjectsListScreen, ProjectDetailScreen, etc.
│   │       ├── stores/      # Zustand stores
│   │       └── __tests__/
│   ├── hooks/               # Global hooks (useAppTheme)
│   ├── navigation/          # Navigation structure
│   │   ├── AuthStack.tsx    # Auth screens (Login, Register, OTP)
│   │   ├── MainStack.tsx    # Main app (Projects, Profile)
│   │   └── RootNavigator.tsx
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # API clients, query client
│   ├── stores/              # Global Zustand stores (auth, theme)
│   ├── test/                # Test utilities and helpers
│   ├── theme/               # React Native Paper theme
│   └── App.tsx              # App entry point
├── assets/                  # Images, fonts
├── .gitignore
├── app.json                 # Expo config
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json            # TypeScript config
└── vitest.config.ts         # Vitest config
```

## Features

### Authentication
- Email-based registration with OTP verification
- Login with token-based auth (JWT)
- Persistent auth state (AsyncStorage + Zustand)
- Automatic token refresh
- Logout functionality

### Projects Management
- List all projects with infinite scroll
- View project details
- Create new projects with form validation
- Edit existing projects
- Delete projects with confirmation
- Date pickers for start/due dates
- Status and priority management
- Overdue indicators

### UI/UX
- Material Design 3 (React Native Paper)
- Dark/Light mode toggle with persistence
- Responsive dropdowns for Status/Priority
- Calendar date pickers
- WCAG-compliant color contrast
- Loading states and error handling

## Testing Philosophy

This project follows **Test-Driven Development (TDD)**:
1. **RED**: Write failing test first
2. **GREEN**: Implement minimal code to pass
3. **REFACTOR**: Improve code quality

### Test Coverage
- Minimum 85% code coverage required
- Unit tests for all hooks, stores, services
- Component tests for screens and UI components
- Integration tests for complete flows

### Running Tests
```bash
# Watch mode (recommended during development)
npm test

# Run once (CI/CD)
npm run test:run

# With coverage
npm run test:coverage

# UI mode (visual test runner)
npm run test:ui
```

## Code Quality

### TypeScript
- **Strict mode** enabled
- **No `any` types** - use `unknown` if type is truly unknown
- **Explicit return types** on all functions
- **noUncheckedIndexedAccess** for safe array access

### ESLint + Prettier
- Auto-formatting on save (recommended)
- Consistent code style across team
- Pre-commit hooks (if configured)

## API Integration

### Auto-Generated Client
The API client in `src/api/` is auto-generated from the backend's OpenAPI schema.

**NEVER manually edit files in `src/api/`**

To regenerate after backend changes:
```bash
npm run generate:api
```

### API Configuration
Edit `src/config/api.ts` to change API URLs:
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000'  // Android emulator
  : 'https://api.production.com'
```

## State Management

### Zustand Stores
- **authStore**: User authentication state
- **themeStore**: Dark/Light mode preference
- **projectsStore**: Projects data (local state)

### React Query
- Server state management
- Automatic caching and refetching
- Optimistic updates
- Infinite scroll pagination

## Navigation

### Stack Structure
```
RootNavigator
├── AuthStack (not authenticated)
│   ├── Login
│   ├── Register
│   └── OTPVerification
└── MainStack (authenticated)
    ├── ProjectsStack (nested)
    │   ├── ProjectsList
    │   ├── ProjectDetail
    │   └── ProjectForm
    └── Profile (tab)
```

### Navigation Props
All screens receive typed navigation props via `NativeStackScreenProps`:
```typescript
type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectDetail'>
```

## Form Validation

### Zod Schemas
All forms use Zod schemas for validation:
- `projectCreateSchema`: Create project validation
- `projectUpdateSchema`: Edit project validation
- `loginSchema`: Login form validation
- `registerSchema`: Registration form validation

### React Hook Form
Forms use React Hook Form with Zod resolver:
```typescript
const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(projectCreateSchema),
})
```

## Troubleshooting

### Common Issues

**Type errors in node_modules**
```bash
# These are expected from react-native-paper dependencies
# Our app code (src/*) is fully type-safe
npm run type-check 2>&1 | grep -v "node_modules"
```

**Metro bundler cache issues**
```bash
npm start -- --clear
```

**iOS simulator not starting**
```bash
# Reset simulator
xcrun simctl erase all
```

**Android emulator connection issues**
```bash
# Check emulator is running
adb devices

# Reverse port for API access
adb reverse tcp:8000 tcp:8000
```

**Tests failing**
```bash
# Clear test cache
npm run test:run -- --clearCache
```

## Environment Variables

Currently uses `__DEV__` flag for development vs production.

For more complex needs, use `react-native-config` or `expo-constants`.

## Deployment

### Expo EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Over-The-Air (OTA) Updates
```bash
# Publish update
eas update --branch production
```

## Architecture Decisions

### Why Zustand?
- Lightweight (< 1KB)
- No boilerplate
- Built-in persistence
- TypeScript-friendly

### Why React Query?
- Industry standard for server state
- Automatic caching and background refetching
- Optimistic updates out of the box
- Excellent TypeScript support

### Why React Native Paper?
- Material Design 3 implementation
- Cross-platform consistency
- Large component library
- Active maintenance

### Why Vitest?
- Faster than Jest
- Better TypeScript support
- Vite-compatible
- Modern testing features

## Contributing

1. Follow TDD: Write tests first
2. Maintain 85%+ code coverage
3. No type errors in app code
4. Format with Prettier
5. Lint with ESLint

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

## License

See root README for license information.
