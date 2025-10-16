<template>
  <div id="app">
    <div class="header">
      <h1>Weekly Time Management</h1>
      <button class="clear-btn" @click="clearAll">Clear All</button>
    </div>
    <div class="table-container">
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
              contenteditable="true"
              :style="{ backgroundColor: getCellColor(day, hour) }"
              @blur="saveCellContent($event, day, hour)"
              @keydown.enter.prevent="$event.target.blur()"
            >{{ getCellContent(day, hour) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      hours: Array.from({ length: 24 }, (_, i) => i),
      cellData: {},
      contentColorMap: {}, // Maps content text to color
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
  methods: {
    getCellContent(day, hour) {
      const key = `${day}-${hour}`;
      return this.cellData[key] || '';
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  color: #333;
  margin: 0;
  flex-grow: 1;
  text-align: center;
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
}

.time-cell:hover {
  background-color: #f0f0f0;
}

.time-cell:focus {
  outline: 2px solid #4CAF50;
  background-color: #fff;
}
</style>
