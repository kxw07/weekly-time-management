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
          @click="handleFieldClick(item.field)"
        >{{ item.field }}</span>
        <span class="summary-time">{{ item.count }} hr</span>
      </div>
    </div>
    <InputDialog ref="inputDialog" />
  </div>
</template>

<script>
import InputDialog from './InputDialog.vue';

export default {
  name: 'TimeSummary',
  components: {
    InputDialog
  },
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
    async handleFieldClick(oldField) {
      const newField = await this.$refs.inputDialog.show(
        'Rename Field',
        oldField
      );

      if (newField === null || newField.trim() === '' || newField.trim() === oldField) {
        return;
      }

      this.$emit('rename-field', { oldField, newField: newField.trim() });
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
  transition: background-color 0.3s, box-shadow 0.3s;
}

#app.dark-mode .footer-summary {
  background: #242424;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.footer-summary h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 16px;
  transition: color 0.3s;
}

#app.dark-mode .footer-summary h2 {
  color: #e0e0e0;
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
  transition: border-color 0.3s, box-shadow 0.3s;
}

#app.dark-mode .summary-item {
  border-color: #444;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.summary-field {
  font-weight: bold;
  color: #333;
  cursor: pointer;
  outline: none;
  border-radius: 2px;
  padding: 2px 4px;
  margin: -2px -4px;
  transition: background-color 0.2s;
}

/* Keep dark text in dark mode because backgrounds are light colored */
#app.dark-mode .summary-field {
  color: #333;
}

.summary-field:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

#app.dark-mode .summary-field:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.summary-time {
  color: #666;
  font-size: 13px;
}

/* Keep darker text in dark mode for contrast with colored backgrounds */
#app.dark-mode .summary-time {
  color: #555;
}
</style>
