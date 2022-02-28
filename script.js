const gameRules = {
    started: false,
    currentScore: 0,
    bestScore: localStorage.getItem('best-score') || 0,
    direction: 'right',
    speed: 100,
}

const currentScore = document.querySelector('.current-score span'),
      bestScore = document.querySelector('.best-score span'),
      snake = document.querySelector('.snake'),
      game = document.querySelector('.game'),
      startBtn = document.querySelector('.start-button'),
      modalWindow = document.querySelector('.modal-window'),
      modalBtn = modalWindow.querySelector('.accept');

modalBtn.addEventListener('click', closeModal);

bestScore.innerHTML = gameRules.bestScore;
currentScore.innerHTML = 0;
    
game.style.width = '500px'
game.style.height = '500px'

snake.style.width = '20px';
snake.style.height = '20px';
snake.style.zIndex = '10';
snake.style.top = '240px';
snake.style.left = '240px';

let tails = [];
let tailsCoords = [{top: snake.style.top, left: snake.style.left}];
let startGameStamp;
let createAppleStamp;

startBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        startGame()
    }
    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (gameRules.direction === 'down') return;
        gameRules.direction = 'up';
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        if (gameRules.direction === 'up') return;
        gameRules.direction = 'down';
    } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        if (gameRules.direction === 'right') return;
        gameRules.direction = 'left';
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        if (gameRules.direction === 'left') return;
        gameRules.direction = 'right';
    }
})

function startGame() {
    if (gameRules.started) return;
    
    clearGameField();

    gameRules.started = true;

    startGameStamp = setInterval(move, gameRules.speed);
    createAppleStamp = setInterval(createApple, 3000);
}

function clearGameField() {
    gameRules.currentScore = 0;
    currentScore.innerHTML = gameRules.currentScore;
    snake.style.top = '240px';
    snake.style.left = '240px';
    tails = [];
    tailsCoords = [{top: snake.style.top, left: snake.style.left}];
    game.querySelectorAll('.tail').forEach(tail => {tail.remove()});
    game.querySelectorAll('.apple').forEach(apple => {apple.remove()});
    closeModal();
}

function move() {
    switch(gameRules.direction) {
        case 'up':
            snake.style.top = getSnakePosition('up');
            break;
        case 'down':
            snake.style.top = getSnakePosition('down');
            break;
        case 'left':
            snake.style.left = getSnakePosition('left');
            break;
        case 'right':
            snake.style.left = getSnakePosition('right');
            break;
    }

    tailsCoords.unshift({top: snake.style.top, left: snake.style.left});
    tailsCoords = tailsCoords.slice(0, tailsCoords.length - 1);

    moveTails();

    if (checkForGameOver()) {
        clearInterval(startGameStamp);
        clearInterval(createAppleStamp);
        gameRules.started = false;
        showModal();
    }
}

function moveTails() {
    if (tails.length === 0) return;

    tails.forEach((tail, index) => {
        tail.style.top = tailsCoords[index + 1].top;
        tail.style.left = tailsCoords[index + 1].left;
    })
}

function getSnakePosition(direction) {
    if (direction === 'up') {
        return snake.style.top === '0px' ? `${parseInt(game.style.width) - 20}px` : `${parseInt(snake.style.top) - 20}px`;
    } else if (direction === 'down') {
        return snake.style.top === '480px' ? '0px' : `${parseInt(snake.style.top) + 20}px`;
    } else if (direction === 'left') {
        return snake.style.left === '0px' ? `${parseInt(game.style.height) - 20}px` : `${parseInt(snake.style.left) - 20}px`;
    } else if (direction === 'right') {
        return snake.style.left === '480px' ? '0px' : `${parseInt(snake.style.left) + 20}px`;
    }
}

function createApple() {
    const apple = document.createElement('div');
    const coords = getRandomPosition();

    apple.classList.add('apple');
    apple.style.width = '20px';
    apple.style.height = '20px';
    apple.style.backgroundColor = '#cb2d6f';
    apple.style.position = 'absolute';
    apple.style.top = coords.y * 20 + 'px';
    apple.style.left = coords.x * 20 + 'px';

    game.append(apple);
    let id = setInterval(() => {
        if (checkForAppleEat(apple)) {
            createTail({top: apple.style.top, left: apple.style.left})
            apple.remove();
            clearInterval(id);
        }
    }, gameRules.speed)
}

function createTail(coords) {
    const tail = document.createElement('div');

    tail.style.width = '20px';
    tail.style.height = '20px';
    tail.style.position = 'absolute';
    tail.style.backgroundColor = '#5cdb95';
    tail.style.zIndex = '9';
    tail.classList.add('tail');
    tail.style.backgroundColor = '#85dcb';
    tail.style.top = coords.top;
    tail.style.left = coords.left;

    game.append(tail);
    tails.push(tail);
    tailsCoords.unshift({top: snake.style.top, left: snake.style.left})
}

function getRandomPosition() {
    const max = (parseInt(game.style.width) - 20) / parseInt(snake.style.width);
    const min = 0;
    const x = Math.round(Math.random() * (max - min) + min);
    const y = Math.round(Math.random() * (max - min) + min);
    return {x, y}
}

function checkForAppleEat(target) {
    if (snake.style.top === target.style.top && snake.style.left === target.style.left) {
        gameRules.currentScore++;
        currentScore.innerHTML = gameRules.currentScore;

        if (gameRules.currentScore > gameRules.bestScore) {
            gameRules.bestScore = gameRules.currentScore;
            localStorage.setItem('best-score', gameRules.bestScore);
        }

        return true;
    }
    return false
}

function checkForGameOver() {
    return tailsCoords
    .map((tail, index) => {
        if (index === 0) return false;
        if (tailsCoords[0].top === tail.top && tailsCoords[0].left === tail.left) {
            return true;
        }
        return false;
    })
    .some(tail => tail === true)
}

function showModal() {
    modalWindow.style.display = 'flex';

    document.addEventListener('click', e => {
        if (e.target === modalWindow) return;
    })
}

function closeModal() {
    modalWindow.style.display = 'none';
}