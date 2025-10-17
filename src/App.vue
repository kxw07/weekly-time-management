<template>
  <div id="app" @mouseup="endSelection">
    <div class="header">
      <h1>Weekly Time Management</h1>
    </div>
    <div class="table-container" ref="tableContainer">
      <table class="time-table">
        <thead>
          <tr>
            <th class="hour-header">Hour</th>
            <th v-for="day in days" :key="day">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hour in hours" :key="hour">
            <td class="hour-cell">{{ hour }}</td>
            <td
              v-for="day in days"
              :key="`${day}-${hour}`"
              class="time-cell"
              :class="{ 'selected': isCellSelected(day, hour) }"
              contenteditable="true"
              :style="{ backgroundColor: getCellColor(day, hour) }"
              @mousedown="startSelection(day, hour, $event)"
              @mouseenter="updateSelection(day, hour)"
              @blur="saveCellContent($event, day, hour)"
              @keydown.enter.prevent="$event.target.blur()"
            >{{ getCellContent(day, hour) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer-summary" v-if="timeSummary.length > 0">
      <h2>Time Summary</h2>
      <div class="summary-items">
        <div
          v-for="item in timeSummary"
          :key="item.field"
          class="summary-item"
          :style="{ backgroundColor: item.color }"
        >
          <span class="summary-field">{{ item.field }}</span>
          <span class="summary-time">{{ item.count }} hr</span>
        </div>
      </div>
    </div>
    <div class="actions-section">
      <h2>Actions</h2>
      <div class="button-group">
        <button class="export-btn" @click="exportToPng">Export PNG</button>
        <button class="export-json-btn" @click="exportToJson">Export JSON</button>
        <button class="import-json-btn" @click="triggerImportJson">Import JSON</button>
        <input
          type="file"
          ref="fileInput"
          @change="importFromJson"
          accept=".json"
          style="display: none;"
        />
        <button class="clear-btn" @click="clearAll">Clear All</button>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';

export default {
  name: 'App',
  data() {
    return {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      hours: Array.from({ length: 24 }, (_, i) => i),
      cellData: {},
      contentColorMap: {}, // Maps content text to color
      isSelecting: false,
      selectionStart: null,
      selectionEnd: null,
      selectedCells: [],
      colorPalette: [
        '#B8D4E8', // Soft blue
        '#C8E6C9', // Soft green
        '#FFE0B2', // Soft orange
        '#F8BBD0', // Soft pink
        '#D1C4E9', // Soft purple
        '#FFCCBC', // Soft coral
        '#B2DFDB', // Soft teal
        '#FFF9C4', // Soft yellow
        '#E1BEE7', // Soft lavender
        '#DCEDC8', // Soft lime
        '#FFECB3', // Soft amber
        '#CFD8DC'  // Soft blue grey
      ]
    };
  },
  computed: {
    timeSummary() {
      // Count occurrences of each content type
      const summary = {};

      Object.values(this.cellData).forEach(content => {
        if (content && content.trim() !== '') {
          summary[content] = (summary[content] || 0) + 1;
        }
      });

      // Convert to array and sort by count (descending)
      return Object.entries(summary)
        .map(([field, count]) => ({
          field,
          count,
          color: this.contentColorMap[field] || 'transparent'
        }))
        .sort((a, b) => b.count - a.count);
    }
  },
  methods: {
    getCellContent(day, hour) {
      const key = `${day}-${hour}`;
      return this.cellData[key] || '';
    },
    isCellSelected(day, hour) {
      return this.selectedCells.some(cell => cell.day === day && cell.hour === hour);
    },
    startSelection(day, hour, event) {
      // Only start selection with left mouse button
      if (event.button !== 0) return;

      this.isSelecting = true;
      this.selectionStart = { day, hour };
      this.selectionEnd = { day, hour };
      this.updateSelectedCells();
      event.preventDefault();
    },
    updateSelection(day, hour) {
      if (!this.isSelecting) return;

      this.selectionEnd = { day, hour };
      this.updateSelectedCells();
    },
    endSelection() {
      if (!this.isSelecting) return;

      this.isSelecting = false;

      // If we have selected cells, prompt for content
      if (this.selectedCells.length > 0) {
        const content = prompt(`Enter content for ${this.selectedCells.length} selected cells:`);
        if (content !== null) {
          this.applyContentToSelection(content.trim());
        }
      }

      // Clear selection
      this.selectedCells = [];
      this.selectionStart = null;
      this.selectionEnd = null;
    },
    updateSelectedCells() {
      if (!this.selectionStart || !this.selectionEnd) {
        this.selectedCells = [];
        return;
      }

      const startDayIndex = this.days.indexOf(this.selectionStart.day);
      const endDayIndex = this.days.indexOf(this.selectionEnd.day);
      const minDayIndex = Math.min(startDayIndex, endDayIndex);
      const maxDayIndex = Math.max(startDayIndex, endDayIndex);

      const minHour = Math.min(this.selectionStart.hour, this.selectionEnd.hour);
      const maxHour = Math.max(this.selectionStart.hour, this.selectionEnd.hour);

      const selected = [];
      for (let dayIndex = minDayIndex; dayIndex <= maxDayIndex; dayIndex++) {
        for (let hour = minHour; hour <= maxHour; hour++) {
          selected.push({
            day: this.days[dayIndex],
            hour
          });
        }
      }

      this.selectedCells = selected;
    },
    applyContentToSelection(content) {
      this.selectedCells.forEach(({ day, hour }) => {
        const key = `${day}-${hour}`;
        const oldContent = this.cellData[key];

        this.cellData[key] = content;

        // Assign color for new content
        if (content !== '' && !this.contentColorMap[content]) {
          this.contentColorMap[content] = this.getAvailableColor();
        }

        // Clean up old content color if no longer used
        if (oldContent && oldContent !== content) {
          const stillUsed = Object.values(this.cellData).some(val => val === oldContent);
          if (!stillUsed) {
            delete this.contentColorMap[oldContent];
          }
        }
      });

      // Save to localStorage
      localStorage.setItem('weeklyTimeData', JSON.stringify(this.cellData));
      localStorage.setItem('weeklyTimeColors', JSON.stringify(this.contentColorMap));
    },
    getCellColor(day, hour) {
      const content = this.cellData[`${day}-${hour}`];

      // Only return color if cell has content
      if (content && content.trim() !== '') {
        return this.contentColorMap[content] || 'transparent';
      }
      return 'transparent';
    },
    getAvailableColor() {
      // Get all currently used colors
      const usedColors = Object.values(this.contentColorMap);

      // Find first unused color
      const availableColor = this.colorPalette.find(color => !usedColors.includes(color));

      // If all colors are used, return a random one
      return availableColor || this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    },
    saveCellContent(event, day, hour) {
      const key = `${day}-${hour}`;
      const content = event.target.innerText.trim();
      const oldContent = this.cellData[key];

      this.cellData[key] = content;

      if (content !== '') {
        // If this content doesn't have a color yet, assign one
        if (!this.contentColorMap[content]) {
          this.contentColorMap[content] = this.getAvailableColor();
        }
      }

      // Clean up: remove color mapping if no cells use this old content anymore
      if (oldContent && oldContent !== content) {
        const stillUsed = Object.values(this.cellData).some(val => val === oldContent);
        if (!stillUsed) {
          delete this.contentColorMap[oldContent];
        }
      }

      // Save to localStorage
      localStorage.setItem('weeklyTimeData', JSON.stringify(this.cellData));
      localStorage.setItem('weeklyTimeColors', JSON.stringify(this.contentColorMap));
    },
    clearAll() {
      if (confirm('Are you sure you want to clear all content?')) {
        this.cellData = {};
        this.contentColorMap = {};
        localStorage.removeItem('weeklyTimeData');
        localStorage.removeItem('weeklyTimeColors');
      }
    },
    async exportToPng() {
      try {
        const element = this.$refs.tableContainer;

        // Store original overflow style
        const originalOverflow = element.style.overflow;

        // Temporarily remove overflow to capture full content
        element.style.overflow = 'visible';

        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          width: element.scrollWidth,
          height: element.scrollHeight
        });

        // Restore original overflow
        element.style.overflow = originalOverflow;

        // Convert canvas to blob and download
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
    triggerImportJson() {
      this.$refs.fileInput.click();
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

            // Save to localStorage
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

        // Reset file input
        event.target.value = '';
      };

      reader.readAsText(file);
    }
  },
  mounted() {
    // Load data from localStorage on mount
    const savedData = localStorage.getItem('weeklyTimeData');
    if (savedData) {
      this.cellData = JSON.parse(savedData);
    }

    // Load colors from localStorage
    const savedColors = localStorage.getItem('weeklyTimeColors');
    if (savedColors) {
      this.contentColorMap = JSON.parse(savedColors);
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
  padding: 20px;
  max-width: 100%;
  overflow-x: auto;
}

.header {
  margin-bottom: 20px;
  text-align: center;
}

h1 {
  color: #333;
  margin: 0;
}

.export-btn {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: #1976D2;
}

.export-btn:active {
  background-color: #1565C0;
}

.export-json-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.export-json-btn:hover {
  background-color: #45a049;
}

.export-json-btn:active {
  background-color: #3d8b40;
}

.import-json-btn {
  padding: 8px 16px;
  background-color: #FF9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.import-json-btn:hover {
  background-color: #F57C00;
}

.import-json-btn:active {
  background-color: #E65100;
}

.clear-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.clear-btn:active {
  background-color: #c62828;
}

.table-container {
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.time-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.time-table th,
.time-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.time-table th {
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
}

.hour-header {
  background-color: #45a049;
  min-width: 60px;
}

.hour-cell {
  background-color: #f9f9f9;
  font-weight: bold;
  color: #666;
  min-width: 60px;
}

.time-cell {
  min-width: 100px;
  height: 40px;
  cursor: text;
  transition: background-color 0.2s;
  padding: 8px;
  vertical-align: top;
  text-align: left;
  user-select: none;
}

.time-cell:hover {
  background-color: #f0f0f0;
}

.time-cell:focus {
  outline: 2px solid #4CAF50;
  background-color: #fff;
}

.time-cell.selected {
  outline: 2px solid #2196F3;
  outline-offset: -2px;
  box-shadow: inset 0 0 0 2px rgba(33, 150, 243, 0.3);
  z-index: 1;
}

.footer-summary {
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.footer-summary h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
}

.summary-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-item {
  padding: 10px 16px;
  border-radius: 6px;
  display: flex;
  gap: 8px;
  align-items: center;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-field {
  font-weight: bold;
  color: #333;
}

.summary-time {
  color: #666;
  font-size: 14px;
}

.actions-section {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.actions-section h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
