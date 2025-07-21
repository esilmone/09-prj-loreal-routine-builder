// Show Save Routine button after generating a routine
// Show Save Routine button underneath the user input
function showSaveRoutineButton(routineText, products) {
  // Only show if not already present
  if (document.getElementById("saveRoutineBtn")) return;
  const btn = document.createElement("button");
  btn.id = "saveRoutineBtn";
  btn.className = "generate-btn";
  btn.style.marginTop = "18px";
  btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Routine';
  // Place the button after the chat form (user input)
  if (chatForm && chatForm.parentNode) {
    chatForm.parentNode.insertBefore(btn, chatForm.nextSibling);
  }
  btn.addEventListener("click", function () {
    saveRoutine(routineText, products);
    btn.disabled = true;
    btn.innerHTML = "Saved!";
    setTimeout(() => {
      btn.remove();
    }, 1200);
  });
}

// Save routine to localStorage
function saveRoutine(routineText, products) {
  const routines = JSON.parse(localStorage.getItem("myRoutines") || "[]");
  const routineNumber = routines.length + 1;
  routines.unshift({
    id: Date.now(),
    title: `Routine ${routineNumber}`,
    text: routineText,
    products: products.map((p) => ({
      name: p.name,
      brand: p.brand,
      category: p.category,
    })),
    expanded: false, // Track expanded/collapsed state
  });
  localStorage.setItem("myRoutines", JSON.stringify(routines));
  renderMyRoutines();
}

// Render My Routines section
function renderMyRoutines() {
  const routines = JSON.parse(localStorage.getItem("myRoutines") || "[]");
  const list = document.getElementById("myRoutinesList");
  if (!list) return;
  if (routines.length === 0) {
    list.innerHTML =
      '<div class="placeholder-message">No routines saved yet.</div>';
    return;
  }
  list.innerHTML = routines
    .map(
      (r) => `
    <div class="routine-card">
      <div class="routine-title" style="cursor:pointer;user-select:none;">
        ${r.title} 
        <span style="float:right;font-size:18px;">${
          r.expanded ? "▼" : "▶"
        }</span>
      </div>
      <div class="routine-content" style="display:${
        r.expanded ? "block" : "none"
      }">
        <div class="routine-products">${r.products
          .map(
            (p) =>
              `${p.name} <span style='color:#888;font-size:12px;'>(${p.brand}, ${p.category})</span>`
          )
          .join("<br>")}</div>
        <div class="routine-text">${r.text}</div>
        <button class="delete-routine-btn" data-id="${r.id}">Delete</button>
      </div>
    </div>
  `
    )
    .join("");
  // Add click handlers for routine titles (expand/collapse)
  document.querySelectorAll(".routine-title").forEach((title) => {
    title.addEventListener("click", function () {
      const card = this.closest(".routine-card");
      const content = card.querySelector(".routine-content");
      const arrow = this.querySelector("span");
      const routineId = card
        .querySelector(".delete-routine-btn")
        .getAttribute("data-id");

      // Update expanded state in localStorage
      const routines = JSON.parse(localStorage.getItem("myRoutines") || "[]");
      const routine = routines.find((r) => r.id === Number(routineId));
      if (routine) {
        routine.expanded = !routine.expanded;
        localStorage.setItem("myRoutines", JSON.stringify(routines));
      }

      // Toggle visibility
      content.style.display =
        content.style.display === "none" ? "block" : "none";
      arrow.textContent = content.style.display === "none" ? "▶" : "▼";
    });
  });

  // Add delete listeners
  document.querySelectorAll(".delete-routine-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      deleteRoutine(Number(btn.getAttribute("data-id")));
    });
  });
}

// Delete a routine
function deleteRoutine(id) {
  let routines = JSON.parse(localStorage.getItem("myRoutines") || "[]");
  routines = routines.filter((r) => r.id !== id);
  localStorage.setItem("myRoutines", JSON.stringify(routines));
  renderMyRoutines();
}

// Render routines on page load
window.addEventListener("DOMContentLoaded", renderMyRoutines);
/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Store selected products by their id */
let selectedProductIds = [];

// Load selected products from localStorage if available
if (localStorage.getItem("selectedProductIds")) {
  try {
    selectedProductIds =
      JSON.parse(localStorage.getItem("selectedProductIds")) || [];
  } catch (e) {
    selectedProductIds = [];
  }
}
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
  // Save to localStorage
  localStorage.setItem(
    "selectedProductIds",
    JSON.stringify(selectedProductIds)
  );
}

