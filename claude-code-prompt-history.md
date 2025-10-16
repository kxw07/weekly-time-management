## 1
project phase 1:
make a table,
first row is day title which are Sunday to Saturday,
first column is hour title which using 0-23 express hour, and every hour is one column.

## 2
Fix error:
Pre-transform error: Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files.
  Plugin: vite:import-analysis
  File: /Users/kaiwu/git/dojo/oh-my-little-projects/weekly-time-management/src/App.vue:3:35
  1  |  <template>
  2  |    <div id="app">
  3  |      <h1>Weekly Time Management</h1>
     |                                     ^
  4  |      <div class="table-container">
  5  |        <table class="time-table">

## 3
make user can edit fields, but exclude first row and column.

## 4
after user edit the field, it would randomly attach color in background,
all background color should not be too bright.
