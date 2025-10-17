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

## 11
I want to select a area and edit them one time,
the opertaion step is
1. click and hold to select a square area
2. edit one field among them
3. adjust content all selected area fields

## 12
move buttons to page bottom, and surround them with css like Time Summary.

## 13
time to refactor, but before refactoring, we need to add some unit test.
now, you cannot edit App.vue,
and add tests for all business logic, but not UIUX,
make an example: same field content should have same background color, time summary should correct.

## 14
we should refactor now,
split App.vue to different components: title, table, time summary, actions.
And do not modify unit tests, let them failed, it's okay.

## 15
All unit tests are successful, that's weird,
I found you didn't move bussiness logic into their component,
let's modify.
after modification, our unit tests should have some errors.

## 16
fix unit tests, and do not modify production code.

## 17
still have some unit tests failed, fix them.
and also remove REFACTORING md file.

## 18
failed test still exist, here are some information, fix them,

 FAIL  src/tests/App.spec.js > App.vue - Integration Tests > Export Functionality > should handle export-json event from Actions component
TypeError: el.setAttribute is not a function
 ❯ setScopeId node_modules/@vue/runtime-dom/dist/runtime-dom.cjs.js:58:8
 ❯ setScopeId node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4925:7
 ❯ mountElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4889:5
 ❯ processElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4840:7
 ❯ patch node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4706:11
 ❯ mountChildren node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4952:7
 ❯ mountElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4875:7
 ❯ processElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4840:7
 ❯ patch node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4706:11
 ❯ ReactiveEffect.componentUpdateFn [as fn] node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:5417:9

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  src/tests/App.spec.js > App.vue - Integration Tests > Export Functionality > should handle export-png event from Actions component
 FAIL  src/tests/App.spec.js > App.vue - Integration Tests > Import Functionality > should handle import-json event from Actions component
 FAIL  src/tests/App.spec.js > App.vue - Integration Tests > Import Functionality > should show alert for invalid JSON format
 FAIL  src/tests/App.spec.js > App.vue - Integration Tests > Component Integration > should pass updated data to TimeSummary when TimeTable data changes
 FAIL  src/tests/App.spec.js > App.vue - Integration Tests > Component Integration > should maintain data consistency between TimeTable and TimeSummary
TypeError: el.setAttribute is not a function
 ❯ setScopeId node_modules/@vue/runtime-dom/dist/runtime-dom.cjs.js:58:8
 ❯ setScopeId node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4925:7
 ❯ mountElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4889:5
 ❯ processElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4840:7
 ❯ patch node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4706:11
 ❯ mountChildren node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4952:7
 ❯ mountElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4875:7
 ❯ processElement node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4840:7
 ❯ patch node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:4706:11
 ❯ ReactiveEffect.componentUpdateFn [as fn] node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:5337:11

## 19
we want to better user experience, here are some operation we should modify,
1. use self component enter field content instead of native alert window.
2. fix select and drag when using moblie phone.
3. reduce margin size, we should do our better to show more content.

## 20 -> bad prompt, didn't adjust
we should do some improvements,
1. add table's scroll bar instead of native scroll bar.
2. Change table's first column "Hour"'s background color to gray, same with hour 0-23.

## 21
restore last modification

## 22
restore last scroll bar's modification

## 23
1. change table's first column's first field background color to the same with first column's other row, it looks like gray, more accurate, the field's content is "Hour", I mean the field we need to change.
2. make the table's horizontal scroll bar more thicker, it would be good for mobile user.

## 24
1. the field "Hour"'s background is not gray, fix it.
2. and make table's horizontal scroll bar more obvious.

## 25
the table's horizontal scroll bar is still not good,
imagine you are mobile user, how to improve for better UX, and use dark gray for it, not green.

## 26
scroll bar is still bad, think a new way to satisfy UX.

## 27
the shadow's effect is not good, restore it.
and I think we just add two buttons: "left" and "right" to help user move table view.

## 28
looks good,
I want to move table view buttons below the table,
and make its color more transparenter and fit table's color.
