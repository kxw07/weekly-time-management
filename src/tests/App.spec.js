import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';
import TimeTable from '../components/TimeTable.vue';
import TimeSummary from '../components/TimeSummary.vue';
import Actions from '../components/Actions.vue';
import PageTitle from '../components/PageTitle.vue';

describe('App.vue - Integration Tests', () => {
  let wrapper;
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock;

    wrapper = mount(App, {
      global: {
        stubs: {
          TimeTable: false,
          TimeSummary: false,
          Actions: false,
          PageTitle: false
        }
      }
    });
  });

  describe('Component Composition', () => {
    it('should render all child components', () => {
      expect(wrapper.findComponent(PageTitle).exists()).toBe(true);
      expect(wrapper.findComponent(TimeTable).exists()).toBe(true);
      expect(wrapper.findComponent(TimeSummary).exists()).toBe(true);
      expect(wrapper.findComponent(Actions).exists()).toBe(true);
    });

    it('should pass correct props to TimeTable', () => {
      const timeTable = wrapper.findComponent(TimeTable);

      expect(timeTable.props('days')).toEqual(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
      expect(timeTable.props('hours')).toHaveLength(24);
      expect(timeTable.props('initialCellData')).toBeDefined();
      expect(timeTable.props('initialContentColorMap')).toBeDefined();
    });

    it('should pass correct props to TimeSummary', () => {
      const timeSummary = wrapper.findComponent(TimeSummary);

      expect(timeSummary.props('cellData')).toBeDefined();
      expect(timeSummary.props('contentColorMap')).toBeDefined();
    });
  });

  describe('Data Persistence', () => {
    it('should load data from localStorage on mount', () => {
      const savedData = { 'Monday-9': 'Sleep' };
      const savedColors = { 'Sleep': '#B8D4E8' };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'weeklyTimeData') return JSON.stringify(savedData);
        if (key === 'weeklyTimeColors') return JSON.stringify(savedColors);
        return null;
      });

      const newWrapper = mount(App);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('weeklyTimeData');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('weeklyTimeColors');
      expect(newWrapper.vm.cellData).toEqual(savedData);
      expect(newWrapper.vm.contentColorMap).toEqual(savedColors);
    });

    it('should save to localStorage when data changes', () => {
      const timeTable = wrapper.findComponent(TimeTable);
      const newData = {
        cellData: { 'Monday-9': 'Work' },
        contentColorMap: { 'Work': '#C8E6C9' }
      };

      timeTable.vm.$emit('data-change', newData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weeklyTimeData',
        JSON.stringify(newData.cellData)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weeklyTimeColors',
        JSON.stringify(newData.contentColorMap)
      );
    });

    it('should update App state when TimeTable emits data-change', async () => {
      const timeTable = wrapper.findComponent(TimeTable);
      const newData = {
        cellData: { 'Monday-9': 'Meeting' },
        contentColorMap: { 'Meeting': '#FFE0B2' }
      };

      timeTable.vm.$emit('data-change', newData);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cellData).toEqual(newData.cellData);
      expect(wrapper.vm.contentColorMap).toEqual(newData.contentColorMap);
    });
  });

  describe('Clear All Functionality', () => {
    it('should clear localStorage when clearAll is confirmed', () => {
      global.confirm = vi.fn(() => true);

      const timeTable = wrapper.findComponent(TimeTable);
      const clearDataSpy = vi.spyOn(timeTable.vm, 'clearData');

      wrapper.vm.clearAll();

      expect(clearDataSpy).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('weeklyTimeData');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('weeklyTimeColors');
    });

    it('should not clear data when clearAll is cancelled', () => {
      global.confirm = vi.fn(() => false);

      const initialCellData = { ...wrapper.vm.cellData };
      const initialColorMap = { ...wrapper.vm.contentColorMap };

      wrapper.vm.clearAll();

      expect(wrapper.vm.cellData).toEqual(initialCellData);
      expect(wrapper.vm.contentColorMap).toEqual(initialColorMap);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should handle clear all action from Actions component', () => {
      global.confirm = vi.fn(() => true);
      const actions = wrapper.findComponent(Actions);

      actions.vm.$emit('clear-all');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('weeklyTimeData');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('weeklyTimeColors');
    });
  });

  describe('Export Functionality', () => {
    it('should handle export-json event from Actions component', async () => {
      wrapper.vm.cellData = { 'Monday-9': 'Test' };
      wrapper.vm.contentColorMap = { 'Test': '#B8D4E8' };

      // Mock URL methods
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock document.createElement
      const mockLink = {
        download: '',
        href: '',
        click: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      const actions = wrapper.findComponent(Actions);
      actions.vm.$emit('export-json');

      await wrapper.vm.$nextTick();

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain('weekly-time-management');
      expect(mockLink.download).toContain('.json');
    });

    it('should handle export-png event from Actions component', async () => {
      // Mock html2canvas
      const mockCanvas = {
        toBlob: vi.fn((callback) => callback(new Blob()))
      };
      const mockHtml2Canvas = vi.fn(() => Promise.resolve(mockCanvas));
      vi.stubGlobal('html2canvas', mockHtml2Canvas);

      // Mock URL methods
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock document.createElement
      const mockLink = {
        download: '',
        href: '',
        click: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      const actions = wrapper.findComponent(Actions);
      actions.vm.$emit('export-png');

      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain('weekly-time-management');
      expect(mockLink.download).toContain('.png');
    });
  });

  describe('Import Functionality', () => {
    it('should handle import-json event from Actions component', async () => {
      const mockData = {
        cellData: { 'Monday-9': 'Imported' },
        contentColorMap: { 'Imported': '#B8D4E8' }
      };

      const mockFile = new Blob([JSON.stringify(mockData)], { type: 'application/json' });
      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'mock.json'
        }
      };

      // Mock FileReader
      const mockFileReader = {
        readAsText: vi.fn(function() {
          this.onload({ target: { result: JSON.stringify(mockData) } });
        })
      };
      global.FileReader = vi.fn(() => mockFileReader);
      global.alert = vi.fn();

      const actions = wrapper.findComponent(Actions);
      actions.vm.$emit('import-json', mockEvent);

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.cellData).toEqual(mockData.cellData);
      expect(wrapper.vm.contentColorMap).toEqual(mockData.contentColorMap);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weeklyTimeData',
        JSON.stringify(mockData.cellData)
      );
    });

    it('should show alert for invalid JSON format', async () => {
      const mockFile = new Blob(['invalid json'], { type: 'application/json' });
      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'mock.json'
        }
      };

      global.alert = vi.fn();
      const mockFileReader = {
        readAsText: vi.fn(function() {
          this.onload({ target: { result: 'invalid json' } });
        })
      };
      global.FileReader = vi.fn(() => mockFileReader);

      const actions = wrapper.findComponent(Actions);
      actions.vm.$emit('import-json', mockEvent);

      await wrapper.vm.$nextTick();

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to import'));
    });
  });

  describe('Component Integration', () => {
    it('should pass updated data to TimeSummary when TimeTable data changes', async () => {
      const timeTable = wrapper.findComponent(TimeTable);
      const timeSummary = wrapper.findComponent(TimeSummary);

      const newData = {
        cellData: { 'Monday-9': 'Work', 'Monday-10': 'Work' },
        contentColorMap: { 'Work': '#C8E6C9' }
      };

      timeTable.vm.$emit('data-change', newData);
      await wrapper.vm.$nextTick();

      expect(timeSummary.props('cellData')).toEqual(newData.cellData);
      expect(timeSummary.props('contentColorMap')).toEqual(newData.contentColorMap);
    });

    it('should maintain data consistency between TimeTable and TimeSummary', async () => {
      const timeTable = wrapper.findComponent(TimeTable);
      const timeSummary = wrapper.findComponent(TimeSummary);

      // Simulate data change in TimeTable
      timeTable.vm.cellData = {
        'Monday-9': 'Sleep',
        'Monday-10': 'Sleep',
        'Tuesday-9': 'Work'
      };
      timeTable.vm.contentColorMap = {
        'Sleep': '#B8D4E8',
        'Work': '#C8E6C9'
      };
      timeTable.vm.emitDataChange();

      await wrapper.vm.$nextTick();

      // Check that TimeSummary receives the updated data
      expect(timeSummary.props('cellData')).toEqual(timeTable.vm.cellData);
      expect(timeSummary.props('contentColorMap')).toEqual(timeTable.vm.contentColorMap);
    });
  });
});
