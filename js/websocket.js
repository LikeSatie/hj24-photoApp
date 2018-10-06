let websocket;

function wsConnect() {
  websocket = new WebSocket(
    "wss://neto-api.herokuapp.com/pic/" + window.imageID
  );
  websocket.onopen = function(event) {
    console.log("Соединение установлено");
    shareMode();
    formatError.classList.add("hidden");
    image.style.display = "block";
    imageUrlEl.value =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?id=" +
      imageID;
  };
  websocket.onclose = function(event) {
    alert("Соединение прервано");
    console.log(event);
  };
  websocket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    switch (data.event) {
      case "pic":
        localStorage.setItem("saveImg", data.pic.url);
        image.src = data.pic.url;
        image.onload = function() {
          if (data.pic.mask) {
            placeMask(data.pic.mask);
          }
          if (data.pic.comments) {
            commentsLoad(data.pic.comments);
          }
          setTimeout(function() {
            canvasImageDraw.width = picture.clientWidth;
            canvasImageDraw.height = picture.clientHeight;
            canvasMask.width = picture.clientWidth;
            canvasMask.height = picture.clientHeight;
          }, 2000);
        };
        break;
      case "comment":
        renderComment(data.comment);
        break;
      case "mask":
        placeMask(data.url);
        break;
    }
    console.log(data);
  };
  websocket.onerror = function(error) {
    document.getElementById("header").innerHTML = "";
    document.getElementById("content").innerHTML = "";
    document
      .getElementById("header")
      .appendChild(document.createTextNode("Ошибка"));
    document
      .getElementById("content")
      .appendChild(document.createTextNode(error.message));
    document.getElementById("modal").style.display = "block";
  };
}

function placeMask(url) {
  const mask = canvasMask;
  mask.width = pictureWrap.clientWidth;
  mask.height = pictureWrap.clientHeight;
  mask.style.width = "100%";
  mask.style.height = "100%";
  const context = mask.getContext("2d");
  context.clearRect(0, 0, mask.width, mask.height);
  let img = new Image();
  img.onload = function() {
    context.drawImage(img, 0, 0);
  };
  img.src = url;
}

function sendCanvas() {
  let canvas = canvasImageDraw;
  let imageData = canvas.toDataURL("image/png");
  let byteArray = convertDataURIToBinary(imageData);
  websocket.send(byteArray.buffer);
}

