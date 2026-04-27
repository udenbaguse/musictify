const PLAY_ICON = ">";
const PAUSE_ICON = "||";
const CLERK_PUB_KEY =
  "pk_test_aW1wcm92ZWQtZG92ZS05MC5jbGVyay5hY2NvdW50cy5kZXYk";

const songs = [
  {
    id: 1,
    name: "Cielo - Huma Huma",
    file: "1.mp3",
    cover: "1.jpg",
    duration: "4:28",
  },
  {
    id: 2,
    name: "DEAF KEV - Invincible",
    file: "2.mp3",
    cover: "2.jpg",
    duration: "3:48",
  },
  {
    id: 3,
    name: "Different Heaven & EH!DE",
    file: "3.mp3",
    cover: "3.jpg",
    duration: "6:25",
  },
  {
    id: 4,
    name: "Janji - Heroes Tonight",
    file: "4.mp3",
    cover: "4.jpg",
    duration: "5:12",
  },
  {
    id: 5,
    name: "Rabba - Salman",
    file: "5.mp3",
    cover: "5.jpg",
    duration: "3:50",
  },
  {
    id: 6,
    name: "Sakhiyaan - Maninder",
    file: "6.mp3",
    cover: "6.jpg",
    duration: "3:31",
  },
  {
    id: 7,
    name: "Bhula Dena - Mustafa",
    file: "7.mp3",
    cover: "7.jpg",
    duration: "4:00",
  },
  {
    id: 8,
    name: "Tumhari Kasam",
    file: "8.mp3",
    cover: "8.jpg",
    duration: "5:02",
  },
  {
    id: 9,
    name: "Na Jaana - Renz",
    file: "9.mp3",
    cover: "9.jpg",
    duration: "4:36",
  },
  {
    id: 10,
    name: "Sahiba - Intense",
    file: "10.mp3",
    cover: "10.jpg",
    duration: "4:26",
  },
];

let currentSongIndex = 0;
let shuffleMode = false;
let repeatMode = false;
let previousVol = 80;
let clerkLoaded = false;
let clerkInstance = null;

const audio = new Audio();
audio.volume = 0.8;
