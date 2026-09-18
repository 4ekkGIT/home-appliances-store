const productContainer = document.getElementById("productDetails");

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

const product = products.find(item => item.id === productId);

if (!product) {
    productContainer.innerHTML = `
        <div class="empty-message">
            Товар не найден
        </div>
    `;
} else {
    productContainer.innerHTML = `
        <div class="product-main-image">
            <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="product-main-info">

            <span class="product-category">
                ${product.category}
            </span>

            <h1>${product.name}</h1>

            <p class="product-brand">
                Производитель: ${product.brand}
            </p>

            <p class="product-description">
                ${product.description}
            </p>

            <h2 class="product-main-price">
                ${formatPrice(product.price)}
            </h2>

            <p class="availability">
                ${product.available ? "В наличии" : "Нет в наличии"}
            </p>

            <button
                class="button"
                onclick="addToCart(${product.id})"
            >
                Добавить в корзину
            </button>

            <div class="characteristics">
                <h2>Характеристики</h2>

                ${product.characteristics.map(item => `
                    <div class="characteristic">
                        <span>${item[0]}</span>
                        <strong>${item[1]}</strong>
                    </div>
                `).join("")}
            </div>

        </div>
    `;
}