function convertDataURIToBinary(dataURI) {
  const marker = ";base64,";
  let markerIndex = dataURI.indexOf(marker) + marker.length;
  let base64 = dataURI.substring(markerIndex);
  let raw = window.atob(base64);
  let rawLength = raw.length;
  let byteArray = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    byteArray[i] = raw.charCodeAt(i);
  }

  return byteArray;
  ("use strict");

  function sendFile(file) {
    console.log(`Запущена функция sendFile()`);
    errorWrap.classList.add("hidden");
    const imageTypeRegExp = /^image\/jpg|jpeg|png/;
    if (imageTypeRegExp.test(file.type)) {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("title", file.name);
      formData.append("image", file);
      xhr.open("POST", "https://neto-api.herokuapp.com/pic/");
      xhr.addEventListener(
        "loadstart",
        () => (imgLoader.style.display = "block")
      );
      xhr.addEventListener("loadend", () => (imgLoader.style.display = "none"));
      xhr.addEventListener("error", () => {
        errorWrap.classList.remove("hidden");
        errorMessage.innerText = `Произошла ошибка! Повторите попытку позже... `;
      });
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          console.log(
            `Изображение опубликовано! Дата публикации: ${timeParser(
              result.timestamp
            )}`
          );
          if (connection) {
            connection.close(1000, "Работа закончена");
          }
          dataToStorage("id", result.id);
          dataToStorage("url", result.url);
          url.value = `${location.origin + location.pathname}?${
            sessionStorage.id
          }`;
          mask.src = "";
          mask.classList.add("hidden");
          loadImg(result.url)
            .then(() => canvasSize())
            .then(() => maskSize());
          menu.dataset.state = "default";
          clearForms();
          getWSConnect();
        } else {
          errorWrap.classList.remove("hidden");
          errorMessage.innerText = `Произошла ошибка ${xhr.status}! ${
            xhr.statusText
          }... Повторите попытку позже... `;
        }
      });
      xhr.send(formData);
    } else {
      errorWrap.classList.remove("hidden");
      errorMessage.innerText =
        "Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.";
    }
  }

  function getWSConnect() {
    connection = new WebSocket(
      `wss://neto-api.herokuapp.com/pic/${sessionStorage.id}`
    );
    console.log("TCL: getWSConnect -> sessionStorage", sessionStorage);
    connection.addEventListener("open", () =>
      console.log("Вебсокет-соединение открыто...")
    );
    connection.addEventListener("message", event =>
      sendMask(JSON.parse(event.data))
    );
    connection.addEventListener("close", event =>
      console.log("Вебсокет-соединение закрыто")
    );
    connection.addEventListener("error", error => {
      errorWrap.classList.remove("hidden");
      errorMessage.innerText = `WebSocket: произошла ошибка ! Повторите попытку позже... `;
    });
  }

  if (sessionStorage.id) {
    console.log("TCL: sessionStorage.id)", sessionStorage.id);
    console.log(
      `Перехожу по ссылке ${`\`${location.origin + location.pathname}?${
        sessionStorage.id
      }\``}`
    );
    getShareData(location.search.replace(/^\?/, ""));
  }

  if (location.search) {
    console.log(
      `Перехожу по ссылке ${`\`${location.origin + location.pathname}?${imgID ||
        sessionStorage.id}\``}`
    );
    getShareData(location.search.replace(/^\?/, ""));
  }

  function getShareData(id) {
    console.log("TCL: getShareData -> sessionStorage.id", id);
    console.log(`Запущена функция getShareData()`);
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `https://neto-api.herokuapp.com/pic/${sessionStorage.id || id}`
    );
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        loadShareData(JSON.parse(xhr.responseText));
      } else {
        errorWrap.classList.remove("hidden");
        errorMessage.innerText = `Произошла ошибка ${xhr.status}! ${
          xhr.statusText
        }... Повторите попытку позже... `;
      }
    });
    xhr.send();
  }

  function loadShareData(result) {
    console.log("TCL: loadShareData -> result", result);
    console.log(
      `loadShareData() : Изображение получено! Дата публикации: ${timeParser(
        result.timestamp
      )}`
    );

    toggleMenu(menu, comments);
    dataToStorage("id", result.id);
    dataToStorage("url", result.url);
    loadImg(result.url).then(() => canvasSize());

    url.value = `${location.href}`;
    if (result.comments) {
      createCommentsArray(result.comments);
    }
    if (result.mask) {
      mask.src = result.mask;
      mask.classList.remove("hidden");
      loadMask(result.mask)
        .then(() => loadImg(result.url))
        .then(() => maskSize());
    }
    if (document.getElementById("comments-off").checked) {
      const commentsForm = document.querySelectorAll(".comments__form");
      for (const comment of commentsForm) {
        comment.classList.add("hidden");
      }
    }
    getWSConnect();
    closeAllForms();
  }

  function sendNewComment(id, comment, target) {
    console.log("TCL: sendNewComment -> id", id);
    console.log("TCL: sendNewComment -> comment", comment);
    console.log(`Запущена функция sendNewComment()`);
    const xhr = new XMLHttpRequest();
    const body =
      "message=" +
      encodeURIComponent(comment.message) +
      "&left=" +
      comment.left +
      "&top=" +
      comment.top;
    xhr.open("POST", `https://neto-api.herokuapp.com/pic/${id}/comments`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.addEventListener("loadstart", () =>
      target.querySelector(".loader").classList.remove("hidden")
    );
    xhr.addEventListener("loadend", () =>
      target.querySelector(".loader").classList.add("hidden")
    );
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        console.log("Комментарий был отправвлен!");
        const result = JSON.parse(xhr.responseText);
        createCommentsArray(result.comments);
        needReload = false;
      } else {
        errorWrap.classList.remove("hidden");
        errorMessage.innerText = `Произошла ошибка ${xhr.status}! ${
          xhr.statusText
        }... Повторите попытку позже... `;
      }
    });
    xhr.send(body);
  }

  function sendMask(response) {
    console.log("TCL: sendMask -> response", response);
    console.log(`Запущена функция sendMask()`);
    if (!response) {
      if (isDraw) {
        canvas.toBlob(blob => {
          currentCanvasSize = blob.size;
          console.log("TCL: sendMask -> emptyCanvasSize", emptyCanvasSize);
          console.log("TCL: sendMask -> currentCanvasSize", currentCanvasSize);
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
      if (response.event === "mask") {
        console.log("Событие mask...");
        mask.classList.remove("hidden");
        clearCanvas();
        loadMask(response.url)
          .then(() => maskSize())
          .then(() => console.log("Mask loaded and resized!"));
      } else if (response.event === "comment") {
        console.log("Событие comment...");
        pullComments(response);
      } else {
        loadImg(response.pic.url).then(() => canvasSize());
      }
    }
  }

  function pullComments(result) {
    console.log(`Запущена функция pullComments()`);
    countComments = 0;
    const countCurrentComments =
      document.getElementsByClassName("comment").length -
      document.getElementsByClassName("comment load").length;
    needReload = countComments === countCurrentComments ? false : true;
    if (result) {
      createCommentForm([result.comment]);
    }
    if (document.getElementById("comments-off").checked) {
      const commentsForm = document.querySelectorAll(".comments__form");
      for (const comment of commentsForm) {
        comment.classList.add("hidden");
      }
    }
  }
}
