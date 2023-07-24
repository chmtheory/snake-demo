import Phaser from 'phaser'
import { Direction } from './Direction'

export default class SnakeScene extends Phaser.Scene {

    static BodySegment = class BodySegment {
        constructor(x, y, image, direction) {
            this.x = x;
            this.y = y;
            this.image = image;
            this.direction = direction;
        }
    }

    static MAX_SPEED = 95;

    constructor() {
        super('snake');

        // Can be adjusted (sorta).
        this.grid_length = 12;
        this.sprite_size = 64;
        this.cell_size = 36;

        // eslint-disable-next-line
        this.grid = [...Array(this.grid_length)].map(unused => Array(this.grid_length).fill(false));
        this.direction = Direction.RIGHT;
        this.input_direction = Direction.RIGHT;

        let snake_starting_x = 2;
        let snake_starting_y = 2;

        this.snake_pos = {
            x: snake_starting_x,
            y: snake_starting_y
        }

        this.apple_pos = {
            x: this.grid_length - 2,
            y: this.grid_length - 2
        }

        this.speed = SnakeScene.MAX_SPEED;
        this.body = [];
        this.gameOngoing = true;
        this.gameOver = false;

        this.keyMap = {
            87: Direction.UP,
            65: Direction.LEFT,
            83: Direction.DOWN,
            68: Direction.RIGHT
        }
    }

    preload() {
        this.load.spritesheet('snake', 'sprites/snake-graphics.png', {frameWidth: this.sprite_size, frameHeight: this.sprite_size})
        this.load.audio('oof', 'sounds/oof.mp3')
        this.load.audio('ding', 'sounds/ding.mp3')
    }

    translateCoordinates(x, y) {
        return [(x + 0.5) * this.cell_size, (y + 0.5) * this.cell_size];
    }

    calculateScale() {
        return this.cell_size / this.sprite_size;
    }

    create() {
        this.add.grid(this.cell_size * this.grid_length / 2, this.cell_size * this.grid_length / 2, 
            this.cell_size * this.grid_length, this.cell_size * this.grid_length,
            this.cell_size, this.cell_size, 0xacd1af, 1, 0xffffff, 1);

        this.placeNewApple();

        // Place snake on board.
        let head_calc = this.translateCoordinates(this.snake_pos.x, this.snake_pos.y);
        this.snake_head = this.add.image(head_calc[0], head_calc[1], 'snake', 4);
        this.snake_head.setScale(this.cell_size / this.sprite_size);

        let body_calc = this.translateCoordinates(this.snake_pos.x - 1, this.snake_pos.y);
        let snake_body = this.add.image(body_calc[0], body_calc[1], 'snake', 1);
        snake_body.setScale(this.calculateScale());

        let tail_calc = this.translateCoordinates(0, this.snake_pos.y)
        let tail = this.add.image(tail_calc[0], tail_calc[1], 'snake', 14);
        tail.setScale(this.calculateScale());

        for (let x = 0; x < this.snake_pos.x; x++) {
            this.grid[x][this.snake_pos.y] = true;
        }

        this.body.push(new SnakeScene.BodySegment(0, this.snake_pos.y, tail, Direction.RIGHT));
        this.body.push(new SnakeScene.BodySegment(this.snake_pos.x - 1, this.snake_pos.y, snake_body, Direction.RIGHT));
        
        this.input.keyboard.on("keydown", this.handleInput, this);
    }

    handleInput(key) {
        if (this.gameOver) {
            return;
        }

        if (!this.gameOngoing) {
            return;
        }

        const mapped_direction = this.keyMap[key.keyCode]
        if (!Direction.areOpposite(this.direction, mapped_direction)) {
            this.input_direction = mapped_direction;
        }
    }

