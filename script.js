const productDialog = document.querySelector('#dialogo-producto');
const cartDialog = document.querySelector('#dialogo-carrito');
const cartLink = document.querySelector('#abrir-carrito');
const cartList = document.querySelector('#lista-carrito');
const cartCount = document.querySelector('#contador-carrito');
const cartNotice = document.querySelector('#aviso-almacenamiento');
const productImage = document.querySelector('#imagen-producto-ampliada');
const productTitle = document.querySelector('#nombre-producto');
const productMessage = document.querySelector('#mensaje-producto');
const addToCartButton = document.querySelector('#agregar-al-carrito');
const cartStorageKey = 'lira-accesorios-carrito';
let cart = {};
let selectedProduct = null;
let storageWarning = '';

try {
  const savedCart = localStorage.getItem(cartStorageKey);
  if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    if (parsedCart && typeof parsedCart === 'object' && !Array.isArray(parsedCart)) {
      cart = Object.fromEntries(
        Object.entries(parsedCart).filter(([, item]) =>
          item &&
          typeof item.name === 'string' &&
          typeof item.image === 'string' &&
          Number.isSafeInteger(item.quantity) &&
          item.quantity > 0
        )
      );
    } else {
      storageWarning = 'No se pudo leer el carrito guardado. Se iniciará uno nuevo.';
    }
  }
} catch {
  storageWarning = 'El navegador no permite recuperar el carrito guardado; los cambios durarán mientras esta página esté abierta.';
}

function saveCart() {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    storageWarning = '';
  } catch {
    storageWarning = 'El navegador no permite guardar el carrito; los cambios durarán mientras esta página esté abierta.';
  }
}

function renderCart() {
  const totalItems = Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartNotice.textContent = storageWarning;
  cartList.replaceChildren();

  const entries = Object.entries(cart);
  if (entries.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'carrito-vacio';
    emptyMessage.textContent = 'Tu carrito está vacío.';
    cartList.append(emptyMessage);
    return;
  }

  entries.forEach(([productId, item]) => {
    const row = document.createElement('article');
    row.className = 'producto-en-carrito';

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name;

    const details = document.createElement('div');
    const name = document.createElement('h3');
    name.textContent = item.name;

    const controls = document.createElement('div');
    controls.className = 'controles-cantidad';

    const decreaseButton = document.createElement('button');
    decreaseButton.type = 'button';
    decreaseButton.dataset.accion = 'disminuir';
    decreaseButton.dataset.producto = productId;
    decreaseButton.setAttribute('aria-label', `Quitar una unidad de ${item.name}`);
    decreaseButton.textContent = '−';

    const quantity = document.createElement('span');
    quantity.textContent = item.quantity;
    quantity.setAttribute('aria-label', 'Cantidad');

    const increaseButton = document.createElement('button');
    increaseButton.type = 'button';
    increaseButton.dataset.accion = 'aumentar';
    increaseButton.dataset.producto = productId;
    increaseButton.setAttribute('aria-label', `Agregar una unidad de ${item.name}`);
    increaseButton.textContent = '+';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'quitar-producto';
    removeButton.dataset.accion = 'eliminar';
    removeButton.dataset.producto = productId;
    removeButton.setAttribute('aria-label', `Eliminar ${item.name} del carrito`);
    removeButton.textContent = '×';

    controls.append(decreaseButton, quantity, increaseButton, removeButton);
    details.append(name, controls);
    row.append(image, details);
    cartList.append(row);
  });
}

function openProductDetails(card) {
  const image = card.querySelector('img');
  const name = card.querySelector('h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, h14, h15');
  if (!image || !name) return;

  selectedProduct = {
    id: image.getAttribute('src'),
    image: image.getAttribute('src'),
    name: name.textContent.trim()
  };
  productImage.src = selectedProduct.image;
  productImage.alt = selectedProduct.name;
  productTitle.textContent = selectedProduct.name;
  productMessage.textContent = '';
  productDialog.showModal();
}

document.querySelectorAll('.productos > [class^="producto"]').forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.addEventListener('click', () => openProductDetails(card));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProductDetails(card);
    }
  });
});

addToCartButton.addEventListener('click', () => {
  if (!selectedProduct) return;

  const item = cart[selectedProduct.id];
  if (item) {
    item.quantity += 1;
  } else {
    cart[selectedProduct.id] = { ...selectedProduct, quantity: 1 };
  }

  saveCart();
  renderCart();
  productMessage.textContent = `${selectedProduct.name} se agregó al carrito.`;
});

cartLink.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('.menu-navegacion')?.removeAttribute('open');
  renderCart();
  cartDialog.showModal();
});

cartList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-accion]');
  if (!button) return;

  const item = cart[button.dataset.producto];
  if (!item) return;

  if (button.dataset.accion === 'aumentar') {
    item.quantity += 1;
  } else if (button.dataset.accion === 'disminuir') {
    item.quantity -= 1;
    if (item.quantity <= 0) delete cart[button.dataset.producto];
  } else if (button.dataset.accion === 'eliminar') {
    delete cart[button.dataset.producto];
  }

  saveCart();
  renderCart();
});

[
  [productDialog, productDialog.querySelector('.cerrar-dialogo')],
  [cartDialog, cartDialog.querySelector('.cerrar-dialogo')]
].forEach(([dialog, closeButton]) => {
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

renderCart();

const accountDialog = document.querySelector('#dialogo-cuenta');
const openLoginLink = document.querySelector('#abrir-inicio-sesion');
const closeDialogButton = accountDialog?.querySelector('.cerrar-dialogo');
const accountViews = accountDialog?.querySelectorAll('[data-vista-cuenta]');

function showAccountView(viewName) {
  if (!accountViews) return;

  accountViews.forEach((view) => {
    view.hidden = view.dataset.vistaCuenta !== viewName;
    const heading = view.querySelector('h2');
    if (view.hidden) {
      heading.removeAttribute('id');
    } else {
      heading.id = 'titulo-cuenta';
      view.querySelector('.mensaje-cuenta').textContent = '';
    }
  });

  const activeView = accountDialog.querySelector(`[data-vista-cuenta="${viewName}"]`);
  activeView?.querySelector('input')?.focus();
}

openLoginLink?.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('.menu-navegacion')?.removeAttribute('open');
  showAccountView('inicio');
  accountDialog?.showModal();
});

closeDialogButton?.addEventListener('click', () => accountDialog.close());

accountDialog?.querySelectorAll('[data-mostrar-vista]').forEach((button) => {
  button.addEventListener('click', () => showAccountView(button.dataset.mostrarVista));
});

accountDialog?.querySelectorAll('[data-formulario-cuenta]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const messages = {
      inicio: 'El inicio de sesión todavía no está conectado.',
      registro: 'El registro de cuentas todavía no está conectado.',
      recuperacion: 'La recuperación de contraseña todavía no está configurada.'
    };
    const message = form.querySelector('.mensaje-cuenta');
    message.textContent = messages[form.dataset.formularioCuenta];
  });
});
