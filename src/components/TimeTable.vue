<template>
  <div class="table-wrapper" :class="{ 'dark-mode': isDarkMode }" :data-dark-mode="isDarkMode">
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
            :class="{ 'selected': isCellSelected(day, hour), 'locked': isLocked }"
            :contenteditable="!isLocked"
            :style="{ backgroundColor: getCellColor(day, hour) }"
            @mousedown="handleMouseDown(day, hour, $event)"
            @mouseenter="handleMouseEnter(day, hour)"
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
    <div class="control-buttons">
      <div class="scroll-buttons" v-if="showScrollButtons">
        <button class="scroll-btn scroll-left" @mousedown="scrollLeft" @touchstart="scrollLeft" aria-label="Scroll left">‹</button>
        <button class="scroll-btn scroll-right" @mousedown="scrollRight" @touchstart="scrollRight" aria-label="Scroll right">›</button>
      </div>
      <div class="mode-buttons">
        <button
          v-if="showScrollButtons"
          class="mode-btn"
          @click="toggleLockMode"
          :aria-label="isLocked ? 'Unlock editing' : 'Lock editing'"
        >
          {{ isLocked ? '🔒' : '🔓' }}
        </button>
        <button
          class="mode-btn"
          @click="toggleDarkMode"
          aria-label="Toggle dark mode"
        >
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </div>
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
    },
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['data-change', 'toggle-dark-mode'],
  data() {
    return {
      cellData: { ...this.initialCellData },
      contentColorMap: { ...this.initialContentColorMap },
      isSelecting: false,
      selectionStart: null,
      selectionEnd: null,
      selectedCells: [],
      showScrollButtons: false,
      isLocked: false,
      dragScrollStart: null,
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
    handleMouseDown(day, hour, event) {
      if (event.button !== 0) return;

      if (this.isLocked) {
        this.startDragScroll(event);
      } else {
        this.startSelection(day, hour, event);
      }
    },
    handleMouseEnter(day, hour) {
      if (this.isLocked) return;
      this.updateSelection(day, hour);
    },
    startSelection(day, hour, event) {
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
    startDragScroll(event) {
      const container = this.$refs.tableContainer;
      if (!container) return;

      this.dragScrollStart = {
        scrollLeft: container.scrollLeft,
        clientX: event.clientX
      };

      const handleMouseMove = (e) => {
        if (!this.dragScrollStart) return;
        const dx = e.clientX - this.dragScrollStart.clientX;
        container.scrollLeft = this.dragScrollStart.scrollLeft - dx;
      };

      const handleMouseUp = () => {
        this.dragScrollStart = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      event.preventDefault();
    },
    async endSelection() {
      if (!this.isSelecting || this.isLocked) return;

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
      if (this.isLocked) {
        return;
      }

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
    scrollLeft(event) {
      event.preventDefault();
      event.target.blur();
      const container = this.$refs.tableContainer;
      if (container) {
        const newScrollLeft = Math.max(0, container.scrollLeft - 200);
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    },
    scrollRight(event) {
      event.preventDefault();
      event.target.blur();
      const container = this.$refs.tableContainer;
      if (container) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const newScrollLeft = Math.min(maxScroll, container.scrollLeft + 200);
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    },
    checkScrollable() {
      const container = this.$refs.tableContainer;
      if (container) {
        this.showScrollButtons = container.scrollWidth > container.clientWidth;
      }
    },
    toggleLockMode() {
      this.isLocked = !this.isLocked;
      if (this.isLocked) {
        this.selectedCells = [];
        this.selectionStart = null;
        this.selectionEnd = null;
      }
    },
    toggleDarkMode() {
      this.$emit('toggle-dark-mode');
    }
  },
  mounted() {
    window.addEventListener('mouseup', this.endSelection);
    this.checkScrollable();
    window.addEventListener('resize', this.checkScrollable);
  },
  beforeUnmount() {
    window.removeEventListener('mouseup', this.endSelection);
    window.removeEventListener('resize', this.checkScrollable);
  }
};
</script>

<style scoped>
.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: background-color 0.3s, color 0.3s;
  padding: 12px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

.table-wrapper.dark-mode {
  background: #1e1e1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.mode-buttons {
  display: flex;
  gap: 8px;
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

.mode-btn {
  width: 44px;
  height: 44px;
  background-color: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  user-select: none;
}

.mode-btn:hover {
  background-color: rgba(76, 175, 80, 0.25);
  border-color: rgba(76, 175, 80, 0.5);
  transform: translateY(-1px);
}

.mode-btn:active {
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

.time-cell.locked {
  cursor: grab;
}

.time-cell.locked:active {
  cursor: grabbing;
}

/* Dark mode styles */
.table-wrapper.dark-mode .table-container {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.table-wrapper.dark-mode .time-table {
  background: #2b2b2b;
}

.table-wrapper.dark-mode .time-table th {
  background-color: #1a5f1f;
  color: #e0e0e0;
}

.table-wrapper.dark-mode .time-table th.hour-header {
  background-color: #424242;
  color: #b0b0b0;
}

.table-wrapper.dark-mode .hour-cell {
  background-color: #424242;
  color: #b0b0b0;
}

.table-wrapper.dark-mode .time-table td {
  border-color: #555;
  color: #e0e0e0;
}

.table-wrapper.dark-mode .time-cell:hover {
  background-color: #3a3a3a;
}

.table-wrapper.dark-mode .time-cell:focus {
  outline: 2px solid #4CAF50;
  background-color: #2b2b2b;
}
</style>
