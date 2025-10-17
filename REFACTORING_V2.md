# Refactoring V2 - True Component Separation

## Overview

This refactoring truly separates business logic into appropriate components. Each component now owns and manages its own domain logic, not just presentation.

## Major Changes from V1

### V1 (Previous - Pseudo Refactoring)
- App.vue: 330 lines - All business logic
- Components: Thin presentation wrappers
- Result: Tests still pass (no real refactoring)

### V2 (Current - True Refactoring)
- App.vue: 177 lines - Only coordination & persistence
- Components: Own their business logic
- Result: **Tests SHOULD FAIL** (real refactoring happened)

## Component Architecture

### 1. App.vue (Coordinator)
**Lines:** 177 (down from 330)

**Responsibilities:**
- Data persistence (localStorage)
- Component coordination
- Import/Export functionality
- Pass initial data to components

**Does NOT contain:**
- ❌ Cell color management
- ❌ Content editing logic
- ❌ Selection logic
- ❌ Time summary computation
- ❌ Color palette management

**Key Methods:**
- `handleDataChange()` - Receive updates from TimeTable
- `clearAll()` - Delegate to TimeTable
- `exportToPng()` - Export table image
- `exportToJson()` - Export JSON data
- `importFromJson()` - Import JSON data

### 2. TimeTable.vue (Business Logic Owner)
**Lines:** 300+

**Now Contains:**
- ✅ `cellData` - Component state (not parent state)
- ✅ `contentColorMap` - Component state
- ✅ `colorPalette` - Color management
- ✅ `getCellContent()` - Cell content retrieval
- ✅ `getCellColor()` - Color assignment logic
- ✅ `getAvailableColor()` - Color palette logic
- ✅ `saveCellContent()` - Edit handling with color assignment
- ✅ `startSelection()` - Selection start
- ✅ `updateSelection()` - Selection update
- ✅ `endSelection()` - Selection completion
- ✅ `updateSelectedCells()` - Selection calculation
- ✅ `applyContentToSelection()` - Batch content update
- ✅ `isCellSelected()` - Selection check

**Props:**
- `days` - Day names
- `hours` - Hour range
- `initialCellData` - Initial data from parent
- `initialContentColorMap` - Initial colors from parent

**Events:**
- `@data-change` - Emits when data changes

**Lifecycle:**
- Watches `initialCellData` and `initialContentColorMap` for external updates
- Manages own internal state
- Emits changes back to parent

### 3. TimeSummary.vue (Computation Owner)
**Lines:** 93

**Now Contains:**
- ✅ `timeSummary` - Computed property
- ✅ Summary calculation logic
- ✅ Sorting by count (descending)
- ✅ Color mapping

**Props:**
- `cellData` - Raw cell data
- `contentColorMap` - Color mappings

**Computes:**
- Time summary from raw data
- Sorted by largest time blocks first

### 4. Actions.vue (No Change)
Simple event emitter for user actions.

### 5. PageTitle.vue (No Change)
Simple presentation component.

## Data Flow

### Previous (V1):
```
App.vue (owns all state & logic)
  ↓ props (data)
Child Components (just render)
  ↑ events (UI actions)
App.vue (handles everything)
```

### Current (V2):
```
App.vue (coordination & persistence only)
  ↓ initial data
TimeTable (owns cell logic & state)
  ↑ @data-change
App.vue (saves to localStorage)
  ↓ passes data
TimeSummary (computes summary)
```

## Business Logic Distribution

### Color Management
**Before:** App.vue
**After:** TimeTable.vue
- `getCellColor()`
- `getAvailableColor()`
- `colorPalette`
- `contentColorMap` (now component state)

### Cell Content Management
**Before:** App.vue
**After:** TimeTable.vue
- `getCellContent()`
- `saveCellContent()`
- `cellData` (now component state)

### Selection Logic
**Before:** App.vue
**After:** TimeTable.vue
- `startSelection()`
- `updateSelection()`
- `endSelection()`
- `updateSelectedCells()`
- `applyContentToSelection()`
- `isCellSelected()`
- All selection state

### Time Summary
**Before:** App.vue computed property
**After:** TimeSummary.vue computed property
- Calculation logic moved
- Sorting logic moved
- Component computes on demand

## Why Tests WILL Fail

### 1. Missing Methods in App.vue
Tests directly call these methods on App.vue:
```javascript
const vm = wrapper.vm;
vm.getCellColor('Monday', 9);  // ❌ Method doesn't exist in App.vue anymore
vm.saveCellContent(event, 'Monday', 9);  // ❌ Method doesn't exist
vm.getAvailableColor();  // ❌ Method doesn't exist
```

