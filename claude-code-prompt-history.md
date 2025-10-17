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

## 5
use same color when fields content are same,
and do not use duplicated color.

## 6
add a little button on the top right side and named: "clear all" ,
its function is clear all fields content.

## 7
add a little button on the top right side, named: "export" ,
its function is export table as a png picture.

## 8
always export all table content, not just the screen.

## 9
modify button "Export" to "Export PNG",
and add another two buttons on the top right side,
one is "Export JSON", its function is export content as json format file,
the other is "Import JSON", its function is import json file from "Export JSON"'s output.

## 10
Now, I want to create a area at the footer,
which summarize different field content and sort by bigger time block,
and shows like:
Sleep: 5 hr
Reading: 4 hr
