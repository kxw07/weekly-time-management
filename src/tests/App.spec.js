import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

describe('App.vue - Business Logic Tests', () => {
  let wrapper;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock;

    wrapper = mount(App);
  });

  describe('Color Management', () => {
    it('should assign the same background color to cells with the same content', () => {
      const vm = wrapper.vm;

      // Simulate setting the same content to multiple cells
      vm.cellData = {
        'Monday-9': 'Sleep',
        'Tuesday-9': 'Sleep',
        'Wednesday-9': 'Sleep'
      };

      // Assign color to "Sleep"
      vm.contentColorMap = {
        'Sleep': '#B8D4E8'
      };

      // Get colors for all cells with "Sleep"
      const color1 = vm.getCellColor('Monday', 9);
      const color2 = vm.getCellColor('Tuesday', 9);
      const color3 = vm.getCellColor('Wednesday', 9);

      // All should have the same color
      expect(color1).toBe('#B8D4E8');
      expect(color2).toBe('#B8D4E8');
      expect(color3).toBe('#B8D4E8');
    });

    it('should assign different colors to cells with different content', () => {
      const vm = wrapper.vm;

      vm.cellData = {
        'Monday-9': 'Sleep',
        'Monday-10': 'Reading'
      };

      vm.contentColorMap = {
        'Sleep': '#B8D4E8',
        'Reading': '#C8E6C9'
      };

      const sleepColor = vm.getCellColor('Monday', 9);
      const readingColor = vm.getCellColor('Monday', 10);

      expect(sleepColor).toBe('#B8D4E8');
      expect(readingColor).toBe('#C8E6C9');
      expect(sleepColor).not.toBe(readingColor);
    });

    it('should return transparent for empty cells', () => {
      const vm = wrapper.vm;

      vm.cellData = {};
      const color = vm.getCellColor('Monday', 9);

      expect(color).toBe('transparent');
    });

    it('should assign a new color when new content is added', () => {
      const vm = wrapper.vm;

      vm.cellData = {};
      vm.contentColorMap = {};

      // Simulate saving cell content
      const event = { target: { innerText: 'Work' } };
      vm.saveCellContent(event, 'Monday', 9);

      // Check that a color was assigned
      expect(vm.contentColorMap['Work']).toBeDefined();
      expect(vm.colorPalette).toContain(vm.contentColorMap['Work']);
    });

    it('should remove color mapping when content is no longer used', () => {
      const vm = wrapper.vm;

      vm.cellData = {
        'Monday-9': 'Temp'
      };
      vm.contentColorMap = {
        'Temp': '#B8D4E8'
      };

      // Change the content to something else
      const event = { target: { innerText: 'Work' } };
      vm.saveCellContent(event, 'Monday', 9);

      // Old content color should be removed
      expect(vm.contentColorMap['Temp']).toBeUndefined();
    });

    it('should get an available color from palette', () => {
      const vm = wrapper.vm;

      vm.contentColorMap = {
        'Activity1': '#B8D4E8',
        'Activity2': '#C8E6C9'
      };

      const availableColor = vm.getAvailableColor();

      // Should not be one of the used colors
      expect(availableColor).not.toBe('#B8D4E8');
      expect(availableColor).not.toBe('#C8E6C9');
      expect(vm.colorPalette).toContain(availableColor);
    });
  });

  describe('Time Summary', () => {
    it('should correctly calculate time summary with correct counts', () => {
      const vm = wrapper.vm;

      vm.cellData = {
        'Monday-0': 'Sleep',
        'Monday-1': 'Sleep',
        'Monday-2': 'Sleep',
        'Monday-3': 'Sleep',
        'Monday-4': 'Sleep',
        'Monday-9': 'Work',
        'Monday-10': 'Work',
        'Monday-11': 'Work',
        'Monday-12': 'Work',
        'Tuesday-9': 'Reading',
        'Tuesday-10': 'Reading'
      };

      vm.contentColorMap = {
        'Sleep': '#B8D4E8',
        'Work': '#C8E6C9',
        'Reading': '#FFE0B2'
      };

      const summary = vm.timeSummary;

      expect(summary).toHaveLength(3);

      // Find each activity in summary
      const sleepItem = summary.find(item => item.field === 'Sleep');
      const workItem = summary.find(item => item.field === 'Work');
      const readingItem = summary.find(item => item.field === 'Reading');

      expect(sleepItem.count).toBe(5);
      expect(workItem.count).toBe(4);
      expect(readingItem.count).toBe(2);
    });

    it('should sort time summary by count in descending order', () => {
      const vm = wrapper.vm;

      vm.cellData = {
        'Monday-9': 'Reading',
        'Monday-10': 'Reading',
        'Tuesday-9': 'Sleep',
        'Tuesday-10': 'Sleep',
        'Tuesday-11': 'Sleep',
        'Tuesday-12': 'Sleep',
        'Tuesday-13': 'Sleep',
        'Wednesday-9': 'Work',
        'Wednesday-10': 'Work',
        'Wednesday-11': 'Work'
      };

      vm.contentColorMap = {
        'Sleep': '#B8D4E8',
        'Work': '#C8E6C9',
        'Reading': '#FFE0B2'
      };

      const summary = vm.timeSummary;

      // Should be sorted: Sleep (5) > Work (3) > Reading (2)
      expect(summary[0].field).toBe('Sleep');
      expect(summary[0].count).toBe(5);
      expect(summary[1].field).toBe('Work');
      expect(summary[1].count).toBe(3);
      expect(summary[2].field).toBe('Reading');
      expect(summary[2].count).toBe(2);
    });

    it('should include correct colors in time summary', () => {
      const vm = wrapper.vm;

      vm.cellData = {
        'Monday-9': 'Sleep',
        'Monday-10': 'Reading'
      };

      vm.contentColorMap = {
        'Sleep': '#B8D4E8',
        'Reading': '#C8E6C9'
      };

      const summary = vm.timeSummary;

      const sleepItem = summary.find(item => item.field === 'Sleep');
      const readingItem = summary.find(item => item.field === 'Reading');

      expect(sleepItem.color).toBe('#B8D4E8');
      expect(readingItem.color).toBe('#C8E6C9');
    });

    it('should ignore empty cells in time summary', () => {
      const vm = wrapper.vm;

      vm.cellData = {
        'Monday-9': 'Sleep',
        'Monday-10': '',
        'Monday-11': '   ',
        'Tuesday-9': 'Work'
      };

      vm.contentColorMap = {
        'Sleep': '#B8D4E8',
        'Work': '#C8E6C9'
      };

      const summary = vm.timeSummary;

      // Should only have Sleep and Work, not empty strings
      expect(summary).toHaveLength(2);
      expect(summary.some(item => item.field === 'Sleep')).toBe(true);
      expect(summary.some(item => item.field === 'Work')).toBe(true);
    });

    it('should return empty array when no data exists', () => {
      const vm = wrapper.vm;

      vm.cellData = {};
      const summary = vm.timeSummary;

      expect(summary).toEqual([]);
    });
  });

  describe('Cell Data Management', () => {
    it('should save cell content correctly', () => {
      const vm = wrapper.vm;

      const event = { target: { innerText: 'Meeting' } };
      vm.saveCellContent(event, 'Friday', 14);

      expect(vm.cellData['Friday-14']).toBe('Meeting');
    });

    it('should retrieve cell content correctly', () => {
      const vm = wrapper.vm;

      vm.cellData = {
        'Monday-9': 'Sleep',
        'Tuesday-10': 'Work'
      };

      expect(vm.getCellContent('Monday', 9)).toBe('Sleep');
      expect(vm.getCellContent('Tuesday', 10)).toBe('Work');
      expect(vm.getCellContent('Wednesday', 11)).toBe('');
    });

    it('should trim whitespace when saving cell content', () => {
      const vm = wrapper.vm;

      const event = { target: { innerText: '  Reading  ' } };
      vm.saveCellContent(event, 'Monday', 9);

      expect(vm.cellData['Monday-9']).toBe('Reading');
    });
  });

  describe('Selection Logic', () => {
    it('should calculate selected cells correctly for rectangular area', () => {
      const vm = wrapper.vm;

      vm.selectionStart = { day: 'Monday', hour: 9 };
      vm.selectionEnd = { day: 'Wednesday', hour: 11 };
      vm.updateSelectedCells();

      // Should select 3 days × 3 hours = 9 cells
      expect(vm.selectedCells).toHaveLength(9);

      // Check specific cells
      expect(vm.selectedCells).toContainEqual({ day: 'Monday', hour: 9 });
      expect(vm.selectedCells).toContainEqual({ day: 'Tuesday', hour: 10 });
      expect(vm.selectedCells).toContainEqual({ day: 'Wednesday', hour: 11 });
    });

    it('should handle reverse selection (drag from bottom-right to top-left)', () => {
      const vm = wrapper.vm;

      // Start from Wednesday-11, end at Monday-9
      vm.selectionStart = { day: 'Wednesday', hour: 11 };
      vm.selectionEnd = { day: 'Monday', hour: 9 };
      vm.updateSelectedCells();

      // Should still select the same 9 cells
      expect(vm.selectedCells).toHaveLength(9);
      expect(vm.selectedCells).toContainEqual({ day: 'Monday', hour: 9 });
      expect(vm.selectedCells).toContainEqual({ day: 'Wednesday', hour: 11 });
    });

    it('should apply content to all selected cells', () => {
      const vm = wrapper.vm;

      vm.selectedCells = [
        { day: 'Monday', hour: 9 },
        { day: 'Monday', hour: 10 },
        { day: 'Tuesday', hour: 9 }
      ];

      vm.applyContentToSelection('Meeting');

      expect(vm.cellData['Monday-9']).toBe('Meeting');
      expect(vm.cellData['Monday-10']).toBe('Meeting');
      expect(vm.cellData['Tuesday-9']).toBe('Meeting');
    });

    it('should correctly identify if a cell is selected', () => {
      const vm = wrapper.vm;

      vm.selectedCells = [
        { day: 'Monday', hour: 9 },
        { day: 'Tuesday', hour: 10 }
      ];

      expect(vm.isCellSelected('Monday', 9)).toBe(true);
      expect(vm.isCellSelected('Tuesday', 10)).toBe(true);
      expect(vm.isCellSelected('Wednesday', 11)).toBe(false);
    });

    it('should select single cell when start and end are the same', () => {
      const vm = wrapper.vm;

      vm.selectionStart = { day: 'Monday', hour: 9 };
      vm.selectionEnd = { day: 'Monday', hour: 9 };
      vm.updateSelectedCells();

      expect(vm.selectedCells).toHaveLength(1);
      expect(vm.selectedCells[0]).toEqual({ day: 'Monday', hour: 9 });
    });
  });

  describe('Data Persistence', () => {
    it('should save to localStorage when cell content is saved', () => {
      const vm = wrapper.vm;

      const event = { target: { innerText: 'Exercise' } };
      vm.saveCellContent(event, 'Monday', 9);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'weeklyTimeData',
        expect.any(String)
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'weeklyTimeColors',
        expect.any(String)
      );
    });

    it('should save to localStorage when applying content to selection', () => {
      const vm = wrapper.vm;

      vm.selectedCells = [
        { day: 'Monday', hour: 9 },
        { day: 'Monday', hour: 10 }
      ];

      vm.applyContentToSelection('Workout');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'weeklyTimeData',
        expect.any(String)
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'weeklyTimeColors',
        expect.any(String)
      );
    });

    it('should clear localStorage when clearAll is called', () => {
      const vm = wrapper.vm;

      // Mock confirm to return true
      global.confirm = vi.fn(() => true);

      vm.cellData = { 'Monday-9': 'Test' };
      vm.contentColorMap = { 'Test': '#B8D4E8' };

      vm.clearAll();

      expect(vm.cellData).toEqual({});
      expect(vm.contentColorMap).toEqual({});
      expect(localStorage.removeItem).toHaveBeenCalledWith('weeklyTimeData');
      expect(localStorage.removeItem).toHaveBeenCalledWith('weeklyTimeColors');
    });

    it('should not clear data when user cancels clearAll', () => {
      const vm = wrapper.vm;

      // Mock confirm to return false
      global.confirm = vi.fn(() => false);

      vm.cellData = { 'Monday-9': 'Test' };
      vm.contentColorMap = { 'Test': '#B8D4E8' };

      vm.clearAll();

      // Data should remain unchanged
      expect(vm.cellData).toEqual({ 'Monday-9': 'Test' });
      expect(vm.contentColorMap).toEqual({ 'Test': '#B8D4E8' });
    });
  });
});
