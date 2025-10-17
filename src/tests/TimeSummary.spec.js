import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TimeSummary from '../components/TimeSummary.vue';

describe('TimeSummary.vue - Business Logic Tests', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(TimeSummary, {
      props: {
        cellData: {},
        contentColorMap: {}
      }
    });
  });

  describe('Time Summary Computation', () => {
    it('should correctly calculate time summary with correct counts', async () => {
      await wrapper.setProps({
        cellData: {
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
        },
        contentColorMap: {
          'Sleep': '#B8D4E8',
          'Work': '#C8E6C9',
          'Reading': '#FFE0B2'
        }
      });

      const summary = wrapper.vm.timeSummary;

      expect(summary).toHaveLength(3);

      // Find each activity in summary
      const sleepItem = summary.find(item => item.field === 'Sleep');
      const workItem = summary.find(item => item.field === 'Work');
      const readingItem = summary.find(item => item.field === 'Reading');

      expect(sleepItem.count).toBe(5);
      expect(workItem.count).toBe(4);
      expect(readingItem.count).toBe(2);
    });

    it('should sort time summary by count in descending order', async () => {
      await wrapper.setProps({
        cellData: {
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
        },
        contentColorMap: {
          'Sleep': '#B8D4E8',
          'Work': '#C8E6C9',
          'Reading': '#FFE0B2'
        }
      });

      const summary = wrapper.vm.timeSummary;

      // Should be sorted: Sleep (5) > Work (3) > Reading (2)
      expect(summary[0].field).toBe('Sleep');
      expect(summary[0].count).toBe(5);
      expect(summary[1].field).toBe('Work');
      expect(summary[1].count).toBe(3);
      expect(summary[2].field).toBe('Reading');
      expect(summary[2].count).toBe(2);
    });

    it('should include correct colors in time summary', async () => {
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep',
          'Monday-10': 'Reading'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8',
          'Reading': '#C8E6C9'
        }
      });

      const summary = wrapper.vm.timeSummary;

      const sleepItem = summary.find(item => item.field === 'Sleep');
      const readingItem = summary.find(item => item.field === 'Reading');

      expect(sleepItem.color).toBe('#B8D4E8');
      expect(readingItem.color).toBe('#C8E6C9');
    });

    it('should ignore empty cells in time summary', async () => {
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep',
          'Monday-10': '',
          'Monday-11': '   ',
          'Tuesday-9': 'Work'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8',
          'Work': '#C8E6C9'
        }
      });

      const summary = wrapper.vm.timeSummary;

      // Should only have Sleep and Work, not empty strings
      expect(summary).toHaveLength(2);
      expect(summary.some(item => item.field === 'Sleep')).toBe(true);
      expect(summary.some(item => item.field === 'Work')).toBe(true);
    });

    it('should return empty array when no data exists', () => {
      const summary = wrapper.vm.timeSummary;

      expect(summary).toEqual([]);
    });

    it('should handle missing color mappings gracefully', async () => {
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep',
          'Monday-10': 'Work'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8'
          // 'Work' color is missing
        }
      });

      const summary = wrapper.vm.timeSummary;

      const sleepItem = summary.find(item => item.field === 'Sleep');
      const workItem = summary.find(item => item.field === 'Work');

      expect(sleepItem.color).toBe('#B8D4E8');
      expect(workItem.color).toBe('transparent'); // Should default to transparent
    });
  });

  describe('Rendering', () => {
    it('should not render when there is no data', () => {
      const summaryDiv = wrapper.find('.footer-summary');
      expect(summaryDiv.exists()).toBe(false);
    });

    it('should render when there is data', async () => {
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8'
        }
      });

      const summaryDiv = wrapper.find('.footer-summary');
      expect(summaryDiv.exists()).toBe(true);
    });

    it('should render correct number of summary items', async () => {
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep',
          'Monday-10': 'Work',
          'Monday-11': 'Reading'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8',
          'Work': '#C8E6C9',
          'Reading': '#FFE0B2'
        }
      });

      const summaryItems = wrapper.findAll('.summary-item');
      expect(summaryItems).toHaveLength(3);
    });
  });

  describe('Reactivity', () => {
    it('should recompute summary when cellData changes', async () => {
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8'
        }
      });

      let summary = wrapper.vm.timeSummary;
      expect(summary).toHaveLength(1);
      expect(summary[0].count).toBe(1);

      // Update props with more data
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep',
          'Monday-10': 'Sleep',
          'Tuesday-9': 'Work'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8',
          'Work': '#C8E6C9'
        }
      });

      summary = wrapper.vm.timeSummary;
      expect(summary).toHaveLength(2);
      const sleepItem = summary.find(item => item.field === 'Sleep');
      expect(sleepItem.count).toBe(2);
    });
  });

  describe('Field Renaming', () => {
    it('should emit rename-field event when field is renamed', async () => {
      await wrapper.setProps({
        cellData: {
          'Monday-9': 'Sleep'
        },
        contentColorMap: {
          'Sleep': '#B8D4E8'
        }
      });

      const vm = wrapper.vm;

      // Mock the InputDialog
      vm.$refs.inputDialog = {
        show: vi.fn().mockResolvedValue('Sleeping')
      };

      await vm.handleFieldClick('Sleep');

      expect(vm.$refs.inputDialog.show).toHaveBeenCalledWith('Rename Field', 'Sleep');
      expect(wrapper.emitted('rename-field')).toBeTruthy();
      expect(wrapper.emitted('rename-field')[0][0]).toEqual({
        oldField: 'Sleep',
        newField: 'Sleeping'
      });
    });

    it('should not emit rename-field event when new name is empty', async () => {
      const vm = wrapper.vm;

      vm.$refs.inputDialog = {
        show: vi.fn().mockResolvedValue('')
      };

      await vm.handleFieldClick('Sleep');

      expect(wrapper.emitted('rename-field')).toBeFalsy();
    });

    it('should not emit rename-field event when new name is the same', async () => {
      const vm = wrapper.vm;

      vm.$refs.inputDialog = {
        show: vi.fn().mockResolvedValue('Sleep')
      };

      await vm.handleFieldClick('Sleep');

      expect(wrapper.emitted('rename-field')).toBeFalsy();
    });

    it('should not emit rename-field event when user cancels', async () => {
      const vm = wrapper.vm;

      vm.$refs.inputDialog = {
        show: vi.fn().mockResolvedValue(null)
      };

      await vm.handleFieldClick('Sleep');

      expect(wrapper.emitted('rename-field')).toBeFalsy();
    });

    it('should trim whitespace from new field name', async () => {
      const vm = wrapper.vm;

      vm.$refs.inputDialog = {
        show: vi.fn().mockResolvedValue('  Sleeping  ')
      };

      await vm.handleFieldClick('Sleep');

      expect(wrapper.emitted('rename-field')).toBeTruthy();
      expect(wrapper.emitted('rename-field')[0][0]).toEqual({
        oldField: 'Sleep',
        newField: 'Sleeping'
      });
    });
  });
});
