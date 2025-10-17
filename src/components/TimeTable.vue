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
            @mousedown="handleMouseDown(day, hour, $event)"
            @mouseenter="handleMouseEnter(day, hour)"
            @blur="handleBlur($event, day, hour)"
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
    cellData: {
      type: Object,
      required: true
    },
    contentColorMap: {
      type: Object,
      required: true
    },
    selectedCells: {
      type: Array,
      required: true
    }
  },
  emits: ['cell-blur', 'selection-start', 'selection-update'],
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
    handleMouseDown(day, hour, event) {
      this.$emit('selection-start', day, hour, event);
    },
    handleMouseEnter(day, hour) {
      this.$emit('selection-update', day, hour);
    },
    handleBlur(event, day, hour) {
      this.$emit('cell-blur', event, day, hour);
    }
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
