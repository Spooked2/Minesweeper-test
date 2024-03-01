window.addEventListener('load', init);

let field;
let settings;
let width = 10;
let height = 15;
let totalTiles = 0;
let difficultyPercentage = 7.5;
let mineAmount = 0;
const colors = ['blue', 'green', 'red', 'darkblue', 'darkred', 'teal', 'purple', 'black'];
let gameOver = false;
let connectedBlankTiles = [];
let mines = [];
let wins = 0;
let losses = 0;
let loss = false;
let win = false;
let bestTime = '--:--';

function init() {
    settings = document.getElementById('settings');
    settings.addEventListener('click', settingsClickHandler);

    field = document.getElementById('field');
    field.addEventListener('click', clickHandler);
    field.addEventListener('contextmenu', rightClickHandler);

    prepareGrid();
    resetGame();

}

function prepareGrid() {

    field.innerHTML = '';

    totalTiles = width * height;

    field.style.gridTemplateColumns = `repeat(${width}, ${100 / width}%)`;
    field.style.gridTemplateRows = `repeat(${height}, ${100 / height}%)`;

    switch (width) {
        case 10: field.style.width = '25vw'; break;
        case 15: field.style.width = '35vw'; break;
        case 20: field.style.width = '45vw'; break;
    }

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

    if (loss) {
    losses++;
    updateStat('losses', losses);
    loss = false;
    } else if (win) {
        wins++;
        updateStat('wins', wins);
        win = false;
    }
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
            loss = true;
        }

        if (tile.classList.contains('filled')) {
            tile.classList.replace('filled', 'empty');
        }

    }
}

/**
 *
 * @param {HTMLDivElement} tile
 * @returns {*[]}
 */
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

            win = true;
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

function settingsClickHandler(e) {
    if (e.target.tagName === 'BUTTON') {

        switch (e.target.id) {
            case 'easy': difficultyPercentage = 7.5; updateStat('currentDifficulty', 'Easy'); break;
            case 'intermediate': difficultyPercentage = 5; updateStat('currentDifficulty', 'Intermediate'); break;
            case 'hard': difficultyPercentage = 4; updateStat('currentDifficulty', 'Hard'); break;

            case 'small': width = 10; prepareGrid(); updateStat('currentFieldSize', 'Small'); break;
            case 'medium': width = 15; prepareGrid(); updateStat('currentFieldSize', 'Medium'); break;
            case 'large': width = 20; prepareGrid(); updateStat('currentFieldSize', 'Large'); break;
        }

        resetGame();

    }
}

function updateStat(stat, newValue) {
    let element;

     element = document.getElementById(stat);
     element.innerText = newValue;
}