    addSegment(x, y) {
        const calc = this.translateCoordinates(x, y);
        const segment = new SnakeScene.BodySegment(x, y, null, this.direction);

        if (this.body[this.body.length - 1].direction == this.input_direction) {
            segment.image = this.add.image(calc[0], calc[1], 'snake', 1);

            if (segment.direction == Direction.UP || segment.direction == Direction.DOWN) {
                segment.image.setAngle(90);
            }
        } else {
            segment.image = this.add.image(calc[0], calc[1], 'snake', 2);
            segment.image.setAngle(Direction.angle(this.body[this.body.length - 1].direction, this.input_direction));
        }
        segment.image.setScale(this.calculateScale());
        this.grid[x][y] = true;
        this.body.push(segment);
    }

    placeNewApple() {
        if (this.apple != null) {
            this.apple.destroy();

            const unoccupied_spaces = [];
            for (let x = 0; x < this.grid_length; x++) {
                for (let y = 0; y < this.grid_length; y++) {
                    if (!this.grid[x][y] && (x != this.snake_pos.x || y != this.snake_pos.y)) {
                        unoccupied_spaces.push({x : x, y: y});
                    }

                }
            }

            let spot = unoccupied_spaces[Math.floor(Math.random() * unoccupied_spaces.length)];
            this.apple_pos.x = spot.x;
            this.apple_pos.y = spot.y;
        }
        let apple_calc = this.translateCoordinates(this.apple_pos.x, this.apple_pos.y);
        this.apple = this.add.image(apple_calc[0], apple_calc[1], 'snake', 15);
        this.apple.setScale(this.calculateScale());
    }

    update(time, delta) {
        if (!this.gameOngoing || this.gameOver) {
            return;
        }

        this.speed -= delta;
        if (this.speed <= 0) {
            this.speed = SnakeScene.MAX_SPEED + this.speed;
        } else {
            return;
        }

        this.direction = this.input_direction;


        let old_x = this.snake_pos.x;
        let old_y = this.snake_pos.y;


        this.snake_pos.x += Direction.xShift(this.input_direction);
        this.snake_pos.y += Direction.yShift(this.input_direction);

        this.gameOver = this.snake_pos.x < 0 || this.snake_pos.x >= this.grid_length ||
            this.snake_pos.y < 0 || this.snake_pos.y >= this.grid_length || this.grid[this.snake_pos.x][this.snake_pos.y];

        if (this.gameOver) {
            this.sound.play('oof');
            return;
        }

        this.addSegment(old_x, old_y);

        if (this.snake_pos.x != this.apple_pos.x || this.snake_pos.y != this.apple_pos.y) {
            this.updateTail();
        } else {
            this.placeNewApple();
        }
        
        this.moveHead();
    }

    updateTail() {
        const segment = this.body.shift();
        segment.image.destroy();
        this.grid[segment.x][segment.y] = false;

        const new_tail = this.body[0];
        new_tail.image.destroy();

        const tail_calc = this.translateCoordinates(new_tail.x, new_tail.y);
        new_tail.image = this.add.image(tail_calc[0], tail_calc[1], 'snake', 14);
        new_tail.image.setScale(this.calculateScale());

        if (new_tail.direction == Direction.UP) {
            new_tail.image.setAngle(270);
        } else if (new_tail.direction == Direction.DOWN) {
            new_tail.image.setAngle(90);
        } else if (new_tail.direction == Direction.LEFT) {
            new_tail.image.setAngle(180);
        }
    }

    moveHead() {
        let head_calc = this.translateCoordinates(this.snake_pos.x, this.snake_pos.y);
        this.snake_head.setPosition(head_calc[0], head_calc[1]);

        if (this.direction == Direction.UP) {
            this.snake_head.setAngle(270);
        } else if (this.direction == Direction.DOWN) {
            this.snake_head.setAngle(90);
        } else if (this.direction == Direction.LEFT) {
            this.snake_head.setAngle(180);
        } else if (this.direction == Direction.RIGHT) {
            this.snake_head.setAngle(0);
        }
    }

}