/* Update the Selected Products section */
function updateSelectedProductsList() {
  if (selectedProductIds.length === 0) {
    selectedProductsList.innerHTML = `<div class="placeholder-message">No products selected yet.</div>
      <button id="clearAllBtn" class="generate-btn" style="margin-top:12px; background:#ff003b;">Clear All</button>`;
    document
      .getElementById("clearAllBtn")
      .addEventListener("click", clearAllSelections);
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
  // Add clear all button
  selectedProductsList.innerHTML += `<button id="clearAllBtn" class="generate-btn" style="margin-top:12px; background:#ff003b;">Clear All</button>`;

  // Add event listeners for remove buttons
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent card click
      const id = Number(btn.getAttribute("data-id"));
      toggleProductSelection(id);
      displayProducts(
        allProducts.filter((p) => p.category === categoryFilter.value)
      );
      updateSelectedProductsList();
    });
  });
  // Add event listener for clear all
  document
    .getElementById("clearAllBtn")
    .addEventListener("click", clearAllSelections);
}

// Remove all selections and update localStorage
function clearAllSelections() {
  selectedProductIds = [];
  localStorage.setItem(
    "selectedProductIds",
    JSON.stringify(selectedProductIds)
  );
  displayProducts(
    allProducts.filter((p) => p.category === categoryFilter.value)
  );
  updateSelectedProductsList();
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

  /* Initial load of all products for selection logic */
  (async () => {
    allProducts = await loadProducts();
    updateSelectedProductsList();
  })();

  // Get reference to the Generate Routine button

  const generateRoutineBtn = document.getElementById("generateRoutine");

  // Store the chat history for context
  let chatHistory = [];
  let lastRoutineProducts = [];

  // When the user clicks Generate Routine, send selected products to OpenAI and show the routine

  generateRoutineBtn.addEventListener("click", async () => {
    const selected = allProducts.filter((p) =>
      selectedProductIds.includes(p.id)
    );
    if (selected.length === 0) {
      chatWindow.innerHTML = `<div class="placeholder-message">Please select at least one product to generate a routine.</div>`;
      return;
    }

    chatWindow.innerHTML = `<div class="placeholder-message">Generating your personalized routine...</div>`;

    // Start a new chat history for this routine
    chatHistory = [
      {
        role: "system",
        content:
          "You are a skincare and beauty expert. Only answer questions about the generated routine, skincare, haircare, makeup, fragrance, or related beauty topics. If asked about anything else, politely say you can only answer beauty-related questions.",
      },
      {
        role: "user",
        content: `Please create a beauty routine using these products:\n${selected
          .map((p) => `• ${p.name} by ${p.brand} (${p.category})`)
          .join("\n")}`,
      },
    ];
    lastRoutineProducts = selected;

    try {
      const response = await fetch(
        "https://nameless-thunder-699e.esilmone.workers.dev/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: chatHistory,
          }),
        }
      );

      const data = await response.json();

      if (
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        chatHistory.push({
          role: "assistant",
          content: data.choices[0].message.content,
        });
        renderChatHistory();
        // Show the Save Routine button after generating the routine
        showSaveRoutineButton(data.choices[0].message.content, selected);
      } else {
        chatWindow.innerHTML = `<div class="placeholder-message">Sorry, I couldn't generate a routine. Please try again.</div>`;
      }
    } catch (error) {
      chatWindow.innerHTML = `<div class="placeholder-message">Error: Could not connect to OpenAI API.</div>`;
    }
  });

  // Chat form submission handler for follow-up questions
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userInput = document.getElementById("userInput").value;
    if (!userInput.trim()) return;

    chatHistory.push({ role: "user", content: userInput });
    renderChatHistory();

    try {
      const response = await fetch(
        "https://nameless-thunder-699e.esilmone.workers.dev/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: chatHistory,
          }),
        }
      );

      const data = await response.json();

      if (
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        chatHistory.push({
          role: "assistant",
          content: data.choices[0].message.content,
        });
        renderChatHistory();
      } else {
        chatWindow.innerHTML = `<div class="placeholder-message">Sorry, I couldn't answer that. Please try again.</div>`;
      }
    } catch (error) {
      chatWindow.innerHTML = `<div class="placeholder-message">Error: Could not connect to OpenAI API.</div>`;
    }
    document.getElementById("userInput").value = "";
  });

  // Helper function to render the chat history
  function renderChatHistory() {
    chatWindow.innerHTML = chatHistory
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => {
        if (msg.role === "user") {
          return `<div class="chat-message user" style="margin-bottom:8px;"><strong>You:</strong><br><span style="white-space: pre-line;">${msg.content}</span></div>`;
        } else {
          return `<div class="chat-message assistant" style="margin-bottom:16px;"><strong>Advisor:</strong><br><span style="white-space: pre-line;">${msg.content}</span></div>`;
        }
      })
      .join("");
  }
});
