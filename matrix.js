// setup high dpi canvas
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let canvas_client_rect = canvas.getBoundingClientRect();
let font_size = 10;
let font_type = "serif";
setup_canvas();
addEventListener("resize", setup_canvas, false);
// variables
let characters = [];
let offscreen_characters = [];
let create_index = 0;
let process_index = 0;
let max_characters = 50;
const max_characters_spawn_batch = 5;
const character_trail_size = 15;
const character_speed = 30;
const character_color = "rgba(0, 255, 0, 1)";
const character_set = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

// setup high dpi canvas
function setup_canvas() {
  // resize canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Get the device pixel ratio, falling back to 1.
  let dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  canvas_client_rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = canvas_client_rect.width * dpr;
  canvas.height = canvas_client_rect.height * dpr;
  ctx = canvas.getContext("2d");
  ctx.font = font_size.toString() + "px " + font_type;
  // more reliable than ctx.scale
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// random int generation
function gen_int(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // [min, max)
  return Math.floor(Math.random() * (max - min) + min);
}

class Character {
  constructor(x, y, color_str, speed) {
    this.x = x;
    this.y = y;
    this.character =
      character_set[gen_int(0, character_set.length)].toUpperCase();
    this.color_str = color_str;
    this.speed = speed;
    this.trail_size = character_trail_size;
    this.trail = [];
    // if "head" is offscreen
    this.status_offscreen = false;
  }
  // random char each tick
  regen_character() {
    this.character =
      character_set[gen_int(0, character_set.length)].toUpperCase();
  }
  move() {
    if (this.trail.length >= this.trail_size) this.trail.shift();
    this.trail.push(this.create_copy());
    this.y += this.speed;
  }
  draw(ctx) {
    if (!this.status_offscreen) {
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.textAlign = "center";
      ctx.fillText(this.character, this.x, this.y);
    }
    let alpha = 1;
    const alpha_step = 1 / this.trail_size;
    // reduce starting alpha if character is offscreen
    alpha -=
      this.status_offscreen *
      alpha_step *
      (this.trail_size - this.trail.length);
    for (let i = this.trail.length - 1; i > -1; --i) {
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
      ctx.fillText(this.trail[i].character, this.trail[i].x, this.trail[i].y);
      alpha -= alpha_step;
    }
  }
  update() {
    // remove trail if char is offscreen
    if (!this.status_offscreen) {
      this.move();
      this.regen_character();
    } else {
      this.trail.shift();
    }
  }
  create_copy() {
    let new_char = new Character(this.x, this.y, this.color_str, this.speed);
    return new_char;
  }
}

function process_chars() {
  // spawn chars
  if (characters.length < max_characters) {
    const spawn_batch = gen_int(
      0,
      Math.min(
        max_characters_spawn_batch,
        max_characters - characters.length + 1
      )
    );
    for (let i = 0; i < spawn_batch; ++i) {
      let char = character_set[gen_int(0, character_set.length)].toUpperCase();
      characters.push(
        new Character(
          gen_int(0, canvas_client_rect.width),
          0,
          character_color,
          character_speed
        )
      );
    }
  }

  // remove offscreen chars
  while (
    offscreen_characters[0] !== undefined &&
    offscreen_characters[0].trail.length == 0
  ) {
    offscreen_characters.shift();
  }

  // remove onscreen chars
  while (
    characters[0] !== undefined &&
    characters[0].y >= canvas_client_rect.height
  ) {
    characters[0].status_offscreen = true;
    offscreen_characters.push(characters.shift());
  }

  // update + draw onscreen chars
  for (let i = 0; i < characters.length; ++i) {
    characters[i].update();
    characters[i].draw(ctx);
  }

  // update + draw offscreen chars
  for (let i = 0; i < offscreen_characters.length; ++i) {
    offscreen_characters[i].update();
    offscreen_characters[i].draw(ctx);
  }

  tick = 0;
}

// main update loop
function update() {
  window.requestAnimationFrame(update);

  time_now = window.performance.now();
  const time_dur = time_now - time_prev;

  // limit fps
  if (time_dur < time_per_frame) return;

  if (tick > process_rate) {
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas_client_rect.width, canvas_client_rect.height);
    process_chars();
  }

  const time_excess = time_dur % time_per_frame;
  time_prev = time_now - time_excess;

  ++tick;
  //debug
  ++frames;
}

// debug stats
function debug_info() {
  console.log(
    `[DEBUG]:\n\tLOOP:\n\t\tFPS: ${frames}\n\tCANVAS:\n\t\tN_CHARACTERS: ${
      characters.length + offscreen_characters.length
    }\n\t\tN_ONSCREEN_CHARACTERS: ${
      characters.length
    }\n\t\tN_OFFSCREEN_CHARACTERS: ${
      offscreen_characters.length
    }\n\t\tN_CANVAS_SIZE: ${canvas.width} ${
      canvas.height
    }\n\t\tCANVAS_CLIENT_RECT: ${canvas_client_rect.width} ${
      canvas_client_rect.height
    }`
  );
  frames = 0;
}

// runtime variables
let tick = 0;
const process_rate = 4;

const fps = 60;
const time_per_frame = 1000 / fps;
let time_prev = window.performance.now();
let time_now = undefined;

window.requestAnimationFrame(update);

// debug
let frames = 0;
//setInterval(debug_info, 1000);
