window.addEventListener('load', init);

let field;
let width = 10;
let height = 15;
let totalTiles = width * height;
let difficultyPercentage = 7.5;
let mineAmount = 0;
const colors = ['blue', 'green', 'red', 'darkblue', 'darkred', 'teal', 'purple', 'black'];
let gameOver = false;
let connectedBlankTiles = [];
let mines = [];

function init() {
    field = document.getElementById('field');
    field.addEventListener('click', clickHandler);
    field.addEventListener('contextmenu', rightClickHandler);

    prepareGrid();
    resetGame();

}

function prepareGrid() {

    field.innerHTML = '';

    field.style.gridTemplateColumns = `repeat(${width}, ${100 / width}%)`;
    field.style.gridTemplateRows = `repeat(${height}, ${100 / height}%)`;
    let totalTiles = (width * height);

    for (let i = 1; i <= totalTiles; i++) {
        let div = document.createElement('div');

        div.id = 'tile' + i;
        div.classList.add('tile');

        let columnPosition = (i % width);
        if (columnPosition === 0) {
            columnPosition = width;
        }

        const rowPosition = Math.ceil(i / width);

        div.style.gridColumn = `${columnPosition} / ${columnPosition + 1}`;
        div.style.gridRow = `${rowPosition} / ${rowPosition + 1}`;

        field.appendChild(div);
    }

}

function resetGame() {

    gameOver = false;
    mines = [];
    connectedBlankTiles = [];

    let tiles = document.getElementsByClassName('tile');

    for (const tile of tiles) {
        tile.innerText = '';
        tile.className = 'tile';
        tile.style.color = 'black';
        tile.style.fontSize = '';
        tile.style.backgroundColor = '';
        tile.classList.add('filled');
    }


    mineAmount = Math.floor(totalTiles / difficultyPercentage);

    let minePositions = [];

    for (let i = 0; i < mineAmount; i++) {

        let number = Math.floor((Math.random() * totalTiles) + 1);

        while (minePositions.includes(number)) {
            number = Math.floor((Math.random() * totalTiles) + 1);
        }

        minePositions.push(number);

    }

    for (const minePosition of minePositions) {

        let mine = document.getElementById('tile' + minePosition);

        mine.classList.add('mine');

        let surroundingTiles = getSurroundingTiles(mine);

        for (const surroundingTile of surroundingTiles) {
            surroundingTile.insertAdjacentText('beforeend', 'I');
        }

    }

    for (const tile of tiles) {
        if (tile.classList.contains('mine')) {
            tile.innerText = '⦿';
        } else if (tile.innerText !== '') {
            tile.style.color = colors[tile.textContent.length - 1];
            tile.innerText = tile.textContent.length.toString();
        }
    }

    mines = document.getElementsByClassName('mine');

}


function clickHandler(e) {

    if (gameOver) {
        resetGame();

    } else {

        if (e.target.classList.contains('filled')) {
            dig(e.target);

            if (!e.target.innerText) {
                digSurrounding(e.target);
            }
        } else {
            if (e.target.innerText) {

                let surroundingTiles = getSurroundingTiles(e.target);
                let surroundingFlags = 0;

                for (const surroundingTile of surroundingTiles) {
                    if (surroundingTile.classList.contains('flag')) {
                        surroundingFlags++;
                    }
                }

                if (parseInt(e.target.innerText, 10) === surroundingFlags) {
                    digSurrounding(e.target);
                }
            }
        }

        if (gameOver) {
            revealMines();
            let wrongFlags = getWrongFlags();
            for (const wrongFlag of wrongFlags) {
                wrongFlag.style.fontSize = '2vw';
                wrongFlag.style.color = 'black';
                wrongFlag.innerText = 'X';
            }
        } else {
            checkWin();
        }

    }

}

function rightClickHandler(e) {
    e.preventDefault();

    if (gameOver) {
        resetGame();

    } else if (e.target.classList.contains('filled')) {
        e.target.classList.toggle('flag');
    }

    checkWin();
}

function dig(tile) {

    if (!tile.classList.contains('flag')) {

        if (tile.classList.contains('mine')) {
            gameOver = true;
        }

        if (tile.classList.contains('filled')) {
            tile.classList.replace('filled', 'empty');
        }

    }
}

function getSurroundingTiles(tile) {

    const tileIdNumber = parseInt(tile.id.replace(/[^0-9]/g, ''), 10);

    let surroundingTiles = [];

    let columnPosition = (tileIdNumber % width);
    if (columnPosition === 0) {
        columnPosition = width;
    }

    const rowPosition = Math.ceil(tileIdNumber / width);

    if (columnPosition !== 1) {
        surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber - 1))));

        if (rowPosition !== 1) {
            surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber - width - 1))));
        }

        if (rowPosition !== height) {
            surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber + width - 1))));
        }
    }

    if (columnPosition !== width) {
        surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber + 1))));

        if (rowPosition !== 1) {
            surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber - width + 1))));
        }

        if (rowPosition !== height) {
            surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber + width + 1))));
        }
    }

    if (rowPosition !== 1) {
        surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber - width))));
    }

    if (rowPosition !== height) {
        surroundingTiles.push(document.getElementById(('tile' + (tileIdNumber + width))));
    }

    return surroundingTiles;

}

function digSurrounding(tile) {

    let surroundingTiles = getSurroundingTiles(tile);

    surroundingTiles.filter(checkIfFilled);

    for (const surroundingTile of surroundingTiles) {
        dig(surroundingTile);
        if (!surroundingTile.innerText) {
            connectedBlankTiles.push(surroundingTile);
        }
    }

    if (connectedBlankTiles.length > 0 && !gameOver) {
        let nextTile = connectedBlankTiles.shift();
        let surroundingNextTile = getSurroundingTiles(nextTile).filter(checkIfFilled);

        while (surroundingNextTile.length === 0) {
            nextTile = connectedBlankTiles.shift();
            surroundingNextTile = getSurroundingTiles(nextTile).filter(checkIfFilled);
        }

        digSurrounding(nextTile);
    }

}

function checkIfFilled(value) {
    if (value.classList.contains('filled')) {
        return value;
    }
}

function checkIfNotMined(value) {
    if (!value.classList.contains('mine')) {
        return value;
    }
}

function revealMines() {
    let unflaggedMines = [];
    let flaggedMines = [];

    for (const mine of mines) {
        if (!mine.classList.contains('flag')) {
            unflaggedMines.push(mine);
        } else {
            flaggedMines.push(mine);
        }
    }

    for (const unflaggedMine of unflaggedMines) {
        unflaggedMine.style.fontSize = '2vw';
    }

    for (const flaggedMine of flaggedMines) {
        flaggedMine.style.backgroundColor = 'green';
        flaggedMine.style.fontSize = '2vw';
    }
}

function checkWin() {
    const flagged = document.getElementsByClassName('flag');

    if (flagged.length === mineAmount) {
        const wrongFlags = getWrongFlags();

        if (wrongFlags.length === 0) {

            for (let mine of mines) {
                mine.style.backgroundColor = 'green';
            }

            let remainingFilledTiles = document.getElementsByClassName('filled');
            for (const remainingFilledTile of remainingFilledTiles) {
                dig(remainingFilledTile);
            }

            gameOver = true;
        }
    }
}

function getWrongFlags() {
    const flagged = document.getElementsByClassName('flag');
    let flaggedArray = [];

    for (const flaggedElement of flagged) {
        flaggedArray.push(flaggedElement);
    }
    return flaggedArray.filter(checkIfNotMined);
}