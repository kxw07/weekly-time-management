<template>
  <div class="actions-section">
    <h2>Actions</h2>
    <div class="button-group">
      <button class="export-btn" @click="handleExportPng">Export PNG</button>
      <button class="export-json-btn" @click="handleExportJson">Export JSON</button>
      <button class="import-json-btn" @click="handleImportClick">Import JSON</button>
      <input
        type="file"
        ref="fileInput"
        @change="handleImportChange"
        accept=".json"
        style="display: none;"
      />
      <button class="clear-btn" @click="handleClear">Clear All</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Actions',
  emits: ['export-png', 'export-json', 'import-json', 'clear-all'],
  methods: {
    handleExportPng() {
      this.$emit('export-png');
    },
    handleExportJson() {
      this.$emit('export-json');
    },
    handleImportClick() {
      this.$refs.fileInput.click();
    },
    handleImportChange(event) {
      this.$emit('import-json', event);
    },
    handleClear() {
      this.$emit('clear-all');
    }
  }
};
</script>

<style scoped>
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
</style>
