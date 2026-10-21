const links = [...document.querySelectorAll('.photo-link')];
const dialog = document.querySelector('#photo-dialog');
const image = document.querySelector('#photo-large');
const caption = document.querySelector('#photo-caption');
const count = document.querySelector('#photo-count');
let current = 0;
function show(index) {
  current = (index + links.length) % links.length;
  const link = links[current];
  image.src = link.href;
  image.alt = link.querySelector('img').alt;
  caption.textContent = link.dataset.caption;
  count.textContent = `Foto ${current + 1} van ${links.length}`;
}
links.forEach((link, index) => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
  event.preventDefault();
  show(index);
  dialog.showModal();
}));
document.querySelector('#photo-close').addEventListener('click', () => dialog.close());
document.querySelector('#photo-prev').addEventListener('click', () => show(current - 1));
document.querySelector('#photo-next').addEventListener('click', () => show(current + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
});
