<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <PageTitle />
    <TimeTable
      ref="timeTable"
      :days="days"
      :hours="hours"
      :initial-cell-data="cellData"
      :initial-content-color-map="contentColorMap"
      :is-dark-mode="isDarkMode"
      @data-change="handleDataChange"
      @toggle-dark-mode="toggleDarkMode"
    />
    <TimeSummary
      :cell-data="cellData"
      :content-color-map="contentColorMap"
      @rename-field="handleFieldRename"
    />
    <Actions
      @export-png="exportToPng"
      @export-json="exportToJson"
      @import-json="importFromJson"
      @clear-all="clearAll"
    />
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
      hours: Array.from({ length: 24 }, (_, i) => i),
      cellData: {},
      contentColorMap: {},
      isDarkMode: false
    };
  },
  methods: {
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

#app {
  font-family: Arial, sans-serif;
  padding: 8px;
  max-width: 100%;
  overflow-x: auto;
  min-height: 100vh;
  transition: background-color 0.3s;
}

#app.dark-mode {
  background-color: #1a1a1a;
}

#app.dark-mode .header h1 {
  color: #e0e0e0;
}
</style>
