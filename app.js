function formatPrice(price) {
    return price.toLocaleString("ru-RU") + " ₸";
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
    }
}

function addToCart(id) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);

    if (item) {
        item.quantity++;
    } else {
        cart.push({
            id: id,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();

    alert("Товар добавлен в корзину");
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <a href="product.html?id=${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
            </a>

            <div class="product-info">
                <span class="product-category">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <p class="product-brand">
                    ${product.brand}
                </p>

                <div class="product-bottom">
                    <strong>${formatPrice(product.price)}</strong>

                    <button
                        class="small-button"
                        onclick="addToCart(${product.id})"
                    >
                        В корзину
                    </button>
                </div>

                <p class="availability">
                    ${product.available ? "В наличии" : "Нет в наличии"}
                </p>
            </div>
        </div>
    `;
}

function showPopularProducts() {
    const container = document.getElementById("popularProducts");

    if (!container) {
        return;
    }

    container.innerHTML = products
        .slice(0, 4)
        .map(createProductCard)
        .join("");
}

updateCartCount();
showPopularProducts();