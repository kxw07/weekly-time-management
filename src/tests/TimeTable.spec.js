import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TimeTable from '../components/TimeTable.vue';

describe('TimeTable.vue - Business Logic Tests', () => {
  let wrapper;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  beforeEach(() => {
    wrapper = mount(TimeTable, {
      props: {
        days,
        hours,
        initialCellData: {},
        initialContentColorMap: {}
      }
    });
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

  describe('Data Change Events', () => {
    it('should emit data-change event when cell content is saved', () => {
      const vm = wrapper.vm;

      const event = { target: { innerText: 'Exercise' } };
      vm.saveCellContent(event, 'Monday', 9);

      expect(wrapper.emitted('data-change')).toBeTruthy();
      expect(wrapper.emitted('data-change')[0][0]).toHaveProperty('cellData');
      expect(wrapper.emitted('data-change')[0][0]).toHaveProperty('contentColorMap');
    });

    it('should emit data-change event when applying content to selection', () => {
      const vm = wrapper.vm;

      vm.selectedCells = [
        { day: 'Monday', hour: 9 },
        { day: 'Monday', hour: 10 }
      ];

      vm.applyContentToSelection('Workout');

      expect(wrapper.emitted('data-change')).toBeTruthy();
    });

    it('should clear all data when clearData is called', () => {
      const vm = wrapper.vm;

      vm.cellData = { 'Monday-9': 'Test' };
      vm.contentColorMap = { 'Test': '#B8D4E8' };

      vm.clearData();

      expect(vm.cellData).toEqual({});
      expect(vm.contentColorMap).toEqual({});
      expect(wrapper.emitted('data-change')).toBeTruthy();
    });
  });

  describe('Props Watching', () => {
    it('should update cellData when initialCellData prop changes', async () => {
      const newCellData = {
        'Monday-9': 'NewContent'
      };

      await wrapper.setProps({
        initialCellData: newCellData
      });

      expect(wrapper.vm.cellData).toEqual(newCellData);
    });

    it('should update contentColorMap when initialContentColorMap prop changes', async () => {
      const newColorMap = {
        'Activity': '#B8D4E8'
      };

      await wrapper.setProps({
        initialContentColorMap: newColorMap
      });

      expect(wrapper.vm.contentColorMap).toEqual(newColorMap);
    });
  });
});
