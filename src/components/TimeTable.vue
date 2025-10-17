<template>
  <div class="table-wrapper">
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
            :data-cell-key="`${day}-${hour}`"
            class="time-cell"
            :class="{ 'selected': isCellSelected(day, hour) }"
            contenteditable="true"
            :style="{ backgroundColor: getCellColor(day, hour) }"
            @mousedown="startSelection(day, hour, $event)"
            @mouseenter="updateSelection(day, hour)"
            @touchstart="handleTouchStart(day, hour, $event)"
            @touchmove="handleTouchMove($event)"
            @touchend="handleTouchEnd"
            @blur="saveCellContent($event, day, hour)"
            @keydown.enter.prevent="$event.target.blur()"
          >{{ getCellContent(day, hour) }}</td>
        </tr>
      </tbody>
    </table>
      <InputDialog ref="inputDialog" />
    </div>
    <div class="scroll-buttons">
      <button class="scroll-btn scroll-left" @click="scrollLeft" aria-label="Scroll left">‹</button>
      <button class="scroll-btn scroll-right" @click="scrollRight" aria-label="Scroll right">›</button>
    </div>
  </div>
</template>

<script>
import InputDialog from './InputDialog.vue';

export default {
  name: 'TimeTable',
  components: {
    InputDialog
  },
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
    async endSelection() {
      if (!this.isSelecting) return;

      this.isSelecting = false;

      if (this.selectedCells.length > 0) {
        const content = await this.$refs.inputDialog.show(
          `Enter content for ${this.selectedCells.length} selected cell${this.selectedCells.length > 1 ? 's' : ''}`,
          'Enter activity name...'
        );
        if (content !== null && content.trim() !== '') {
          this.applyContentToSelection(content.trim());
        }
      }

      this.selectedCells = [];
      this.selectionStart = null;
      this.selectionEnd = null;
    },
    handleTouchStart(day, hour, event) {
      // Prevent default to avoid scrolling while selecting
      event.preventDefault();

      this.isSelecting = true;
      this.selectionStart = { day, hour };
      this.selectionEnd = { day, hour };
      this.updateSelectedCells();
    },
    handleTouchMove(event) {
      if (!this.isSelecting) return;

      event.preventDefault();

      const touch = event.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (element && element.classList.contains('time-cell')) {
        const cellKey = element.getAttribute('data-cell-key');
        if (cellKey) {
          const [day, hourStr] = cellKey.split('-');
          const hour = parseInt(hourStr, 10);
          this.updateSelection(day, hour);
        }
      }
    },
    handleTouchEnd() {
      this.endSelection();
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
    },
    scrollLeft() {
      const container = this.$refs.tableContainer;
      if (container) {
        container.scrollBy({ left: -200, behavior: 'smooth' });
      }
    },
    scrollRight() {
      const container = this.$refs.tableContainer;
      if (container) {
        container.scrollBy({ left: 200, behavior: 'smooth' });
      }
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
.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.scroll-btn {
  width: 44px;
  height: 44px;
  background-color: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 4px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  user-select: none;
  line-height: 1;
}

.scroll-btn:hover {
  background-color: rgba(76, 175, 80, 0.25);
  border-color: rgba(76, 175, 80, 0.5);
  transform: translateY(-1px);
}

.scroll-btn:active {
  background-color: rgba(76, 175, 80, 0.35);
  transform: translateY(0);
}

.table-container {
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Hide scrollbar but keep functionality */
.table-container::-webkit-scrollbar {
  display: none;
}

.table-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.time-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.time-table th,
.time-table td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: center;
  font-size: 14px;
}

.time-table th {
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
}

.time-table th.hour-header {
  background-color: #f9f9f9;
  min-width: 60px;
  color: #666;
  font-weight: bold;
}

.hour-cell {
  background-color: #f9f9f9;
  font-weight: bold;
  color: #666;
  min-width: 60px;
}

.time-cell {
  min-width: 80px;
  height: 32px;
  cursor: text;
  transition: background-color 0.2s;
  padding: 4px;
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
