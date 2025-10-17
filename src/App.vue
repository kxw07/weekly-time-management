<template>
  <div id="app" @mouseup="endSelection">
    <PageTitle />
    <TimeTable
      ref="tableContainer"
      :days="days"
      :hours="hours"
      :cell-data="cellData"
      :content-color-map="contentColorMap"
      :selected-cells="selectedCells"
      @cell-blur="saveCellContent"
      @selection-start="startSelection"
      @selection-update="updateSelection"
    />
    <TimeSummary :summary="timeSummary" />
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
  computed: {
    timeSummary() {
      const summary = {};

      Object.values(this.cellData).forEach(content => {
        if (content && content.trim() !== '') {
          summary[content] = (summary[content] || 0) + 1;
        }
      });

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

      localStorage.setItem('weeklyTimeData', JSON.stringify(this.cellData));
      localStorage.setItem('weeklyTimeColors', JSON.stringify(this.contentColorMap));
    },
    getCellColor(day, hour) {
      const content = this.cellData[`${day}-${hour}`];

      if (content && content.trim() !== '') {
        return this.contentColorMap[content] || 'transparent';
      }
      return 'transparent';
    },
    getAvailableColor() {
      const usedColors = Object.values(this.contentColorMap);

      const availableColor = this.colorPalette.find(color => !usedColors.includes(color));

      return availableColor || this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
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
        const element = this.$refs.tableContainer.$el;

        const originalOverflow = element.style.overflow;

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

        element.style.overflow = originalOverflow;

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
</style>
