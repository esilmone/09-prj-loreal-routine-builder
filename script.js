/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Store selected products by their id */
let selectedProductIds = [];
let allProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card${
      selectedProductIds.includes(product.id) ? " selected" : ""
    }" 
         data-id="${product.id}" tabindex="0">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <div class="product-description-overlay" aria-live="polite">
        <strong>Description</strong>
        <span>${product.description}</span>
      </div>
    </div>
  `
    )
    .join("");

  // Add click event listeners to each product card
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number(card.getAttribute("data-id"));
      toggleProductSelection(id);
      // Re-render products to update selection highlight
      displayProducts(
        allProducts.filter((p) => p.category === categoryFilter.value)
      );
      updateSelectedProductsList();
    });
  });
}

/* Add or remove product from selection */
function toggleProductSelection(id) {
  if (selectedProductIds.includes(id)) {
    selectedProductIds = selectedProductIds.filter((pid) => pid !== id);
  } else {
    selectedProductIds.push(id);
  }
}

/* Update the Selected Products section */
function updateSelectedProductsList() {
  if (selectedProductIds.length === 0) {
    selectedProductsList.innerHTML = `<div class="placeholder-message">No products selected yet.</div>`;
    return;
  }
  const selected = allProducts.filter((p) => selectedProductIds.includes(p.id));
  selectedProductsList.innerHTML = selected
    .map(
      (product) => `
      <div class="product-card" style="flex: 0 1 220px; min-width:180px; min-height:unset;">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.brand}</p>
          <button class="remove-btn" data-id="${product.id}" title="Remove">&times;</button>
        </div>
      </div>
    `
    )
    .join("");

  // Add event listeners for remove buttons
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent card click
      const id = Number(btn.getAttribute("data-id"));
      toggleProductSelection(id);
      // Re-render products and selected list
      displayProducts(
        allProducts.filter((p) => p.category === categoryFilter.value)
      );
      updateSelectedProductsList();
    });
  });
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  if (allProducts.length === 0) {
    allProducts = await loadProducts();
  }
  const selectedCategory = e.target.value;
  const filteredProducts = allProducts.filter(
    (product) => product.category === selectedCategory
  );
  displayProducts(filteredProducts);
});

/* Initial load of all products for selection logic */
(async () => {
  allProducts = await loadProducts();
  updateSelectedProductsList();
})();

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
