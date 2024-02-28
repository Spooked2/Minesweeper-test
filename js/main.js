window.addEventListener('load', init);

let field;
let width = 10;
let height = 15;
let totalSpaces = width * height;
let difficultyPercentage = 7.5;
const colors = ['blue', 'green', 'red', 'darkblue', 'darkred', 'teal', 'purple', 'black'];
let gameOver = false;
let connectedBlankTiles = [];

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
    let totalSpaces = (width * height);

    for (let i = 1; i <= totalSpaces; i++) {
        let div = document.createElement('div');

        div.id = 'space' + i;
        div.classList.add('tile')

        let columnPosition = (i % width);
        if (columnPosition === 0) {
            columnPosition = width;
        }

        const rowPosition = Math.ceil(i / width);

        div.style.gridColumn = `${columnPosition} / ${columnPosition + 1}`;
        div.style.gridRow = `${rowPosition} / ${rowPosition + 1}`;

        field.appendChild(div)
    }

}

function resetGame() {

    gameOver = false;
    while (connectedBlankTiles.length !== 0) {
        connectedBlankTiles.pop();
    }

    let spaces = document.getElementsByClassName('tile');

    for (const space of spaces) {
        space.innerText = '';
        space.className = 'tile';
        space.style.color = 'black';
        space.classList.add('filled');
    }


    const mineAmount = Math.floor(totalSpaces / difficultyPercentage);

    let minePositions = [];

    for (let i = 0; i < mineAmount; i++) {

        let number = Math.floor((Math.random() * totalSpaces) + 1)

        while (minePositions.includes(number)) {
            number = Math.floor((Math.random() * totalSpaces) + 1)
        }

        minePositions.push(number);

    }

    for (const minePosition of minePositions) {

        let mine = document.getElementById('space' + minePosition);

        mine.classList.add('mine');

        let surroundingTiles = getSurroundingTiles(mine);

        for (const surroundingTile of surroundingTiles) {
            surroundingTile.insertAdjacentText('beforeend', 'I');
        }

    }

    for (const space of spaces) {
        if (space.classList.contains('mine')) {
            space.innerText = '⦿'
        } else if (space.innerText !== '') {
            space.style.color = colors[space.textContent.length - 1];
            space.innerText = space.textContent.length.toString();
        }
    }

}


function clickHandler(e) {

    if (gameOver) {
        resetGame()

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
                        surroundingFlags++
                    }
                }

                if (e.target.innerText.valueAsNumber === surroundingFlags) {
                    digSurrounding(e.target);
                }
            }
        }

    }

}

function rightClickHandler(e) {
    e.preventDefault();

    if (gameOver) {
        resetGame()

    } else if (e.target.classList.contains('filled')) {
        e.target.classList.toggle('flag');
    }
}

function dig(space) {

    if (!space.classList.contains('flag')) {

        if (space.classList.contains('mine')) {
            gameOver = true;
        }

        if (space.classList.contains('filled')) {
            space.classList.replace('filled', 'empty')
        }

    }
}

/**
 * @param {HTMLDivElement}space
 * @returns {HTMLDivElement[]}
 */
function getSurroundingTiles(space) {

    const spaceIdNumber = parseInt(space.id.replace(/[^0-9]/g, ''), 10);

    let surroundingTiles = [];

    let columnPosition = (spaceIdNumber % width);
    if (columnPosition === 0) {
        columnPosition = width;
    }

    const rowPosition = Math.ceil(spaceIdNumber / width);

    if (columnPosition !== 1) {
        surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber - 1))));

        if (rowPosition !== 1) {
            surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber - width - 1))));
        }

        if (rowPosition !== height) {
            surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber + width - 1))));
        }
    }

    if (columnPosition !== width) {
        surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber + 1))));

        if (rowPosition !== 1) {
            surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber - width + 1))));
        }

        if (rowPosition !== height) {
            surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber + width + 1))));
        }
    }

    if (rowPosition !== 1) {
        surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber - width))));
    }

    if (rowPosition !== height) {
        surroundingTiles.push(document.getElementById(('space' + (spaceIdNumber + width))));
    }

    return surroundingTiles;

}

function digSurrounding(space) {

    let surroundingTiles = getSurroundingTiles(space);

    surroundingTiles.filter(checkIfFilled);

    for (const surroundingTile of surroundingTiles) {
        dig(surroundingTile);
        if (!surroundingTile.innerText) {
            connectedBlankTiles.push(surroundingTile);
        }
    }

    if (connectedBlankTiles.length > 0 && !gameOver) {
        digSurrounding(connectedBlankTiles.shift());
    }

}

function checkIfFilled(value) {
    if (value.classList.contains('filled')) {
        return value;
    }
}