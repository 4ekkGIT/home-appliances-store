const productsCount = document.getElementById("productsCount");
const ordersCount = document.getElementById("ordersCount");
const categoriesCount = document.getElementById("categoriesCount");
const adminProducts = document.getElementById("adminProducts");

const categories = [];

products.forEach(product => {
    if (!categories.includes(product.category)) {
        categories.push(product.category);
    }
});

productsCount.textContent = products.length;
ordersCount.textContent = orders.length;
categoriesCount.textContent = categories.length;

adminProducts.innerHTML = products.map(product => `
    <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${formatPrice(product.price)}</td>
        <td>
            ${product.available ? "Да" : "Нет"}
        </td>
    </tr>
`).join("");ы