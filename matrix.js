const canvas = document.getElementById('canvas');
// Get the device pixel ratio, falling back to 1.
const dpr = window.devicePixelRatio || 1;
// Get the size of the canvas in CSS pixels.
let rect = canvas.getBoundingClientRect();
// Give the canvas pixel dimensions of their CSS
// size * the device pixel ratio.
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
const window_width = window.innerWidth;
const window_height = window.innerHeight;
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);
let font_size = 10;
let font_type = 'serif';;
ctx.font = font_size.toString() + 'px ' + font_type;
let characters = [];
let create_index = 0;
let process_index = 0;
const max_characters = 100;
const characters_batch_create = 3;
const character_speed = 30;
const character_color = 'rgba(0, 255, 0, 255)';
const create_delay = 1;
const process_delay = 3;
const character_set = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

function gen_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

class Character {
    constructor(x, y, char, color_str, speed) {
        this.x = x;
        this.y = y;
        this.character = char
        this.color_str = color_str;
        this.speed = speed;
    }
    draw(ctx) {
        ctx.fillStyle = this.color_str;
        ctx.textAlign = 'center';
        ctx.fillText(this.character, font_size + this.x, font_size + this.y);
        this.y += this.speed;
    }
}

function update() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, window_width, window_height);
    if (create_index > create_delay) {
        for (let i = 0; i < characters_batch_create; ++i) {
            if (characters.length < max_characters) {
                let char = character_set[gen_int(0, character_set.length)].toUpperCase();
                characters.push(new Character(gen_int(0, window_width), 0, char, character_color, character_speed));
            }
        }
        create_index = 0;
    }
    if (process_index > process_delay) {
        let remove_index = 0;
        for (let i = 0; i < characters.length - remove_index; ++i) {
            if (characters[i].y < window_height) {
                characters[i].draw(ctx);
            } else {
                characters.splice(i - remove_index, 1);
                ++remove_index;
            }
        }
        process_index = 0;
    }
    ++create_index;
    ++process_index;
    // current charactes num
    //console.log(characters.length);
    requestAnimationFrame(update);
}

requestAnimationFrame(update);