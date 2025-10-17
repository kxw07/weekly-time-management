<template>
  <div v-if="isVisible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-content" @click.stop>
      <h3>{{ title }}</h3>
      <input
        ref="input"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        @keydown.enter="handleConfirm"
        @keydown.esc="handleCancel"
      />
      <div class="dialog-buttons">
        <button class="btn-cancel" @click="handleCancel">Cancel</button>
        <button class="btn-confirm" @click="handleConfirm">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputDialog',
  data() {
    return {
      isVisible: false,
      inputValue: '',
      title: '',
      placeholder: '',
      resolvePromise: null
    };
  },
  methods: {
    show(title, placeholder = '') {
      this.isVisible = true;
      this.title = title;
      this.placeholder = placeholder;
      this.inputValue = '';

      this.$nextTick(() => {
        this.$refs.input?.focus();
      });

      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },
    handleConfirm() {
      this.isVisible = false;
      if (this.resolvePromise) {
        this.resolvePromise(this.inputValue);
        this.resolvePromise = null;
      }
    },
    handleCancel() {
      this.isVisible = false;
      if (this.resolvePromise) {
        this.resolvePromise(null);
        this.resolvePromise = null;
      }
    },
    handleOverlayClick() {
      this.handleCancel();
    }
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  max-width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

#app.dark-mode .dialog-content {
  background: #2b2b2b;
}

.dialog-content h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  transition: color 0.3s;
}

#app.dark-mode .dialog-content h3 {
  color: #e0e0e0;
}

.dialog-content input {
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.3s, color 0.3s;
  background-color: white;
  color: #333;
}

#app.dark-mode .dialog-content input {
  background-color: #1a1a1a;
  color: #e0e0e0;
  border-color: #555;
}

#app.dark-mode .dialog-content input::placeholder {
  color: #888;
}

.dialog-content input:focus {
  outline: none;
  border-color: #4CAF50;
}

.dialog-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}

.dialog-buttons button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
  transition: background-color 0.2s, color 0.3s;
}

#app.dark-mode .btn-cancel {
  background-color: #3a3a3a;
  color: #e0e0e0;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

#app.dark-mode .btn-cancel:hover {
  background-color: #4a4a4a;
}

.btn-confirm {
  background-color: #4CAF50;
  color: white;
}

.btn-confirm:hover {
  background-color: #45a049;
}

.btn-confirm:active {
  background-color: #3d8b40;
}
</style>
