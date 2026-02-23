<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <PageTitle />
    <TimeTable
      ref="timeTable"
      :days="days"
      :hours="hours"
      :time-step="timeStep"
      :initial-cell-data="cellData"
      :initial-content-color-map="contentColorMap"
      :is-dark-mode="isDarkMode"
      @data-change="handleDataChange"
      @toggle-dark-mode="toggleDarkMode"
      @toggle-interval="toggleInterval"
    />
    <TimeSummary
      :cell-data="cellData"
      :content-color-map="contentColorMap"
      :time-step="timeStep"
      @rename-field="handleFieldRename"
    />
    <Actions
      @export-png="exportToPng"
      @export-json="exportToJson"
      @import-json="importFromJson"
      @clear-all="clearAll"
    />
    <footer class="app-footer">
      <a href="https://github.com/kxw07/weekly-time-management" target="_blank" rel="noopener noreferrer" class="github-link" aria-label="GitHub Repository">
        <svg height="24" viewBox="0 0 16 16" width="24" class="github-icon">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
      </a>
    </footer>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';
import PageTitle from './components/PageTitle.vue';
import TimeTable from './components/TimeTable.vue';
import TimeSummary from './components/TimeSummary.vue';
import Actions from './components/Actions.vue';

export default {
  name: 'App',
  components: {
    PageTitle,
    TimeTable,
    TimeSummary,
    Actions
  },
  data() {
    return {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeStep: 60,
      cellData: {},
      contentColorMap: {},
      isDarkMode: false
    };
  },
  computed: {
    hours() {
      const slots = [];
      const step = this.timeStep / 60;
      for (let i = 0; i < 24; i += step) {
        slots.push(i);
      }
      return slots;
    }
  },
  watch: {
    isDarkMode(newVal) {
      document.body.classList.toggle('dark-mode', newVal);
    }
  },
  methods: {
    toggleInterval() {
      const oldStep = this.timeStep;
      const newStep = oldStep === 60 ? 30 : 60;
      this.timeStep = newStep;

      if (oldStep === 60 && newStep === 30) {
        const newCellData = { ...this.cellData };
        let hasChanges = false;

        Object.entries(this.cellData).forEach(([key, content]) => {
          if (!content) return;

          const lastDashIndex = key.lastIndexOf('-');
          if (lastDashIndex === -1) return;

          const day = key.substring(0, lastDashIndex);
          const hourStr = key.substring(lastDashIndex + 1);
          const hour = parseFloat(hourStr);

          // If it is an integer hour (e.g., 9, 10), fill the half hour (e.g., 9.5, 10.5)
          if (Number.isInteger(hour)) {
            const halfHourKey = `${day}-${hour + 0.5}`;
            if (!newCellData[halfHourKey]) {
              newCellData[halfHourKey] = content;
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          this.cellData = newCellData;
          localStorage.setItem('weeklyTimeData', JSON.stringify(this.cellData));
        }
      }

      localStorage.setItem('weeklyTimeStep', JSON.stringify(this.timeStep));
    },
    handleDataChange({ cellData, contentColorMap }) {
      this.cellData = cellData;
      this.contentColorMap = contentColorMap;
      localStorage.setItem('weeklyTimeData', JSON.stringify(this.cellData));
      localStorage.setItem('weeklyTimeColors', JSON.stringify(this.contentColorMap));
    },
    handleFieldRename({ oldField, newField }) {
      const newCellData = {};
      const newContentColorMap = { ...this.contentColorMap };

      Object.keys(this.cellData).forEach(key => {
        if (this.cellData[key] === oldField) {
          newCellData[key] = newField;
        } else {
          newCellData[key] = this.cellData[key];
        }
      });

      if (newContentColorMap[oldField]) {
        newContentColorMap[newField] = newContentColorMap[oldField];
        delete newContentColorMap[oldField];
      }

      this.cellData = newCellData;
      this.contentColorMap = newContentColorMap;
      localStorage.setItem('weeklyTimeData', JSON.stringify(this.cellData));
      localStorage.setItem('weeklyTimeColors', JSON.stringify(this.contentColorMap));
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode', this.isDarkMode);
      localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    },
    clearAll() {
      if (confirm('Are you sure you want to clear all content?')) {
        this.$refs.timeTable.clearData();
        localStorage.removeItem('weeklyTimeData');
        localStorage.removeItem('weeklyTimeColors');
      }
    },
    async exportToPng() {
      try {
        const tableContainer = this.$refs.timeTable.$refs.tableContainer;
        const table = tableContainer.querySelector('.time-table');

        const originalContainerOverflow = tableContainer.style.overflow;
        const originalContainerWidth = tableContainer.style.width;
        const originalContainerHeight = tableContainer.style.height;

        tableContainer.style.overflow = 'visible';
        tableContainer.style.width = 'auto';
        tableContainer.style.height = 'auto';

        const canvas = await html2canvas(table, {
          backgroundColor: this.isDarkMode ? '#2b2b2b' : '#ffffff',
          scale: 2,
          scrollX: 0,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
          useCORS: true
        });

        tableContainer.style.overflow = originalContainerOverflow;
        tableContainer.style.width = originalContainerWidth;
        tableContainer.style.height = originalContainerHeight;

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const date = new Date().toISOString().split('T')[0];
          link.download = `weekly-time-management-${date}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        });
      } catch (error) {
        console.error('Error exporting to PNG:', error);
        alert('Failed to export table. Please try again.');
      }
    },
    exportToJson() {
      try {
        const data = {
          cellData: this.cellData,
          contentColorMap: this.contentColorMap,
          exportDate: new Date().toISOString()
        };

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `weekly-time-management-${date}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting to JSON:', error);
        alert('Failed to export JSON. Please try again.');
      }
    },
    importFromJson(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          if (data.cellData && data.contentColorMap) {
            this.cellData = data.cellData;
            this.contentColorMap = data.contentColorMap;

            localStorage.setItem('weeklyTimeData', JSON.stringify(this.cellData));
            localStorage.setItem('weeklyTimeColors', JSON.stringify(this.contentColorMap));

            alert('JSON data imported successfully!');
          } else {
            alert('Invalid JSON format. Please use a file exported from this application.');
          }
        } catch (error) {
          console.error('Error importing JSON:', error);
          alert('Failed to import JSON. Please check the file format.');
        }

        event.target.value = '';
      };

      reader.readAsText(file);
    }
  },
  mounted() {
    const savedData = localStorage.getItem('weeklyTimeData');
    if (savedData) {
      this.cellData = JSON.parse(savedData);
    }

    const savedColors = localStorage.getItem('weeklyTimeColors');
    if (savedColors) {
      this.contentColorMap = JSON.parse(savedColors);
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = JSON.parse(savedDarkMode);
      document.body.classList.toggle('dark-mode', this.isDarkMode);
    }

    const savedTimeStep = localStorage.getItem('weeklyTimeStep');
    if (savedTimeStep) {
      this.timeStep = JSON.parse(savedTimeStep);
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  transition: background-color 0.3s;
  background-color: #f5f5f5;
}

body.dark-mode {
  background-color: #121212;
}

#app {
  font-family: Arial, sans-serif;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: hidden;
  min-height: 100vh;
  transition: background-color 0.3s, border-radius 0.3s;
}

#app.dark-mode {
  background-color: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  margin-top: 16px;
  margin-bottom: 16px;
  min-height: calc(100vh - 32px);
}

#app.dark-mode .header h1 {
  color: #e0e0e0;
}

.app-footer {
  margin-top: 12px;
  padding: 8px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.github-link {
  color: #333;
  transition: transform 0.2s, color 0.2s;
  display: inline-flex;
}

.github-link:hover {
  transform: scale(1.1);
  color: #4CAF50;
}

.github-icon {
  fill: currentColor;
}

#app.dark-mode .github-link {
  color: #e0e0e0;
}

#app.dark-mode .github-link:hover {
  color: #4CAF50;
}
</style>
