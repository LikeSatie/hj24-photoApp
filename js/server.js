'use strict';

function clearForms() {
  const forms = document.querySelectorAll('.comments__form');
  for (const form of forms) {
    //document.querySelector('.app').removeChild(form);
    formContainer.removeChild(form);
  }
}

function onOpen() {
  menu.dataset.state = 'initial';
  image.src = '';
  clearForms();
}

if (href.indexOf('?id=') == -1) {
  mask.classList.add('hidden');
  onOpen();
}

function clearCommentForms() {
  const forms = document.querySelectorAll('.comments__form');
  for (const form of forms) {
    formContainer.removeChild(form);
  }
}

function showError(files) {
  if (files[0].type !== 'image/png' && files[0].type !== 'image/jpeg') {
    errorMessage.textContent =
      'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';
    error.classList.remove('hidden');
    onOpen();
  } else {
    error.classList.add('hidden');
    return true;
  }
}

function sendFile(file) {
  error.classList.add('hidden');
  const imageTypeRegExp = /^image\/jpg|jpeg|png/;
  if (imageTypeRegExp.test(file.type)) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('title', file.name);
    formData.append('image', file);
    xhr.open('POST', 'https://neto-api.herokuapp.com/pic/');
    xhr.addEventListener('loadstart', () => (imgLoad.style.display = 'block'));
    xhr.addEventListener('loadend', () => (imgLoad.style.display = 'none'));
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        if (connection) {
          connection.close(1000, 'Работа закончена');
        }
        const result = JSON.parse(xhr.responseText);
        image.src = result.url;
        mask.classList.add('hidden');
        mask.src = '';
        imageId = result.id;
        url.value =
          `${location.origin + location.pathname}?${imageId}` + '&share';
        menu.dataset.state = 'selected';
        share.dataset.state = 'selected';
        clearCommentForms();
        webSocket();
        if (!location.search) {
          location.search = `?${imageId}`;
        }
      } else {
        error.classList.remove('hidden');
        errorMessage.innerText = `Произошла ошибка ${xhr.status}! ${
          xhr.statusText
        }... Повторите попытку позже... `;
      }
    });
    xhr.send(formData);
  } else {
    error.classList.remove('hidden');
    errorMessage.innerText =
      'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';
  }
}

function webSocket() {
  connection = new WebSocket(`wss://neto-api.herokuapp.com/pic/${imageId}`);
  connection.addEventListener('message', event => {
    console.log(JSON.parse(event.data));
    if (JSON.parse(event.data).event === 'pic') {
      if (JSON.parse(event.data).pic.mask) {
        canvas.style.background = `url(${JSON.parse(event.data).pic.mask})`;
      } else {
        canvas.style.background = ``;
      }
    }

    if (JSON.parse(event.data).event === 'comment') {
      pullComments(JSON.parse(event.data).comment);
    }

    if (JSON.parse(event.data).event === 'mask') {
      canvas.style.background = `url(${JSON.parse(event.data).url})`;
    }
  });
}

function sendMask(response) {
  //    console.log('TCL: sendMask -> response', response);
  //    console.log(`Запущена функция sendMask()`);
  if (!response) {
    if (isDraw) {
      canvas.toBlob(blob => {
        currentCanvasSize = blob.size;
        //                console.log('TCL: sendMask -> emptyCanvasSize', emptyCanvasSize);
        //                console.log('TCL: sendMask -> currentCanvasSize', currentCanvasSize);
        if (currentCanvasSize !== emptyCanvasSize) {
          connection.send(blob);
        }
      });
      isDraw = false;
    } else {
      if (img.naturalHeight !== 0) {
        canvas.toBlob(blob => (emptyCanvasSize = blob.size));
      }
    }
  } else {
    if (response.event === 'mask') {
      //            console.log('Событие mask...');
      mask.classList.remove('hidden');
      clearCanvas();
      loadMask(response.url)
        .then(() => maskSize())
        .then(() => console.log('Mask loaded and resized!'));
    } else if (response.event === 'comment') {
      //            console.log('Событие comment...');
      pullComments(response);
    } else {
      loadImg(response.pic.url).then(() => canvasSize());
    }
  }
}

function pullComments(result) {
  //    console.log(`Запущена функция pullComments()`);
  countComments = 0;
  const countCurrentComments =
    document.getElementsByClassName('comment').length -
    document.getElementsByClassName('comment load').length;
  needReload = countComments === countCurrentComments ? false : true;
  if (result) {
    createCommentForm([result.comment]);
  }
  if (document.getElementById('comments-off').checked) {
    const commentsForm = document.querySelectorAll('.comments__form');
    for (const comment of commentsForm) {
      comment.classList.add('hidden');
    }
  }
}
