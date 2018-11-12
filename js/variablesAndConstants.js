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
