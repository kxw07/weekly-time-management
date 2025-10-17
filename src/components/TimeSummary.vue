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
        <span class="summary-field">{{ item.field }}</span>
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
}

.summary-time {
  color: #666;
  font-size: 13px;
}
</style>
