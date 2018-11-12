'use strict';

image.addEventListener('load', () => {
  createCanvas();
  formContainer.style.width = `${image.offsetWidth}px`;
  formContainer.style.height = `${image.offsetHeight}px`;
});
drawer.addEventListener('click', clickModeDraw);
colorButtons.addEventListener('click', colorSelect);

colorButtons.addEventListener('click', event => {
  if (event.target.name === 'color') {
    const currentColor = document.querySelector('.menu__color[checked]');
    currentColor.removeAttribute('checked');
    event.target.setAttribute('checked', '');
  }
});

function clearCanvas() {
  // console.log(`Запущена функция clearCanvas()`);
  curves = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  needsRepaint = true;
}

function getColor() {
  const currentColor = document.querySelector('.menu__color:checked');
  return color[currentColor.value];
}

function smoothCurveBetween(p1, p2) {
  const cp = p1.map((coord, idx) => (coord + p2[idx]) / 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = getColor();
  ctx.quadraticCurveTo(...p1, ...cp);
}

function smoothCurve(points) {
  ctx.beginPath();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length - 1; i++) {
    smoothCurveBetween(points[i], points[i + 1]);
  }
  ctx.stroke();
}

canvas.addEventListener('mousedown', event => {
  if (draw.dataset.state === 'selected') {
    const curve = [];
    drawing = true;
    curve.push([event.offsetX, event.offsetY]);
    curves.push(curve);
    needsRepaint = true;
  }
});

canvas.addEventListener('mouseup', () => {
  curves = [];
  drawing = false;
});

canvas.addEventListener('mouseleave', () => {
  curves = [];
  drawing = false;
});

canvas.addEventListener('mousemove', event => {
  if (drawing) {
    const point = [event.offsetX, event.offsetY];
    curves[curves.length - 1].push(point);
    needsRepaint = true;
  }
});

function repaint() {
  curves.forEach(curve => smoothCurve(curve));
}

function tick() {
  if (needsRepaint) {
    repaint();
    needsRepaint = false;
  }
  window.requestAnimationFrame(tick);
}

tick();
