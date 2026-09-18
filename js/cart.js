const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartFinalTotal = document.getElementById("cartFinalTotal");
const orderButton = document.getElementById("orderButton");

function showCart() {
    const cart = getCart();

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Корзина пуста</h2>
                <p>Добавьте товары из каталога.</p>
                <a href="catalog.html" class="button">
                    Перейти в каталог
                </a>
            </div>
        `;

        cartTotal.textContent = "0 ₸";
        cartFinalTotal.textContent = "0 ₸";

        return;
    }

    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        const product = products.find(
            product => product.id === item.id
        );

        const itemTotal = product.price * item.quantity;

        total += itemTotal;

        return `
            <div class="cart-item">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <p>${product.brand}</p>

                    <div class="quantity">
                        <button onclick="changeQuantity(${product.id}, -1)">
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button onclick="changeQuantity(${product.id}, 1)">
                            +
                        </button>
                    </div>
                </div>

                <div class="cart-item-price">
                    <strong>${formatPrice(itemTotal)}</strong>

                    <button
                        class="remove-button"
                        onclick="removeItem(${product.id})"
                    >
                        Удалить
                    </button>
                </div>

            </div>
        `;
    }).join("");

    cartTotal.textContent = formatPrice(total);
    cartFinalTotal.textContent = formatPrice(total);
}

function changeQuantity(id, change) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {
        removeItem(id);
        return;
    }

    saveCart(cart);
    updateCartCount();
    showCart();
}

function removeItem(id) {
    let cart = getCart();

    cart = cart.filter(item => item.id !== id);

    saveCart(cart);
    updateCartCount();
    showCart();
}

orderButton.addEventListener("click", () => {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Корзина пуста");
        return;
    }

    alert("Заказ оформлен!");

    saveCart([]);
    updateCartCount();
    showCart();
});

showCart();