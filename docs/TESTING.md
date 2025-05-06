# Testing Workflow

This document explains the testing workflow for Pawsitive Insights (Molly's Tracker).

## Testing Infrastructure

The project uses the following testing tools:

- **Jest**: For unit testing JavaScript functions and modules
- **Cypress**: For end-to-end testing of the web application
- **GitHub Actions**: For continuous integration

## Running Tests Locally

### Unit Tests

To run unit tests:

```bash
npm test
```

To run tests with coverage report:

```bash
npm run test:coverage
```

### End-to-End Tests

To run Cypress tests in headless mode:

```bash
npm run cypress:run
```

To open Cypress test runner:

```bash
npm run cypress:open
```

## Continuous Integration

Two GitHub Actions workflows handle testing:

1. `test.yml`: Runs on every push and pull request to validate code changes
2. `deploy.yml`: Runs tests and then deploys to GitHub Pages if tests pass

Both workflows run the full test suite including Jest unit tests and Cypress end-to-end tests.

## Adding New Tests

### Unit Tests

Add unit tests to the `tests/unit/` directory. Follow the pattern in existing test files:

- `data.test.js`: Tests for data operations
- `utils.test.js`: Tests for utility functions

### End-to-End Tests

Add Cypress tests to the `tests/e2e/` directory. The existing tests cover:

- `favorites.cy.js`: Testing the favorites functionality
- `food-tracking.cy.js`: Testing the food tracking functionality

## Mocking

The tests use a mock Supabase client configured in `tests/setup/supabase-mock.js` to simulate database operations without requiring a real database connection.
