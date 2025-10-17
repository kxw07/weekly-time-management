<template>
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
</template>

<script>
export default {
  name: 'TimeTable',
  props: {
    days: {
      type: Array,
      required: true
    },
    hours: {
      type: Array,
      required: true
    },
    initialCellData: {
      type: Object,
      default: () => ({})
    },
    initialContentColorMap: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['data-change'],
  data() {
    return {
      cellData: { ...this.initialCellData },
      contentColorMap: { ...this.initialContentColorMap },
      isSelecting: false,
      selectionStart: null,
      selectionEnd: null,
      selectedCells: [],
      colorPalette: [
        '#B8D4E8',
        '#C8E6C9',
        '#FFE0B2',
        '#F8BBD0',
        '#D1C4E9',
        '#FFCCBC',
        '#B2DFDB',
        '#FFF9C4',
        '#E1BEE7',
        '#DCEDC8',
        '#FFECB3',
        '#CFD8DC'
      ]
    };
  },
  watch: {
    initialCellData: {
      handler(newVal) {
        this.cellData = { ...newVal };
      },
      deep: true
    },
    initialContentColorMap: {
      handler(newVal) {
        this.contentColorMap = { ...newVal };
      },
      deep: true
    }
  },
  methods: {
    getCellContent(day, hour) {
      const key = `${day}-${hour}`;
      return this.cellData[key] || '';
    },
    getCellColor(day, hour) {
      const content = this.cellData[`${day}-${hour}`];

      if (content && content.trim() !== '') {
        return this.contentColorMap[content] || 'transparent';
      }
      return 'transparent';
    },
    isCellSelected(day, hour) {
      return this.selectedCells.some(cell => cell.day === day && cell.hour === hour);
    },
    getAvailableColor() {
      const usedColors = Object.values(this.contentColorMap);
      const availableColor = this.colorPalette.find(color => !usedColors.includes(color));
      return availableColor || this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    },
    startSelection(day, hour, event) {
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

      if (this.selectedCells.length > 0) {
        const content = prompt(`Enter content for ${this.selectedCells.length} selected cells:`);
        if (content !== null) {
          this.applyContentToSelection(content.trim());
        }
      }

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

        if (content !== '' && !this.contentColorMap[content]) {
          this.contentColorMap[content] = this.getAvailableColor();
        }

        if (oldContent && oldContent !== content) {
          const stillUsed = Object.values(this.cellData).some(val => val === oldContent);
          if (!stillUsed) {
            delete this.contentColorMap[oldContent];
          }
        }
      });

      this.emitDataChange();
    },
    saveCellContent(event, day, hour) {
      const key = `${day}-${hour}`;
      const content = event.target.innerText.trim();
      const oldContent = this.cellData[key];

      this.cellData[key] = content;

      if (content !== '') {
        if (!this.contentColorMap[content]) {
          this.contentColorMap[content] = this.getAvailableColor();
        }
      }

      if (oldContent && oldContent !== content) {
        const stillUsed = Object.values(this.cellData).some(val => val === oldContent);
        if (!stillUsed) {
          delete this.contentColorMap[oldContent];
        }
      }

      this.emitDataChange();
    },
    emitDataChange() {
      this.$emit('data-change', {
        cellData: this.cellData,
        contentColorMap: this.contentColorMap
      });
    },
    clearData() {
      this.cellData = {};
      this.contentColorMap = {};
      this.emitDataChange();
    }
  },
  mounted() {
    window.addEventListener('mouseup', this.endSelection);
  },
  beforeUnmount() {
    window.removeEventListener('mouseup', this.endSelection);
  }
};
</script>

<style scoped>
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
</style>
