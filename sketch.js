const SCREEN_WIDTH = 850;               // wysokość okna gry
const SCREEN_LENGTH = 850;              // szerokość okna gry

const FIELD_OFFSET_X = 25;              // przesuniecie pola w osi X
const FIELD_OFFSET_Y = 25;              // przesuniecie pola w osi Y

const WIDTH = SCREEN_WIDTH * 6 / 8 - FIELD_OFFSET_Y;   // szerokość pola gry
const LENGTH = SCREEN_LENGTH - 2 * FIELD_OFFSET_X;    // długość pola gry

const WALL_SIZE = WIDTH / 50;

const GOAL_SIZE = WIDTH / 3;           // szerokość bramki
const BALL_SIZE = WIDTH / 8;            // wielkość piłki
const HAMMER_SIZE = WIDTH / 6;          // wielkość bijaka 

const BALL_COLOR = "#cc9900";            // kolor piłki
const HAMMER_COLOR = "#663300";           // kolor bijaka

const TIME_EPSILON = 0.00001;


class Ball {
  constructor() {
    this.x = random(5 + BALL_SIZE / 2, LENGTH - BALL_SIZE / 2 - 5);
    this.y = random(5 + BALL_SIZE / 2, WIDTH - BALL_SIZE / 2 - 5);
    this.r = BALL_SIZE / 2;
    this.vx = random(-25, 25);
    this.vy = random(-25, 25);
  }

  draw() {
    noStroke();
    fill(BALL_COLOR);
    circle(this.x, this.y, 2 * this.r);
  }

  move(t) {
    this.x += t * this.vx;
    this.y += t * this.vy;
  }

  xt(t) {
    return this.x + t * this.vx;
  }

  yt(t) {
    return this.y + t * this.vy;
  }
}

class Wall {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw() {
    strokeWeight(WALL_SIZE);
    stroke(255);
    line(this.x1, this.y1, this.x2, this.y2);
  }

  findCollisionTime(ball) {
    const A = this.x2 - this.x1;
    const B = this.y2 - this.y1;
    const E = ball.x - this.x1;
    const F = ball.y - this.y1;
    const R = ball.r + WALL_SIZE / 2;

    const den = A * ball.vy - B * ball.vx;
    if (den == 0.0)
      return Infinity;

    const t = (R * sqrt(A * A + B * B) + B * E - A * F) / den;
    if (t < TIME_EPSILON)
      return Infinity;

    const u = (A * (ball.xt(t) - this.x1) + B * (ball.yt(t) - this.y1)) / (A * A + B * B);
    if ((u < 0.0) || (u > 1.0))
      return Infinity;

    return t - TIME_EPSILON;
  }

  handleCollision(ball) {
    const ax = -(this.y2 - this.y1);
    const ay = this.x2 - this.x1;
    const a = sqrt(ax * ax + ay * ay);

    const ex = ax / a;
    const ey = ay / a;

    const ue = ball.vx * ex + ball.vy * ey;
    const uz = - ball.vx * ey + ball.vy * ex;

    const ve = - ue;
    const vz = uz;

    const vx = ex * ve - ey * vz;
    const vy = ex * vz + ey * ve;

    ball.vx = vx;
    ball.vy = vy;
  }
}

let ball;
let obstacles = new Array();

function setup() {
  createCanvas(SCREEN_LENGTH, SCREEN_WIDTH);
  ball = new Ball();

  obstacles.push(new Wall(0, WIDTH, 0, 0));
  obstacles.push(new Wall(0, 0, LENGTH, 0));
  obstacles.push(new Wall(LENGTH, 0, LENGTH, WIDTH));
  obstacles.push(new Wall(LENGTH, WIDTH, 0, WIDTH));
}

function doMove() {
  let time = 1.0;
  while (time > 0.0) {
    let idx = -1;
    let tmin = time;

    // sprawdzenie czy nastąpi odbicie
    for (var i = 0; i < obstacles.length; i++) {
      const t = obstacles[i].findCollisionTime(ball);
      if (t < tmin) {
        tmin = t;
        idx = i;
      }
    }

    // hammer.move(tmin);
    ball.move(tmin);
    if (idx != -1)
      obstacles[idx].handleCollision(ball);
      
    time -= tmin;
  }
}

function draw() {
  // odwrócenie układu współrzędnych (punkt (0,0) jest teraz w lewym, dolnym rogu)
  scale(1, -1);
  translate(FIELD_OFFSET_X, FIELD_OFFSET_Y - height);

  background(0);

  //rysowanie planszy
  fill(0, 0, 255);
  rect(0, 0, LENGTH, WIDTH);
  for (var i = 0; i < obstacles.length; i++)
    obstacles[i].draw();

  doMove();
  ball.draw();
}