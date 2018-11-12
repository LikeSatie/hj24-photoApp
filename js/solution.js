'use strict';

burger.addEventListener('click', () => {
  menu.dataset.state = 'default';
  modes.forEach(elem => (elem.dataset.state = ''));
  error.classList.add('hidden');
  canvas.removeEventListener('mousedown', canvasMouseDown);
  canvas.removeEventListener('mouseup', sendMask);
  canvas.removeEventListener('mousemove', draw);
  canvas.classList.add('hidden');
  checkMenuPosition();
  formContainer.style.zIndex = '';
});

modes.forEach(elem => {
  if (!elem.classList.contains('new')) {
    elem.addEventListener('click', event => {
      menu.dataset.state = 'selected';
      event.currentTarget.dataset.state = 'selected';
      error.classList.add('hidden');
      checkMenuPosition();
    });
  }
});

commentsOn.addEventListener('change', commentsToogle);
commentsOff.addEventListener('change', commentsToogle);

function commentsToogle() {
  if (commentsOn.checked) {
    document.querySelectorAll('.comments__form').forEach(form => {
      form.style.display = '';
    });
  } else {
    document.querySelectorAll('.comments__form').forEach(form => {
      form.style.display = 'none';
    });
  }
}
