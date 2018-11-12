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

if (location.search) {
  //    console.log(`Перехожу по ссылке ${`\`${location.origin + location.pathname}?${imgID || sessionStorage.id}\``}`);
  getShareData(location.search.replace(/^\?/, ''));
}

function getShareData(id) {
  //    console.log("TCL: getShareData -> sessionStorage.id", id);
  //   console.log(`Запущена функция getShareData()`);
  const xhr = new XMLHttpRequest();
  xhr.open(
    'GET',
    `https://neto-api.herokuapp.com/pic/${sessionStorage.id || id}`
  );
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      loadShareData(JSON.parse(xhr.responseText));
    } else {
      errorWrap.classList.remove('hidden');
      errorMessage.innerText = `Произошла ошибка ${xhr.status}! ${
        xhr.statusText
      }... Повторите попытку позже... `;
    }
  });
  xhr.send();
}

function loadShareData(result) {
  //    console.log('TCL: loadShareData -> result', result);
  //    console.log(`loadShareData() : Изображение получено! Дата публикации: ${timeParser(result.timestamp)}`);

  toggleMenu(menu, comments);
  dataToStorage('id', result.id);
  dataToStorage('url', result.url);
  loadImg(result.url).then(() => canvasSize());

  url.value = `${location.href}`;
  if (result.comments) {
    createCommentsArray(result.comments);
  }
  if (result.mask) {
    mask.src = result.mask;
    mask.classList.remove('hidden');
    loadMask(result.mask)
      .then(() => loadImg(result.url))
      .then(() => maskSize());
  }
  if (document.getElementById('comments-off').checked) {
    const commentsForm = document.querySelectorAll('.comments__form');
    for (const comment of commentsForm) {
      comment.classList.add('hidden');
    }
  }
  getWSConnect();
  closeAllForms();
}

function sendNewComment(id, comment, target) {
  //    console.log('TCL: sendNewComment -> id', id);
  //    console.log('TCL: sendNewComment -> comment', comment);
  //    console.log(`Запущена функция sendNewComment()`);
  const xhr = new XMLHttpRequest();
  const body =
    'message=' +
    encodeURIComponent(comment.message) +
    '&left=' +
    comment.left +
    '&top=' +
    comment.top;
  xhr.open('POST', `https://neto-api.herokuapp.com/pic/${id}/comments`, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.addEventListener('loadstart', () =>
    target.querySelector('.loader').classList.remove('hidden')
  );
  xhr.addEventListener('loadend', () =>
    target.querySelector('.loader').classList.add('hidden')
  );
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      //            console.log('Комментарий был отправвлен!');
      const result = JSON.parse(xhr.responseText);
      createCommentsArray(result.comments);
      needReload = false;
    } else {
      errorWrap.classList.remove('hidden');
      errorMessage.innerText = `Произошла ошибка ${xhr.status}! ${
        xhr.statusText
      }... Повторите попытку позже... `;
    }
  });
  xhr.send(body);
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
