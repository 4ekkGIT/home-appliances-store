const catalogContainer = document.getElementById("catalogProducts");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

const urlParams = new URLSearchParams(window.location.search);
const categoryFromUrl = urlParams.get("category");

if (categoryFromUrl) {
    categorySelect.value = categoryFromUrl;
}

function showCatalog() {
    let result = [...products];

    const search = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;

    if (search) {
        result = result.filter(product =>
            product.name.toLowerCase().includes(search)
        );
    }

    if (category !== "all") {
        result = result.filter(product =>
            product.category === category
        );
    }

    if (sort === "cheap") {
        result.sort((a, b) => a.price - b.price);
    }

    if (sort === "expensive") {
        result.sort((a, b) => b.price - a.price);
    }

    if (result.length === 0) {
        catalogContainer.innerHTML = `
            <p class="empty-message">
                Товары не найдены
            </p>
        `;
        return;
    }

    catalogContainer.innerHTML = result
        .map(createProductCard)
        .join("");
}

searchInput.addEventListener("input", showCatalog);
categorySelect.addEventListener("change", showCatalog);
sortSelect.addEventListener("change", showCatalog);

showCatalog();