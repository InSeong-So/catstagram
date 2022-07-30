import '../assets/scss/index.scss';
import { $, toggleLoading, debounce } from './helper/index.js';

(() => {
  localStorage.setItem('cat_bookmark', JSON.stringify([]));
})();

const getCatImage = async () => {
  const response = await fetch('https://api.thecatapi.com/v1/images/search?size=full');
  const data = await response.json();
  return data[0];
}

const createPin = async () => {
  toggleLoading();
  const { id, url } = await getCatImage();
  const pin = document.createElement('div');
  const buttonWrapper = document.createElement('div');
  const image = document.createElement('img');
  const random = Math.floor(Math.random() * 123) + 1;
  image.src = url;
  buttonWrapper.setAttribute('class', 'button-wrapper');
  buttonWrapper.innerHTML = /* html */`
  <div class="anim-icon anim-icon-md heart">
    <input type="checkbox" id="cat-${id}" src="${url}" />
    <label for="cat-${id}" key=${random}></label>
  </div>
  `;
  pin.classList.add('pin');
  pin.appendChild(buttonWrapper);
  pin.appendChild(image);
  toggleLoading();
  return pin;
};

const loadMore = debounce(async () => {
  const container = $('.container');
  const pinList = [];
  for (let i = 10; i > 0; i--) {
    pinList.push(await createPin());
  }
  container.append(...pinList);
}, 500);

loadMore();

const $container = $('.container');

$container.addEventListener('scroll', () => {
  const loader = $('.loader');
  if (loader === null) return;
  if ($container.scrollTop + $container.clientHeight >= $container.scrollHeight) loadMore();
});

$('nav').addEventListener('click', async event => {
  event.stopPropagation();
  if (!event.target.matches('input')) return;

  const $main = $('main');
  $main.innerHTML = '';

  if (event.target.matches('#explore')) {
    $main.classList.remove('saved');
    $main.innerHTML = /* html */`
      <div class="container"></div>
      <div class="loader"></div>
    `;

    loadMore();
  }

  if (event.target.matches('#saved')) {
    $main.classList.add('saved');
    const $content = /* html */`
    <div class="container">
    ${result.map(({ _id, url }, index) => /* html */`
      <div class="pin">
        <div class="button-wrapper">
          <div class="anim-icon anim-icon-md heart">
            <input type="checkbox" id="cat-${index}" checked>
            <label for="cat-${index}" key=${_id}></label>
          </div>
        </div><img src="https://randomfox.ca/images/${url}.jpg">
      </div>`).join('')}
    </div>
    `;

    $main.innerHTML = $content;
  }
});

$('main').addEventListener('click', async ({ target }) => {
  if (!target.matches('label[for^="cat-"]')) return;

  const $targetElement = target.control;

  const isSaved = !$targetElement.checked;
  const id = $targetElement.getAttribute('id');
  const src = $targetElement.getAttribute('src');

  if (!isSaved) {
    const bookmark = JSON.parse(localStorage.getItem('cat_bookmark'));
    bookmark.push({ id, src });
  }

  console.log(`북마크${isSaved ? '에 저장' : '에서 삭제'}되었습니다.`);
});