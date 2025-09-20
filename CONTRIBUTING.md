# Contributing to GamePulse SDK

We welcome contributions to the GamePulse SDK team! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+ (for Android development)
- **Xcode** 15+ (for iOS development)
- **Unity** 2020.3+ (for Unity development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gamepulse/gamepulse-sdk.git
   cd gamepulse-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build all packages**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📝 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical fixes for production

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards for each platform
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(android): add new event tracking method
fix(ios): resolve memory leak in network client
docs: update installation instructions
test(unity): add integration tests for event builders
```

## 🏗️ Platform-Specific Guidelines

### Android (Java)

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Add JavaDoc comments for public APIs
- Ensure compatibility with Android API 21+

### iOS (Swift)

- Follow [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)
- Use Swift 5.0+ features appropriately
- Add documentation comments for public APIs
- Ensure compatibility with iOS 12.0+

### Unity (C#)

- Follow [Microsoft C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/coding-conventions)
- Use PascalCase for public members
- Add XML documentation for public APIs
- Ensure compatibility with Unity 2020.3+

### Web (TypeScript)

- Follow [TypeScript coding guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)
- Use ESLint and Prettier for code formatting
- Add JSDoc comments for public APIs
- Ensure Node.js 14+ compatibility

## 🧪 Testing

### Running Tests

```bash
# All platforms
npm test

# Specific platform
cd packages/android && ./gradlew test
cd packages/ios && xcodebuild test
cd packages/unity && # Unity Test Runner
cd packages/web && npm test
```

### Test Coverage

- Aim for 80%+ test coverage
- Write unit tests for all public APIs
- Add integration tests for critical workflows
- Test error handling and edge cases

### Test Structure

```
packages/
├── android/src/test/
├── ios/Tests/
├── unity/Tests/
└── web/src/__tests__/
```

## 📚 Documentation

### API Documentation

- Document all public APIs with examples
- Include parameter descriptions and return values
- Add usage examples for complex features
- Update README files when adding new features

### Code Comments

- Use clear, concise comments
- Explain "why" not "what"
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

## 🔍 Code Review Process

### Pull Request Guidelines

1. **Clear Description**
   - Describe what changes were made and why
   - Link to related issues
   - Include screenshots for UI changes

2. **Small, Focused Changes**
   - Keep PRs focused on a single feature or fix
   - Split large changes into multiple PRs

3. **Tests and Documentation**
   - Include tests for new functionality
   - Update documentation as needed
   - Ensure CI passes

### Review Checklist

- [ ] Code follows platform conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues for duplicates
2. Test with the latest version
3. Provide minimal reproduction steps

### Bug Report Template

```markdown
**Environment:**
- Platform: [Android/iOS/Unity/Web]
- SDK Version: [e.g., 2.0.0]
- Platform Version: [e.g., Android 12, iOS 16, Unity 2022.3]

**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Initialize SDK with...
2. Call method...
3. Observe error...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Additional Context:**
Logs, screenshots, etc.
```

## 💡 Feature Requests

### Before Submitting

1. Check if feature already exists
2. Consider if it fits the SDK's scope
3. Think about cross-platform compatibility

### Feature Request Template

```markdown
**Problem Statement:**
What problem does this solve?

**Proposed Solution:**
How should this work?

**Alternatives Considered:**
Other approaches you've considered

**Additional Context:**
Use cases, examples, etc.
```

## 📋 Release Process

### Version Management

We use [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

### Release Steps

1. Update version numbers in all packages
2. Update CHANGELOG.md
3. Create release PR
4. Tag release after merge
5. Automated publishing via GitHub Actions

## 🤝 Community

### Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Getting Help

- 📧 Email: support@gamepulse.com
- 💬 Discord: [Gamepulse Community](https://discord.gg/gamepulse)
- 🐛 Issues: [GamePulse SDK Issues](https://github.com/gamepulse/gamepulse-sdk/issues)

### Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for your interest in contributing to the GamePulse SDK! 🎮
