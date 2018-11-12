let href = window.location.href;

// Drag

const wrap = document.querySelector('.wrap');
const dragable = document.querySelectorAll('.drag');
const shiftMenu = { x: 0, y: 0 };
const menuItems = document.querySelectorAll('.menu__item');

let movedPiece = null;
let bounds;
let maxX;
let maxY;
let minX = wrap.offsetLeft;
let minY = wrap.offsetTop;

// UI

const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');
const modes = document.querySelectorAll('.mode');
const comments = document.querySelector('.comments');
const commentsForm = document.querySelectorAll('.comments__form');
const commentsOn = document.getElementById('comments-on');
const commentsOff = document.getElementById('comments-off');

// Server

const error = document.querySelector('.error');
const imgLoad = document.querySelector('.image-loader');
const image = document.querySelector('.current-image');
const errorMessage = document.querySelector('.error__message');
const url = document.querySelector('.menu__url');
const share = document.querySelector('.share');
const copy = document.querySelector('.menu_copy');

let connection;
let imageId;
