<template>
  <div class="footer-summary" v-if="timeSummary.length > 0">
    <h2>Time Summary</h2>
    <div class="summary-items">
      <div
        v-for="item in timeSummary"
        :key="item.field"
        class="summary-item"
        :style="{ backgroundColor: item.color }"
      >
        <span
          class="summary-field"
          contenteditable="true"
          @blur="handleFieldRename($event, item.field)"
          @keydown.enter.prevent="$event.target.blur()"
        >{{ item.field }}</span>
        <span class="summary-time">{{ item.count }} hr</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeSummary',
  props: {
    cellData: {
      type: Object,
      required: true
    },
    contentColorMap: {
      type: Object,
      required: true
    }
  },
  emits: ['rename-field'],
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
    handleFieldRename(event, oldField) {
      const newField = event.target.innerText.trim();

      if (newField === '' || newField === oldField) {
        event.target.innerText = oldField;
        return;
      }

      this.$emit('rename-field', { oldField, newField });
    }
  }
};
</script>

<style scoped>
.footer-summary {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.footer-summary h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 16px;
}

.summary-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.summary-item {
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  gap: 6px;
  align-items: center;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 13px;
}

.summary-field {
  font-weight: bold;
  color: #333;
  cursor: text;
  outline: none;
  border-radius: 2px;
  padding: 2px 4px;
  margin: -2px -4px;
}

.summary-field:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.summary-field:focus {
  background-color: rgba(76, 175, 80, 0.1);
  outline: 1px solid rgba(76, 175, 80, 0.3);
}

.summary-time {
  color: #666;
  font-size: 13px;
}
</style>
