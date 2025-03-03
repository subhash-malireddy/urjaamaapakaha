# Debugging Jest Tests

This project is configured with debugging support for Jest tests. This document explains how to use the debugging features.

## Available Debug Configurations

Four debug configurations have been set up in `.vscode/launch.json`:

1. **Debug Jest Current File - Windows** - Debug the currently open test file using a Node.js helper script that handles path conversion (recommended for Windows)
2. **Debug Jest Current File (Full Path)** - Debug the currently open test file using its full path (may have issues on Windows)
3. **Debug Jest by FileName (Without Extension)** - Debug test(s) matching the current file's name
4. **Debug All Tests** - Debug all tests in the project

## Windows Path Issues

On Windows, there can be issues with file paths when using Jest directly due to backslashes (`\`) in Windows paths. We've provided a Node.js helper script solution that:

1. Takes a file path as input
2. Converts backslashes to forward slashes
3. Runs Jest with the normalized path

This approach is cross-platform, reliable, and handles the Windows path separator issues elegantly.

## How to Debug Tests

### Setting Up Breakpoints

1. Open a test file (e.g., `__tests__/debug-example.test.tsx`)
2. Click in the gutter (the space to the left of the line numbers) to set a breakpoint on a specific line
3. A red dot will appear, indicating a breakpoint has been set

### Starting the Debugger

1. Open the test file you want to debug
2. Press `F5` or click on the "Run and Debug" icon in the sidebar
3. Select "Debug Jest Windows (Path Helper)" from the dropdown menu
4. Click the green play button or press `F5` again

### During Debugging

When the debugger hits a breakpoint, execution will pause, and you can:

- Hover over variables to see their values
- Use the Debug Console to evaluate expressions
- Use the Variables panel to inspect the current state
- Use the debug controls to step through code:
  - Continue (F5): Resume execution until the next breakpoint
  - Step Over (F10): Execute the current line and move to the next line
  - Step Into (F11): Step into a function call
  - Step Out (Shift+F11): Step out of the current function

## Example: Debugging the Counter Component

The `__tests__/debug-example.test.tsx` file contains a sample Counter component with tests specifically designed to demonstrate debugging:

1. Open `__tests__/debug-example.test.tsx`
2. Set a breakpoint on line 11 (inside the `increment` function)
3. Start debugging with "Debug Jest Windows (Path Helper)"
4. When the test runs the `increment` function, the debugger will pause
5. Inspect the `count` variable and step through the code

## Running Tests from the Command Line

You can also run tests with the helper script from the command line:

```
npm run test:file __tests__/debug-example.test.tsx
# or
pnpm test:file __tests__/debug-example.test.tsx
```

**Note about pnpm and backslashes**: When using pnpm, you don't need to worry about escaping backslashes in file paths. pnpm automatically escapes backslashes, effectively converting `\` to `\\`, which allows Jest to correctly interpret Windows paths. This means you can use Windows-style paths directly with the `pnpm test` command.

For debugging in VS Code, we still need the helper script because VS Code's debugger doesn't have this automatic escaping behavior.

## How the Path Helper Works

The `jest-path-helper-windows.js` script:

1. Takes a file path as a command-line argument
2. Normalizes the path by converting backslashes to forward slashes
3. Runs Jest with the normalized path
4. Passes through the exit code from Jest

This ensures that file paths work correctly on Windows while still allowing you to debug your tests.

## Tips for Effective Debugging

1. **Use descriptive test names**: This makes it easier to identify which test is running when debugging
2. **Add console.log statements**: These can be helpful for quick debugging without setting breakpoints
3. **Use the debugger statement**: Add `debugger;` in your code to force the debugger to pause at that point
4. **Increase timeout**: If your tests are timing out during debugging, you can increase the `testTimeout` value in `jest.config.js`

## Troubleshooting

If you encounter issues with debugging:

1. **Breakpoints not hitting**: Make sure you're running the correct debug configuration
2. **Tests timing out**: Increase the `testTimeout` value in `jest.config.js`
3. **Source maps issues**: Check that source maps are properly generated
4. **File not found errors on Windows**: Make sure you're using the "Debug Jest Windows (Path Helper)" configuration

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [VS Code Debugging Documentation](https://code.visualstudio.com/docs/editor/debugging)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
