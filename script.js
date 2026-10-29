const h1 = document.querySelector('h1');

if (h1) {
  h1.addEventListener('click', () => {
    h1.textContent = 'De Vania Hernandez';
  });
}

const productCards = document.querySelectorAll('[class^="producto"]');

productCards.forEach((card) => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    if (!img) return;

    const src = img.getAttribute('src') || '';
    const productName = src
      .split('/').pop()
      .replace(/\.[^/.]+$/, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const url = `detalle.html?producto=${encodeURIComponent(productName)}`;
    window.open(url, '_blank');
  });
});
