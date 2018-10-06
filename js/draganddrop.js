"use strict";

document.body.addEventListener("dragover", event => event.preventDefault());
document.body.addEventListener("drop", onFilesDrop);
document.addEventListener("mousemove", dragStart, false);
let movedPiece = null;

document.addEventListener("mouseup", () => {
  if (movedPiece) {
    movedPiece = null;
  }
});

function dragStart(event) {
  if (movedPiece) {
    event.preventDefault();
    const cords = {
      x: event.pageX - shiftMenu.x,
      y: event.pageY - shiftMenu.y
    };
    const maxX = pageDimension.width - movedPiece.offsetWidth - 1;
    const maxY = pageDimension.height - movedPiece.offsetHeight - 1;
    cords.x = Math.min(cords.x, maxX);
    cords.y = Math.min(cords.y, maxY);
    cords.x = Math.max(cords.x, 0);
    cords.y = Math.max(cords.y, 0);
    movedPiece.style.left = `${cords.x}px`;
    movedPiece.style.top = `${cords.y}px`;
  }
}

function onFilesDrop(event) {
  console.log(`Файл выбран. Функция onFilesDrop()`);
  event.preventDefault();
  if (!img.getAttribute("src")) {
    const files = event.dataTransfer.files;
    sendFile(files[0]);
  } else {
    errorWrap.classList.remove("hidden");
    errorMessage.innerText =
      'Чтобы загрузить изображение, воспользуйтесь пунктом "Загрузить новое" в меню.';
  }
}
