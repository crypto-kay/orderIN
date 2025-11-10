# Qwen Project Context File

## Project Overview

This is a cafe management web application built with modern web technologies. The project aims to provide a comprehensive solution for cafe operations including order management, inventory tracking, and customer service.

### Technology Stack
- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Package Manager**: npm

### Project Structure
- `src/` - Main application source code
- `public/` - Static assets
- `dist/` - Build output directory
- Configuration files for TypeScript, ESLint, Tailwind, and Vite

## Coding Standards

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration defined in `eslint.config.js`
- Use Tailwind CSS for styling
- Maintain consistent naming conventions (camelCase for variables, PascalCase for components)

### File Organization
- Components should be organized by feature/domain
- Use clear, descriptive file names
- Keep related files together (components, styles, tests)

### Git Workflow
- Use conventional commit messages
- Ensure all tests pass before committing
- Run linting and type checking before commits

## Workflow

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Quality Assurance
- All new features must include tests
- Code must pass ESLint checks
- TypeScript must compile without errors
- Build process must complete successfully

## AI Editing Rules

### Before Making Changes
1. Always read existing code to understand patterns and conventions
2. Check for existing tests related to the area being modified
3. Verify dependencies in `package.json` before using new libraries
4. Understand the project's architecture and component relationships

### During Implementation
1. Follow existing code patterns and naming conventions
2. Maintain consistency with established styling approach
3. Add appropriate TypeScript types
4. Write tests for new functionality
5. Update documentation as needed

### After Changes
1. Run the test suite and ensure all tests pass
2. Run ESLint and fix any linting issues
3. Perform TypeScript type checking
4. Verify the build process completes successfully
5. Test the changes manually if applicable

### Error Handling
- Always include proper error handling for async operations
- Use try-catch blocks appropriately
- Provide meaningful error messages
- Handle edge cases gracefully

## Latest Context Snapshot (Auto-updated by Qwen)

<!-- 
This section will be automatically updated by Qwen after each major change.
Include the following information:
- Date of last update
- Summary of changes made
- Current project status
- Any important notes or considerations
-->

**Last Updated**: 2025-11-10
**Initial Setup**: Created qwen.md context file
**Project Status**: Initial project structure established
**Notes**: Ready for development with React, TypeScript, and Tailwind CSS stack

<!-- 
Future updates will be appended here in the following format:

**Date**: YYYY-MM-DD
**Changes**: [Brief description of changes]
**Status**: [Current project status]
**Notes**: [Any additional context]

-->