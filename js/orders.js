const ordersTable = document.getElementById("ordersTable");

function showOrders() {
    ordersTable.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.quantity}</td>
            <td>${formatPrice(order.total)}</td>
            <td>
                <span class="status">
                    ${order.status}
                </span>
            </td>
        </tr>
    `).join("");
}

showOrders();