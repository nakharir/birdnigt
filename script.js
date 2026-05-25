let move_speed = 3,
  gravity = 0.5;

let bird = document.querySelector(".bird");
let img = document.getElementById("bird-1");

// FIX: typo "shound" -> "sound"
let sound_point = new Audio("sound/point.mp3");
let sound_die = new Audio("sound/die.mp3");

let bird_props = bird.getBoundingClientRect();
let background = document.querySelector(".background").getBoundingClientRect();

let score_val = document.querySelector(".score_val");
let message = document.querySelector(".message");
let score_title = document.querySelector(".score_title");

let game_state = "Start";
img.style.display = "none";
message.classList.add("messageStyle");

// FIX: pindahkan bird_dy ke luar play() agar bisa direset
let bird_dy = 0;

// FIX: tambah kontrol touch & klik untuk mobile/mouse
function flap() {
  if (game_state === "Play") {
    img.src = "img/star3.png";
    bird_dy = -7.6;
    setTimeout(() => {
      if (game_state === "Play") img.src = "img/star2.png";
    }, 150);
  }
}

// FIX: daftarkan event listener jump SEKALI di luar play()
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === " ") {
    e.preventDefault();
    flap();
  }
  if (e.key === "Enter" && game_state !== "Play") {
    startGame();
  }
});

// FIX: kontrol tap/klik untuk mobile
document.addEventListener("click", () => {
  if (game_state === "Play") {
    flap();
  } else {
    startGame();
  }
});

document.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    if (game_state === "Play") {
      flap();
    } else {
      startGame();
    }
  },
  { passive: false },
);

function startGame() {
  document.querySelectorAll(".pipe_sprite").forEach((el) => el.remove());
  img.style.display = "block";
  bird.style.top = "40vh";
  bird_dy = 0;
  game_state = "Play";
  message.innerHTML = "";
  score_title.innerHTML = "Score : ";
  score_val.innerHTML = "0";
  message.classList.remove("messageStyle");
  play();
}

function play() {
  // --- GERAK PIPA ---
  function move() {
    if (game_state !== "Play") return;

    let pipes = document.querySelectorAll(".pipe_sprite");
    pipes.forEach((element) => {
      let pipe_props = element.getBoundingClientRect();
      bird_props = bird.getBoundingClientRect();

      if (pipe_props.right <= 0) {
        element.remove();
      } else {
        // Cek tabrakan
        if (
          bird_props.left < pipe_props.right &&
          bird_props.right > pipe_props.left &&
          bird_props.top < pipe_props.bottom &&
          bird_props.bottom > pipe_props.top
        ) {
          game_state = "End";
          // FIX: tampilkan Game Over tanpa reload
          message.innerHTML =
            '<span style="color:red">Game Over</span><br><span style="font-size:0.6em">Enter / Tap to Restart</span>';
          message.classList.add("messageStyle");
          img.style.display = "none";
          sound_die.play();
          return;
        } else {
          // Tambah skor saat burung melewati pipa
          if (
            pipe_props.right < bird_props.left &&
            pipe_props.right + move_speed >= bird_props.left &&
            element.increase_score === "1"
          ) {
            score_val.innerHTML = +score_val.innerHTML + 1;
            sound_point.play();
          }
          element.style.left = pipe_props.left - move_speed + "px";
        }
      }
    });
    requestAnimationFrame(move);
  }
  requestAnimationFrame(move);

  // --- GRAVITASI ---
  function apply_gravity() {
    if (game_state !== "Play") return;

    bird_dy += gravity;

    // FIX: game over saat menyentuh batas, tidak reload
    if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
      game_state = "End";
      message.innerHTML =
        '<span style="color:red">Game Over</span><br><span style="font-size:0.6em">Enter / Tap to Restart</span>';
      message.classList.add("messageStyle");
      img.style.display = "none";
      sound_die.play();
      return;
    }

    bird.style.top = bird_props.top + bird_dy + "px";
    bird_props = bird.getBoundingClientRect();
    requestAnimationFrame(apply_gravity);
  }
  requestAnimationFrame(apply_gravity);

  // --- BUAT PIPA ---
  let pipe_separation = 0;
  // FIX: pipe_gap diperbesar agar lebih mudah dilewati
  let pipe_gap = 42;

  function create_pipe() {
    if (game_state !== "Play") return;

    if (pipe_separation > 115) {
      pipe_separation = 0;

      let pipe_pos = Math.floor(Math.random() * 35) + 10;

      // Pipa atas
      let pipe_top = document.createElement("div");
      pipe_top.className = "pipe_sprite";
      pipe_top.style.top = pipe_pos - 70 + "vh";
      pipe_top.style.left = "100vw";
      document.body.appendChild(pipe_top);

      // Pipa bawah (yang menghitung skor)
      let pipe_bottom = document.createElement("div");
      pipe_bottom.className = "pipe_sprite";
      pipe_bottom.style.top = pipe_pos + pipe_gap + "vh";
      pipe_bottom.style.left = "100vw";
      pipe_bottom.increase_score = "1";
      document.body.appendChild(pipe_bottom);
    }
    pipe_separation++;
    requestAnimationFrame(create_pipe);
  }
  requestAnimationFrame(create_pipe);
}
