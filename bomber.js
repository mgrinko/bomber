"use strict";

prepareField(16, 30, 99);

function prepareField(rows, cols, bombs) {
  let gameField = [];
  for (let i = 0; i < rows; i++) {
    gameField[i] = [];
    for (let j = 0; j < cols; j++) {
      gameField[i][j] = 0;
    }
  }

 setAllBombs(gameField, bombs);
 setNumbers(gameField);
 showField(gameField, bombs);

}

function pickNewRandomCell(field) {
  let i = Math.round( Math.random() * field.length - 0.5 );
  let j = Math.round( Math.random() * field[0].length - 0.5 );

  return {'i': i, 'j': j};
}

function setOneBomb(field) {
  let coordinates = pickNewRandomCell(field);

  if (field[coordinates.i][coordinates.j] === "B") {
    setOneBomb(field);
    return;
  }

  field[coordinates.i][coordinates.j] = "B";
}

function setAllBombs(field, bombs) {
  for (let k = 0; k < bombs; k++) {
      setOneBomb(field);
  }
}

function setNumbers(field) {
  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      if (field[i][j] === "B") continue;
      field[i][j] = countBombsAround(field, i, j);
    }
  }
}

function countBombsAround(field, i, j) {
  let subIMin = (i === 0) ? 0 : i - 1 ;
  let subJMin = (j === 0) ? 0 : j - 1 ;
  let subIMax = (i === (field.length - 1)) ? i : i + 1 ;
  let subJMax = (j === (field[i].length - 1)) ? j : j + 1 ;
  let bombsAmount = 0;

  for (let subI = subIMin; subI <= subIMax; subI++) {
    for (let subJ = subJMin; subJ <= subJMax; subJ++) {
      if (subI === i && subJ === j) continue;
      if (field[subI][subJ] === "B") bombsAmount++;
    }
  }

  return bombsAmount;
}

function showField(field, bombs) {
  let table = document.createElement('table');
  table.innerHTML = `<thead><tr><th colspan="${field[0].length}"><div class="counter" data-count="${bombs}">${bombs}</div><button class="restart">Restart</button></th></tr></thead>`;

  let tableBody = document.createElement('tbody');
  tableBody.innerHTML = "";

  for (let i = 0; i < field.length; i++) {
    let tr = document.createElement('tr');
    for (let j = 0; j < field[i].length; j++) {
      let td = document.createElement('td');
      td.textContent = field[i][j];
      if (field[i][j] == "B") {
        td.dataset.content = "bomb";
        // td.className = "bomb";
      } else {
        td.dataset.content = "num" + field[i][j];
        //td.className = "num" + field[i][j];
      }
      td.className = "hidden";
      tr.append(td);
    }
    tableBody.append(tr);
  }

  table.append(tableBody);
  table.addEventListener("click", clickOnCell);
  table.addEventListener("click", closeField);
  table.addEventListener("contextmenu", setFlag);

  //Two mouse buttons are clicked at the same time
  table.addEventListener('mousedown', bothMBClicked);
  table.addEventListener('mouseup', function() { oneButton = false; } );

  document.body.append(table);
}

function clickOnCell(e) {
  let target = e.target;
  if (target.tagName != 'TD') return;
  openCell(target);
}

function openCell(cell) {
  cell.classList.remove("hidden");
  cell.classList.remove("flagged");
  cell.classList.add(cell.dataset.content);
  cell.dataset.opened = "yes";

  if (cell.dataset.content === "num0") openNearCells(cell);
  if (cell.dataset.content === "bomb") gameOver(cell);
}


let oneButton = false;
function bothMBClicked(e) {
  let cell = e.target
  if (cell.tagName != "TD") return;

  //Processing of lmb & rmb pushing at the same time
  if (oneButton) {
    let bombsAmount = +cell.dataset.content.slice(3);
    // ДОПИСАТЬ ФУНКЦИЮ
    if (bombsAmount != countFlagsAround(cell)) return;
    openNearCells(cell);
    oneButton = false;
  } else {
    oneButton = true;
  }
}

function countFlagsAround(cell) {
  let flags = 0;

  let tableBody = cell.closest("tbody");
  let row = cell.closest("tr");
  for (let i = row.rowIndex - 2; i <= row.rowIndex; i++) {
    for (let j = cell.cellIndex - 1; j <= cell.cellIndex + 1; j++) {
      console.log(i + " " + j);
      if ((i < 0) ||
          (j < 0) ||
          (i >= tableBody.rows.length) ||
          (j >= row.cells.length)) continue;
      if (i === row.rowIndex - 1 && j === cell.cellIndex) continue;

      let currentCell = tableBody.rows[i].cells[j];
      if (currentCell.dataset.opened == "yes") continue;
      if (currentCell.classList.contains("flagged")) flags++;
    }
  }

  return  flags;
}

function gameOver(cell) {
  console.log("Game Over");

  let tableBody = cell.closest("tbody");
  let bombs = tableBody.querySelectorAll("[data-content='bomb']");
  for (let bomb of bombs) {
    if (bomb.classList.contains("flagged")) continue;
    bomb.classList.remove("hidden");
    bomb.classList.add(bomb.dataset.content);
  }

  let table = cell.closest("table");
  table.removeEventListener("click", clickOnCell);
  table.removeEventListener("contextmenu", setFlag);
}

function openNearCells(cell) {
  let tableBody = cell.closest("tbody");
  let row = cell.closest("tr");
  for (let i = row.rowIndex - 2; i <= row.rowIndex; i++) {
    for (let j = cell.cellIndex - 1; j <= cell.cellIndex + 1; j++) {
      console.log(i + " " + j);
      if ((i < 0) ||
          (j < 0) ||
          (i >= tableBody.rows.length) ||
          (j >= row.cells.length)) continue;
      if (i === row.rowIndex - 1 && j === cell.cellIndex) continue;

      let currentCell = tableBody.rows[i].cells[j];
      if (currentCell.dataset.opened == "yes") continue;
      if (currentCell.classList.contains("flagged")) continue;
      openCell(currentCell);
    }
  }
}

function setFlag(e) {
  let target = e.target;
  if (target.tagName != 'TD') return;
  e.preventDefault();
  if (target.dataset.opened == "yes") return;

  let counter = e.target.closest("table").querySelector(".counter");

  if (target.classList.contains("flagged")){
    target.classList.remove("flagged");
    counter.dataset.count++;
  } else {
    target.classList.add("flagged");
    counter.dataset.count--;
  }

  counter.textContent = counter.dataset.count;
}

function closeField(e) {
  let target = e.target;
  if (!target.classList.contains("restart")) return;
  let table = target.closest("table");
  table.remove();
  prepareField(16, 30, 99);
}
