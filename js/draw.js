'use strict';

image.addEventListener('load', () => {
  createCanvas();
  formContainer.style.width = `${image.offsetWidth}px`;
  formContainer.style.height = `${image.offsetHeight}px`;
});
drawer.addEventListener('click', clickModeDraw);
colorButtons.addEventListener('click', colorSelect);

function colorSelect(event) {
  if (event.target.name === 'color') {
    const currentColor = document.querySelector('.menu__color[checked]');
    currentColor.removeAttribute('checked');
    event.target.setAttribute('checked', '');
  }
}

function getColor() {
  const currentColor = document.querySelector('.menu__color[checked]').value;
  return color[currentColor];
}

function clickModeDraw() {
  menu.dataset.state = 'selected';
  drawer.dataset.state = 'selected';
  drawMode();
}

function createCanvas() {
  const width = getComputedStyle(
    wrap.querySelector('.current-image')
  ).width.slice(0, -2);
  const height = getComputedStyle(
    wrap.querySelector('.current-image')
  ).height.slice(0, -2);
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  canvas.style.display = 'block';
  canvas.style.zIndex = '1';

  wrap.appendChild(canvas);

  curves = [];
  drawing = false;
  needsRepaint = false;
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
