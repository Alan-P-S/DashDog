import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy} from './enemies.js';
import { UI } from './UI.js';

const socket = io();

const spritesheet = 'player';
const player = document.getElementById(spritesheet);
console.log(player);

window.addEventListener('load', function(){
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.groundMargin = 40;
            this.speed = 0;
            this.maxSpeed = 3;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.enemies = [];
            this.particles = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.maxParticles = 50;
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.debug = false;
            this.score = 0;
            this.shadowColor = 'black';
            this.fontColor = 'yellow';
            this.time = 0;
            this.maxTime = 30000;
            this.gameOver = false;
            this.lives = 5;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        }
        update(deltaTime){
            this.time += deltaTime;
            if (this.time > this.maxTime) this.gameOver = true;
            this.background.update();
            this.player.update(this.input.keys, deltaTime);
            // handle enemies
            if (this.enemyTimer > this.enemyInterval){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach(enemy => enemy.update(deltaTime));
            // handle messages
            this.floatingMessages.forEach(message => {
                message.update();
            });
            // handle particles
            this.particles.forEach(particle => particle.update());
            if (this.particles.length > this.maxParticles){
                this.particles.length = this.maxParticles;
            }
            // handle collision sprites
            this.collisions.forEach(collision => collision.update(deltaTime));
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
        }
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(particle => {
                particle.draw(context);
            });
            this.collisions.forEach(collision => {
                collision.draw(context);
            });
            this.floatingMessages.forEach(message => {
                message.draw(context);
            });
            this.UI.draw(context);
        }
        addEnemy(){
            if (this.speed > 0 && Math.random() < 0.5){
                this.enemies.push(new GroundEnemy(this));
            } else if (this.speed > 0){
                this.enemies.push(new ClimbingEnemy(this));
            }
            this.enemies.push(new FlyingEnemy(this));
        }
        sendScoreToServer() {
            socket.emit('scoreUpdate',this.score);  
        }
        ScoreToServer() {
            fetch('/submit-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score: this.score }),
            })
            .then((response) => response.json())
            .then((data) => {
                console.log('Score successfully sent to the server:', data);
            })
            .catch((error) => {
                console.error('Error sending score to the server:', error);
            });
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        game.sendScoreToServer();
        if(game.gameOver){
            game.ScoreToServer();
        } 
        if (!game.gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});