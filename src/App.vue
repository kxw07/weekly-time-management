<template>
  <div id="app">
    <h1>Weekly Time Management</h1>
    <div class="table-container">
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
            <td v-for="day in days" :key="`${day}-${hour}`" class="time-cell"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      hours: Array.from({ length: 24 }, (_, i) => i)
    };
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

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

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
  cursor: pointer;
  transition: background-color 0.2s;
}

.time-cell:hover {
  background-color: #f0f0f0;
}
</style>
