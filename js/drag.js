'use strict';

document.body.addEventListener('dragover', event => event.preventDefault());
document.body.addEventListener('drop', filesDrop);
document.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', moveAt);
document.addEventListener('mouseup', dragStop);

function dragStart(event) {
  if (event.target.classList.contains('drag')) {
    movedPiece = event.target.parentNode;
    bounds = event.target.parentNode.getBoundingClientRect();

    shiftMenu.x = event.pageX - bounds.left - window.pageXOffset;
    shiftMenu.y = event.pageY - bounds.top - window.pageYOffset;

    maxX = wrap.offsetLeft + wrap.offsetWidth - menu.offsetWidth - 1;
    maxY = wrap.offsetTop + wrap.offsetHeight - menu.offsetHeight;
    checkMenuPosition();
  }
}

function moveAt(event) {
  if (!movedPiece) {
    return;
  }
  event.preventDefault();

  const cords = { x: event.pageX - shiftMenu.x, y: event.pageY - shiftMenu.y };
  cords.x = Math.min(cords.x, maxX);
  cords.y = Math.min(cords.y, maxY);
  cords.x = Math.max(cords.x, wrap.offsetLeft);
  cords.y = Math.max(cords.y, wrap.offsetTop);

  movedPiece.style.left = `${cords.x}px`;
  movedPiece.style.top = `${cords.y}px`;
  checkMenuPosition();
}

function onFilesDrop(event) {
  // console.log(`Файл выбран. Функция onFilesDrop()`);
  event.preventDefault();
  if (!img.getAttribute('src')) {
    const files = event.dataTransfer.files;
    sendFile(files[0]);
  } else {
    errorWrap.classList.remove('hidden');
    errorMessage.innerText =
      'Чтобы загрузить новое изображение, пожалуйста воспользуйтесь пунктом "Загрузить новое" в меню.';
  }
}
