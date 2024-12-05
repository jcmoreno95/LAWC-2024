

  // Fetch de productos de la API
fetch('https://fakestoreapi.com/products')
.then(response => response.json())
.then(data => displayProducts(data))
.catch(error => console.error('Error fetching products:', error));


// Traigo productos
function displayProducts(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = ''; // Clear any existing content

  // loop y los inserto en el container con su HTML
  products.forEach(product => {
    const roundedPrice = product.price.toFixed(2);
    const titleWords = product.title.split(" ");
    const limitedTitle = titleWords.slice(0, 3).join(" ");
    const productCard = `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${product.image}" class="card-img-top" alt="${product.title}">
          <div class="card-body">
            <h5 class="card-title">${limitedTitle}</h5>
            <p class="card-text limited-description">${product.description}</p>
            <p class="card-text"><strong> $${roundedPrice}</strong></p>
            <a href="#" class="btn custom-detail" data-bs-toggle="modal" data-bs-target="#productModal" onclick="showProductDetails(${product.id})">Detalles</a>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += productCard;
  });
}

// Muestro productos en el modal de detalle
function showProductDetails(productId) {
  //busco los productos x productId
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then(response => response.json())
    .then(product => {
      // lleno el modal ocn los elementos
      document.getElementById('modal-product-image').src = product.image;
      document.getElementById('modal-product-title').innerText = product.title;
      document.getElementById('modal-product-category').innerText = `Category: ${product.category}`;
      document.getElementById('modal-product-description').innerText = product.description;
      document.getElementById('modal-product-price').innerText = `$${product.price}`;
      
      // funcion para añadirlo al carrito
      document.getElementById('add-to-cart-button').onclick = function() {
        addToCart(product);
        showAlert('Producto añadido al carrito!');
      
      };

      
    })
    .catch(error => console.error('Error fetching product details:', error));
}

function addToCart(product) {
  // Busco la data del local storage o lo inicio si esta vacio
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  
  //Lo agrego al carrito
  cart.push({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    quantity: 1 // Default quantity
  });
  
  // guardo el carrito actualizado
  sessionStorage.setItem('cart', JSON.stringify(cart));

  // Alerto que se añadio OK
  showAlert('Producto añadido al carrito!');
}

 //funcion de alerta 
function showAlert(message) {
  const alertBox = document.getElementById('alert-message');
  alertBox.textContent = message; // Set the message
  alertBox.style.display = 'block'; // Show the alert
  
  setTimeout(() => {
    alertBox.style.display = 'none'; // Hide the alert
  }, 1500);
}


function showCart() {
  const cartContainer = document.getElementById('cartItemsContainer');
  cartContainer.innerHTML = ''; // Clear previous content

  // Carrito con items del object storage
  const cart = JSON.parse(sessionStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>No hay productos en el carrito.</p>';
    
    // Muestro 0 si el total es 0
    const cartFooter = document.getElementById('cartFooter');
    cartFooter.innerHTML = `
      <div class="d-flex justify-content-between">
        <strong>Total:</strong>
        <span>$0.00</span>
      </div>
    `;
    return;
  }

  let total = 0;

  // muestro los productos del carrito
  cart.forEach((item, index) => {
    const titleWords = item.title.split(" ");
    const truncatedTitle = titleWords.length > 3
      ? titleWords.slice(0, 3).join(" ") + "..."
      : item.title;
      
      total += item.price * item.quantity;

    const cartItem = `
      <div class="cart-item d-flex justify-content-between align-items-center mb-3">
        <img src="${item.image}" alt="${item.title}" class="card-img-top-cart" style="width: 60px; height: auto;">
        <div>
          <p class="card-title-cart"><strong>${truncatedTitle}</strong></p>
          <p class="card-text-cart">Precio unidad: $${item.price}</p>
      
          <button class="btn btn-sm btn-red decrease-quantity" data-index="${index}">
            <span class="material-symbols-outlined">remove</span>
          </button>

          <!-- Display the quantity -->
          <span class="quantity-display mx-2">${item.quantity}</span>

          <button class="btn btn-sm btn-green increase-quantity" data-index="${index}">
            <span class="material-symbols-outlined">add</span>
          </button>

          <button class="btn btn-danger remove-cart-item" data-index="${index}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `;
    cartContainer.innerHTML += cartItem;
  });

  // event listener borrar
  document.querySelectorAll('.remove-cart-item').forEach(button => {
    button.addEventListener('click', function () {
      const itemIndex = this.getAttribute('data-index');
      removeCartItem(itemIndex);
    });
  });

  // event listener agrego 1
  document.querySelectorAll('.increase-quantity').forEach(button => {
    button.addEventListener('click', function () {
      const itemIndex = this.getAttribute('data-index');
      updateQuantity(itemIndex, 1); 
    });
  });

   // event listener resto 1
  document.querySelectorAll('.decrease-quantity').forEach(button => {
    button.addEventListener('click', function () {
      const itemIndex = this.getAttribute('data-index');
      updateQuantity(itemIndex, -1); 
    });
  });

    // Total en el footer
    const cartFooter = document.getElementById('cartFooter');
    cartFooter.innerHTML = `
      <div class="d-flex justify-content-between">
        <strong>Total:</strong>
        <span>$${total.toFixed(2)}</span>
      </div>
    `;
}

// Actualizo la cantidad en SesionStorage
function updateQuantity(index, change) {
  const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const item = cartItems[index];

  // no va a menos de 1 la cantidad
  item.quantity = Math.max(1, item.quantity + change);

  // guardo el carrito nuevo 
  sessionStorage.setItem('cart', JSON.stringify(cartItems));

  // se renderea de nuevo el carrito con los nuevos valores de los q
  showCart();
}

// elimino item del carrito
function removeCartItem(index) {
  const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  
  cartItems.splice(index, 1);

  // Update del session storage
  sessionStorage.setItem('cart', JSON.stringify(cartItems));

  // rerender el carrito
  showCart();
}


// event listener sumo al carrito
document.querySelector('.custom-cart-button').addEventListener('click', () => {
  showCart();
});


function clearCart() {
  sessionStorage.removeItem('cart'); // Remove the cart from sessionStorage
  showCart(); // Refresh the cart display
}

// event listener vacio carrito
document.getElementById('emptyCartButton').addEventListener('click', clearCart);


function handleBuyButtonClick() {
  // vacio carrito
  sessionStorage.removeItem('cart');

  // cierro carrito modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
  if (modal) {
    modal.hide();
    showAlertbuy("Tu compra fue exitosa!");
  }

  
}

// event listener boton de compra
document.getElementById('buyButton').addEventListener('click', handleBuyButtonClick);


function showAlertbuy(message) {
  const alertBox = document.getElementById('alert-message');
  alertBox.textContent = message; // Set the message
  alertBox.style.display = 'block'; // Show the alert

  setTimeout(() => {
    alertBox.style.display = 'none'; // Hide the alert
  }, 2000);
}