These methods now live in TimeTable.vue.

### 2. Missing State in App.vue
Tests directly access state:
```javascript
vm.cellData = { ... };  // ❌ This is now in TimeTable component
vm.contentColorMap = { ... };  // ❌ This is now in TimeTable component
vm.selectedCells = [ ... ];  // ❌ This is now in TimeTable component
```

### 3. Missing Computed Properties
Tests access computed properties:
```javascript
vm.timeSummary;  // ❌ This is now in TimeSummary component
```

### 4. Component Hierarchy Changed
Tests mount App.vue directly, but now need to:
- Mount TimeTable to test cell logic
- Mount TimeSummary to test summary logic
- Test integration between components

## What Needs to Be Tested Now

### App.vue Tests (Integration)
- Data persistence (localStorage)
- Import/Export functionality
- Component coordination
- Event handling from children

### TimeTable.vue Tests (Business Logic)
- Color management (same field → same color)
- Cell content management
- Selection logic
- Color palette logic
- All the existing business logic tests

### TimeSummary.vue Tests (Computation)
- Time summary calculation
- Sorting by count
- Empty data handling
- Color mapping

### Actions.vue Tests (Events)
- Event emission
- File input handling

## Example Test Failures

```javascript
// This test WILL FAIL:
it('should assign the same background color to cells with the same content', () => {
  const vm = wrapper.vm;
  vm.cellData = { ... };  // ❌ cellData doesn't exist in App.vm
  const color1 = vm.getCellColor('Monday', 9);  // ❌ Method doesn't exist
});

// Should be rewritten as:
it('should assign the same background color to cells with the same content', () => {
  const wrapper = mount(TimeTable, {
    props: { days: [...], hours: [...] }
  });
  const vm = wrapper.vm;
  vm.cellData = { ... };  // ✅ Now testing TimeTable
  const color1 = vm.getCellColor('Monday', 9);  // ✅ Method exists
});
```

## Migration Path for Tests

1. **Create TimeTable.spec.js**
   - Move all color management tests
   - Move all cell content tests
   - Move all selection tests

2. **Create TimeSummary.spec.js**
   - Move all time summary tests

3. **Update App.spec.js**
   - Test localStorage integration
   - Test import/export
   - Test component coordination
   - Test event handling

## File Size Comparison

```
Before V2:
- App.vue: 330 lines (all logic)
- TimeTable.vue: 165 lines (thin wrapper)
- TimeSummary.vue: 75 lines (thin wrapper)

After V2:
- App.vue: 177 lines (coordination only)
- TimeTable.vue: 300+ lines (owns cell logic)
- TimeSummary.vue: 93 lines (owns computation)
```

## Benefits of This Refactoring

### 1. True Separation of Concerns
- Each component owns its domain
- App.vue is just a coordinator
- Logic lives where it's used

### 2. Component Reusability
- TimeTable can be used independently
- Has its own state management
- Self-contained business logic

### 3. Testability
- Can test TimeTable in isolation
- Can test TimeSummary in isolation
- Clearer test boundaries

### 4. Maintainability
- Change cell logic? Edit TimeTable
- Change summary logic? Edit TimeSummary
- No need to touch App.vue for feature changes

### 5. Scalability
- Easy to add features to specific components
- Can replace components independently
- Clear ownership of functionality

## State Management Pattern

### TimeTable State Management
```javascript
// Component owns its state
data() {
  return {
    cellData: { ...this.initialCellData },
    contentColorMap: { ...this.initialContentColorMap },
    // ... other state
  };
}

// Watches for external updates
watch: {
  initialCellData(newVal) {
    this.cellData = { ...newVal };
  }
}

// Emits changes to parent
emitDataChange() {
  this.$emit('data-change', {
    cellData: this.cellData,
    contentColorMap: this.contentColorMap
  });
}
```

### App.vue Coordination
```javascript
// Receives updates
handleDataChange({ cellData, contentColorMap }) {
  this.cellData = cellData;
  this.contentColorMap = contentColorMap;
  // Persist to localStorage
  localStorage.setItem('weeklyTimeData', JSON.stringify(cellData));
}
```

## Next Steps

1. ✅ Verify unit tests fail (expected)
2. Create new test files for components
3. Update existing tests for new architecture
4. Add integration tests for App.vue
5. Document new testing strategy
