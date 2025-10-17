# Unit Tests for Weekly Time Management

## Overview

This directory contains comprehensive unit tests for the business logic of the Weekly Time Management application.

## Test Requirements

**Note:** These tests require Node.js version 18 or higher to run. If you're using an older Node version, please upgrade before running tests.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

## Test Coverage

### 1. Color Management Tests
- **Same content → Same color**: Verifies that cells with identical content receive the same background color
- **Different content → Different colors**: Ensures cells with different content have distinct colors
- **Empty cells**: Confirms empty cells remain transparent
- **New content**: Tests that new content automatically gets assigned an available color
- **Color cleanup**: Verifies unused colors are removed from the mapping
- **Available colors**: Tests the color palette selection logic

### 2. Time Summary Tests
- **Correct counts**: Validates that the time summary accurately counts hours for each activity
- **Sorting**: Ensures activities are sorted by duration (largest to smallest)
- **Color inclusion**: Verifies each summary item includes the correct color
- **Empty cell handling**: Confirms empty or whitespace-only cells are excluded
- **Empty data**: Tests behavior when no data exists

### 3. Cell Data Management Tests
- **Save content**: Tests saving content to cells
- **Retrieve content**: Validates retrieving stored content
- **Whitespace trimming**: Ensures leading/trailing whitespace is removed

### 4. Selection Logic Tests
- **Rectangular selection**: Tests calculating all cells in a selected area
- **Reverse selection**: Validates drag in any direction (bottom-right to top-left)
- **Apply to selection**: Tests applying content to all selected cells
- **Cell selection check**: Verifies the isCellSelected method
- **Single cell**: Tests selecting a single cell

### 5. Data Persistence Tests
- **LocalStorage on save**: Verifies data is saved to localStorage when modified
- **Clear all**: Tests clearing all data and localStorage
- **Cancel clear**: Ensures data remains when user cancels clear operation

## Test File Structure

```
src/tests/
├── App.spec.js       # Main test suite
└── README.md         # This file
```

## Key Test Examples

### Example 1: Same Field Content → Same Background Color

```javascript
it('should assign the same background color to cells with the same content', () => {
  const vm = wrapper.vm;

  vm.cellData = {
    'Monday-9': 'Sleep',
    'Tuesday-9': 'Sleep',
    'Wednesday-9': 'Sleep'
  };

  vm.contentColorMap = {
    'Sleep': '#B8D4E8'
  };

  const color1 = vm.getCellColor('Monday', 9);
  const color2 = vm.getCellColor('Tuesday', 9);
  const color3 = vm.getCellColor('Wednesday', 9);

  expect(color1).toBe('#B8D4E8');
  expect(color2).toBe('#B8D4E8');
  expect(color3).toBe('#B8D4E8');
});
```

### Example 2: Time Summary Correctness

```javascript
it('should correctly calculate time summary with correct counts', () => {
  const vm = wrapper.vm;

  vm.cellData = {
    'Monday-0': 'Sleep',
    'Monday-1': 'Sleep',
    'Monday-2': 'Sleep',
    'Monday-3': 'Sleep',
    'Monday-4': 'Sleep',  // 5 hours
    'Monday-9': 'Work',
    'Monday-10': 'Work',
    'Monday-11': 'Work',
    'Monday-12': 'Work',   // 4 hours
    'Tuesday-9': 'Reading',
    'Tuesday-10': 'Reading' // 2 hours
  };

  const summary = vm.timeSummary;

  expect(summary[0].field).toBe('Sleep');
  expect(summary[0].count).toBe(5);
  expect(summary[1].field).toBe('Work');
  expect(summary[1].count).toBe(4);
  expect(summary[2].field).toBe('Reading');
  expect(summary[2].count).toBe(2);
});
```

## Testing Philosophy

These tests focus exclusively on **business logic**, not UI/UX:
- ✅ Data manipulation and calculations
- ✅ State management
- ✅ Color assignment algorithms
- ✅ Summary computations
- ✅ Selection logic
- ✅ Data persistence
- ❌ DOM interactions (clicks, drags)
- ❌ Visual styling
- ❌ User interface rendering

## Continuous Testing

The test suite serves as:
1. **Safety net** for refactoring
2. **Documentation** of expected behavior
3. **Regression prevention** for future changes
4. **Specification** of business requirements
