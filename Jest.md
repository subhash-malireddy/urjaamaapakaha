# Jest Testing Guide

## Table of Contents

- [Running Tests](#running-tests)
- [Debugging Tests](#debugging-tests)
- [Windows Path Considerations](#windows-path-considerations)
- [Troubleshooting](#troubleshooting)

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run a specific test file
pnpm test __tests__/example.test.tsx
```

### Test File Naming Conventions

- Test files should be placed in the `__tests__` directory
- Name test files with `.test.tsx` or `.test.ts` extension

## Debugging Tests

### Available Debug Configurations

1. **Debug Jest Current File - Windows** - Debug current file using path conversion (recommended for Windows)
2. **Debug Jest Current File (Full Path)** - Debug using full path (may have issues on Windows)
3. **Debug Jest by FileName** - Debug test(s) matching current file's name
4. **Debug All Tests** - Debug all tests in the project

### How to Debug

1. **Set breakpoints** by clicking in the gutter next to line numbers
2. Press **F5** or use the Run and Debug panel
3. Select the appropriate debug configuration
4. Use debug controls:
   - Continue (F5)
   - Step Over (F10)
   - Step Into (F11)
   - Step Out (Shift+F11)

### Debugging Example

```tsx
// In __tests__/example.test.tsx
it("should increment counter", () => {
  // Set a breakpoint on the next line
  const result = increment(1);
  expect(result).toBe(2);
});
```

## Windows Path Considerations

### Command Line

When using pnpm on Windows, backslashes in file paths are automatically escaped:

```bash
# This works fine on Windows
pnpm test __tests__\example.test.tsx
```

### VS Code Debugging

For VS Code debugging on Windows, use the **Debug Jest Current File - Windows** configuration, which uses a helper script to convert backslashes to forward slashes.

## Troubleshooting

### Common Issues

- **Breakpoints not hitting**: Verify you're using the correct debug configuration
- **Tests timing out**: Increase `testTimeout` in jest.config.js
- **Path issues on Windows**: Use the Windows-specific debug configuration
- **Module not found errors**: Check import paths and ensure dependencies are installed

### Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
