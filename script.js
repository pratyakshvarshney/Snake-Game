const board = document.querySelector(".board");
const blockHeight = 50;
const blockWidth = 50;
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;

highScoreElement.innerText = highScore;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);
let intervalId = null;
let timerInterval = null;

// board.style.gridTemplateColumns = `repeat(${cols}, ${blockWidth}px)`;
// board.style.gridTemplateRows = `repeat(${rows}, ${blockHeight}px)`;

const blocks = [];
let snake = [
    {
        x: 1, y: 3,
    }, 
]

let direction = "right";

for(let row=0; row<rows; row++){
    for(let col=0; col<cols; col++){
        const block = document.createElement("div");
        block.classList.add("block");
        board.appendChild(block);
        blocks[`${row}-${col}`] = block;
    }
}

function spawnFood() {
    let newFood;
    do {
        newFood = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
    } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
}

let food = spawnFood();
blocks[`${food.x}-${food.y}`].classList.add("food");

function render(){
    let head = null;

    if(direction === "left") {
        head = {
            x: snake[0].x, y: snake[0].y - 1
        }
    } else if(direction === "right") {
        head = {
            x: snake[0].x, y: snake[0].y + 1
        }
    } else if(direction === "down") {
        head = {
            x: snake[0].x + 1, y: snake[0].y 
        }
    } else if(direction === "up") {
        head = {
            x: snake[0].x - 1, y: snake[0].y
        }
    } 

    if(head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalId);
        clearInterval(timerInterval);
        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex";
        return;
    }

    if(snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        clearInterval(intervalId);
        clearInterval(timerInterval);
        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex";
        return;
    }

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    });

    snake.unshift(head);

    if(head.x === food.x && head.y === food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = spawnFood();
        blocks[`${food.x}-${food.y}`].classList.add("food");

        score += 10;
        scoreElement.innerText = score;

        if(score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore.toString());
            highScoreElement.innerText = highScore;
        }
    } else {
        snake.pop();
    }

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    });
}

startButton.addEventListener("click", () => {
    modal.style.display = "none";
    intervalId = setInterval( () => {
        render();
    }, 300);
    timerInterval = setInterval( () => {
        let [min, sec] = time.split("-").map(Number);
        if(sec == 59){
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }

        time = `${min}-${sec}`;
        timeElement.innerText = time;
    }, 1000)
});

restartButton.addEventListener("click", restartGame);

function restartGame() {
    clearInterval(intervalId);
    clearInterval(timerInterval);

    blocks[`${food.x}-${food.y}`].classList.remove("food");
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
    });
    direction = "right";
    score = 0;
    time = `00-00`;
    scoreElement.innerText = score;
    timeElement.innerText = time;

    modal.style.display = "none";
    snake = [{x: 1, y: 3}];
    food = spawnFood();
    blocks[`${food.x}-${food.y}`].classList.add("food");

    intervalId = setInterval( () => {
        render();
    }, 200);
    timerInterval = setInterval( () => {
        let [min, sec] = time.split("-").map(Number);
        if(sec == 59){
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }

        time = `${min}-${sec}`;
        timeElement.innerText = time;
    }, 1000)
}

const opposite = { up: "down", down: "up", left: "right", right: "left" };
const keyToDirection = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
};

window.addEventListener("keydown", (event) => {
    const newDirection = keyToDirection[event.key];
    if(newDirection && newDirection !== opposite[direction]) {
        direction = newDirection;
    }
})

//For Touch-Screen
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

window.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) return;

    let newDirection;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        newDirection = diffX > 0 ? "right" : "left";
    } else {
        newDirection = diffY > 0 ? "down" : "up";
    }

    if (newDirection !== opposite[direction]) {
        direction = newDirection;
    }
});

//to prevent swiping of web on mobile
board.addEventListener("touchmove", (event) => {
    event.preventDefault();
}, { passive: false });