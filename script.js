// Data produk parfum
const products = [
  {
    id: 1,
    name: "Twilight Dreams",
    description: "Aroma misterius dengan notes lembut",
    image: "parfum1.webp",
    price: 450000,
    emoji: "💜",
  },
  {
    id: 2,
    name: "Ocean Breeze",
    description: "Segar dan menenangkan untuk pria",
    image: "parfum2.webp",
    price: 380000,
    emoji: "🌊",
  },
  {
    id: 3,
    name: "Rose Garden",
    description: "Bunga mawar asli dari Perancis",
    image: "parfum3.webp",
    price: 520000,
    emoji: "🌹",
  },
  {
    id: 4,
    name: "Midnight Gold",
    description: "Elegan dan sophisticated untuk wanita",
    image: "parfum4.webp",
    price: 480000,
    emoji: "✨",
  },
  {
    id: 5,
    name: "Citrus Splash",
    description: "Energik dan penuh semangat",
    image: "parfum5.webp",
    price: 350000,
    emoji: "🍊",
  },
  {
    id: 6,
    name: "Vanilla Dream",
    description: "Manis dengan sentuhan exotic",
    image: "parfum6.webp",
    price: 420000,
    emoji: "🌸",
  },
];

// Data keranjang dan history
let cart = [];
let history = [];
let currentSection = "home";

// Inisialisasi
document.addEventListener("DOMContentLoaded", function () {
  renderProducts();
  renderFeaturedProducts();
  showSection("home");
  loadCartFromStorage();
  // initialize firebase usage flag
  window._useFirebase =
    typeof firestoreDb !== "undefined" && firestoreDb != null;
  if (window._useFirebase) {
    // load history from Firebase
    loadHistoryFromFirebase();
  } else {
    loadHistoryFromStorage();
  }
});

// Format mata uang
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Render produk
function renderProducts() {
  const productGrid = document.getElementById("product-grid");
  productGrid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-image">
                <img class="product-img" src="${product.image}" alt="${
        product.name
      }" onload="this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="product-emoji">${product.emoji}</div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">${formatCurrency(
                  product.price
                )}</div>
                <button class="btn btn-primary btn-full" onclick="addToCart(${
                  product.id
                })">Tambah ke Keranjang</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Render featured products (3 produk pertama)
function renderFeaturedProducts() {
  const featuredGrid = document.getElementById("featured-grid");
  if (!featuredGrid) return;

  const featured = products.slice(0, 3);
  featuredGrid.innerHTML = featured
    .map(
      (product) => `
        <div class="featured-card">
            <div class="featured-image">
                <img class="featured-img" src="${product.image}" alt="${
        product.name
      }" onload="this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="product-emoji">${product.emoji}</div>
            </div>
            <div class="featured-info">
                <div class="featured-name">${product.name}</div>
                <div class="featured-price">${formatCurrency(
                  product.price
                )}</div>
                <button class="btn btn-primary btn-full" onclick="addToCart(${
                  product.id
                })">Tambah ke Keranjang</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Tambah ke keranjang
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCartToStorage();
  updateCartCount();
  showNotification(`${product.name} ditambahkan ke keranjang!`);
}

// Update cart count
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").textContent = totalItems;
}

// Tampilkan notifikasi
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Simpan cart ke localStorage
function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Load cart dari localStorage
function loadCartFromStorage() {
  const saved = localStorage.getItem("cart");
  if (saved) {
    cart = JSON.parse(saved);
    updateCartCount();
    renderCartItems();
  }
}

// Simpan history ke localStorage
function saveHistoryToStorage() {
  localStorage.setItem("history", JSON.stringify(history));
}

// Save single history item to Firestore (if available)
function saveHistoryToFirebase(item) {
  if (!window._useFirebase || typeof firestoreDb === "undefined")
    return Promise.resolve(null);

  // Attach server timestamp for reliable ordering in Firestore
  const data = Object.assign({}, item, {
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return firestoreDb
    .collection("orders")
    .add(data)
    .then((docRef) => docRef.id)
    .catch((err) => {
      console.warn("Failed to save history to Firebase", err);
      return null;
    });
}

// Load history from Firestore
function loadHistoryFromFirebase() {
  if (!window._useFirebase || typeof firestoreDb === "undefined") {
    loadHistoryFromStorage();
    return;
  }

  // Order by server timestamp for correct ordering
  firestoreDb
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      history = snapshot.docs.map((doc) => {
        const d = doc.data();
        const date =
          d.createdAt && d.createdAt.toDate
            ? d.createdAt.toDate().toLocaleString("id-ID")
            : d.date || "";
        return Object.assign({}, d, { id: doc.id, date });
      });
      renderHistoryItems();
    })
    .catch((err) => {
      console.warn("Failed to load history from Firebase", err);
      loadHistoryFromStorage();
    });
}

// Load history dari localStorage
function loadHistoryFromStorage() {
  const saved = localStorage.getItem("history");
  if (saved) {
    history = JSON.parse(saved);
  }
}

// Render history items
function renderHistoryItems() {
  const historyContent = document.getElementById("history-content");

  if (history.length === 0) {
    historyContent.innerHTML =
      '<p class="empty-message">Belum ada riwayat pembelian</p>';
    return;
  }

  historyContent.innerHTML = history
    .map(
      (item, index) => `
    <div class="history-item">
      <div class="history-header">
        <div>
          <div class="history-name">${item.name}</div>
          <div class="history-date">${item.date}</div>
        </div>
        <div class="history-total">${formatCurrency(item.total)}</div>
      </div>
      <div class="history-items">
        ${item.items
          .map(
            (product) =>
              `<p>${product.name} x${product.quantity} = ${formatCurrency(
                product.price * product.quantity
              )}</p>`
          )
          .join("")}
      </div>
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
        <p><strong>Email:</strong> ${item.email}</p>
        <p><strong>Telepon:</strong> ${item.phone}</p>
        <p><strong>Alamat:</strong> ${item.address}</p>
        <p><strong>Status:</strong> <span style="color: var(--success);">${
          item.status
        }</span></p>
      </div>
    </div>
  `
    )
    .join("");
}

// Render cart items
function renderCartItems() {
  const cartItemsDiv = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItemsDiv.innerHTML =
      '<p class="empty-message">Keranjang Anda kosong</p>';
    updateCartSummary();
    return;
  }

  cartItemsDiv.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.emoji} ${item.name}</div>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
                <div class="cart-item-quantity">
                    <button class="btn-quantity" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-quantity" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-remove" onclick="removeFromCart(${index})">Hapus</button>
            </div>
        </div>
    `
    )
    .join("");

  updateCartSummary();
}

// Update quantity
function updateQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
  } else {
    saveCartToStorage();
    updateCartCount();
    renderCartItems();
  }
}

// Hapus dari keranjang
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCartToStorage();
  updateCartCount();
  renderCartItems();
  showNotification("Produk dihapus dari keranjang");
}

// Update cart summary
function updateCartSummary() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("tax").textContent = formatCurrency(tax);
  document.getElementById("total").textContent = formatCurrency(total);
  document.getElementById("checkout-total").textContent = formatCurrency(total);
  document.getElementById("payment-total").textContent = formatCurrency(total);
}

// Go to checkout
function goToCheckout() {
  if (cart.length === 0) {
    showNotification("Keranjang Anda kosong!");
    return;
  }
  showSection("checkout");
}

// Go to payment
function goToPayment(event) {
  event.preventDefault();
  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;

  if (!fullname || !email || !address || !phone) {
    showNotification("Harap isi semua data!");
    return;
  }

  // Simpan data checkout
  window.checkoutData = { fullname, email, address, phone };
  renderPaymentMethods();
  showSection("payment");
}

// Render payment methods
function renderPaymentMethods() {
  const paymentDetails = document.getElementById("payment-details");
  const method = document.getElementById("payment-method").value;

  document
    .getElementById("payment-method")
    .addEventListener("change", function () {
      renderPaymentMethods();
    });

  let details = "";

  switch (method) {
    case "credit-card":
      details = `
                <div class="form-group">
                    <label>Nomor Kartu Kredit</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" required>
                </div>
                <div class="form-group">
                    <label>Nama Pemegang Kartu</label>
                    <input type="text" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>Bulan/Tahun</label>
                        <input type="text" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="***" maxlength="3" required>
                    </div>
                </div>
            `;
      break;
    case "debit-card":
      details = `
                <div class="form-group">
                    <label>Nomor Kartu Debit</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" required>
                </div>
                <div class="form-group">
                    <label>PIN/Password</label>
                    <input type="password" required>
                </div>
            `;
      break;
    case "e-wallet":
      details = `
                <div class="form-group">
                    <label>Pilih E-Wallet</label>
                    <select required>
                        <option value="">Pilih</option>
                        <option value="gopay">GoPay</option>
                        <option value="ovo">OVO</option>
                        <option value="dana">DANA</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nomor Telepon</label>
                    <input type="tel" required>
                </div>
            `;
      break;
    case "transfer":
      details = `
                <div class="form-group">
                    <label>Pilih Bank</label>
                    <select required>
                        <option value="">Pilih Bank</option>
                        <option value="bca">BCA</option>
                        <option value="mandiri">Mandiri</option>
                        <option value="bni">BNI</option>
                    </select>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <p><strong>No. Rekening:</strong> 1234567890</p>
                    <p><strong>Atas Nama:</strong> Luxe Parfum Indonesia</p>
                </div>
            `;
      break;
  }

  paymentDetails.innerHTML = details;
}

// Process payment
function processPayment(event) {
  event.preventDefault();
  const method = document.getElementById("payment-method").value;

  if (!method) {
    showNotification("Pilih metode pembayaran!");
    return;
  }

  // Simulasi proses pembayaran
  const processingDiv = document.createElement("div");
  processingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
  processingDiv.innerHTML = `
        <div style="text-align: center; color: white;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
            <h2>Memproses Pembayaran...</h2>
            <p>Harap tunggu beberapa saat</p>
        </div>
    `;
  document.body.appendChild(processingDiv);

  setTimeout(() => {
    processingDiv.remove();
    completePayment();
  }, 2000);
}

// Complete payment
function completePayment() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  const checkoutData = window.checkoutData;

  // Tambahkan ke history
  const historyItem = {
    id: Date.now(),
    name: checkoutData.fullname,
    email: checkoutData.email,
    address: checkoutData.address,
    phone: checkoutData.phone,
    items: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: subtotal,
    tax: tax,
    total: total,
    date: new Date().toLocaleString("id-ID"),
    status: "Selesai",
  };

  history.push(historyItem);
  // Save to Firebase if available, otherwise localStorage
  if (window._useFirebase) {
    saveHistoryToFirebase(historyItem).then((id) => {
      // optional: attach id to item
      if (id) historyItem.id = id;
      renderHistoryItems();
    });
  } else {
    saveHistoryToStorage();
  }

  document.getElementById("success-message").innerHTML = `
        <p style="margin-top: 1rem; font-size: 0.95rem; color: #cbd5e1;">
            Pesanan Anda untuk <strong>${checkoutData.fullname}</strong> 
            senilai <strong>${formatCurrency(
              total
            )}</strong> telah dikonfirmasi.
            <br><br>Kami akan segera mengirimkan parfum Anda ke alamat:
            <br><em>${checkoutData.address}</em>
        </p>
    `;

  cart = [];
  saveCartToStorage();
  updateCartCount();

  showSection("success");
  // Auto-hide success after 3 seconds and go to history
  setTimeout(() => {
    showSection("history");
  }, 3000);
}

// Contact form handler
function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("contact-name").value;
  const email = document.getElementById("contact-email").value;
  const message = document.getElementById("contact-message").value;

  if (!name || !email) {
    showNotification("Harap isi nama dan email!");
    return;
  }

  // Simpan kontak sederhana di localStorage (opsional)
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  contacts.unshift({
    id: Date.now(),
    name,
    email,
    message,
    date: new Date().toLocaleString("id-ID"),
  });
  localStorage.setItem("contacts", JSON.stringify(contacts));

  showNotification("Terima kasih, pertanyaan Anda telah dikirim ke WhatsApp!");

  // Kirim ke WhatsApp otomatis
  const waNumber = "6285924126460";
  const waMessage = `Halo Luxe Parfum, nama saya ${name}. Email saya: ${email}. Pertanyaan saya: ${message}`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    waMessage
  )}`;
  window.open(waLink, "_blank");

  // reset form
  document.getElementById("contact-name").value = "";
  document.getElementById("contact-email").value = "";
  document.getElementById("contact-message").value = "";
}

// Reset dan kembali ke home
function resetAndHome() {
  document.getElementById("fullname").value = "";
  document.getElementById("email").value = "";
  document.getElementById("address").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("payment-method").value = "";
  document.getElementById("payment-details").innerHTML = "";
  showSection("home");
}

// Show section
function showSection(sectionId) {
  // Sembunyikan semua section
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Tampilkan section yang dipilih
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("active");
    currentSection = sectionId;

    // Update cart items saat masuk cart section
    if (sectionId === "cart") {
      renderCartItems();
    }

    // Update history items saat masuk history section
    if (sectionId === "history") {
      renderHistoryItems();
    }

    // Scroll ke atas
    window.scrollTo(0, 0);
  }
}

// Tambahkan animasi slideInRight dan slideOutRight
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Mobile menu toggle: open/close navbar links on small screens
document.addEventListener("DOMContentLoaded", function () {
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar a");

  if (!mobileBtn || !navbar) return;

  mobileBtn.addEventListener("click", function () {
    const expanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", String(!expanded));
    navbar.classList.toggle("open");
  });

  // Close menu when a nav link is clicked (mobile)
  navLinks.forEach((a) =>
    a.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        navbar.classList.remove("open");
        if (mobileBtn) mobileBtn.setAttribute("aria-expanded", "false");
      }
    })
  );

  // Ensure menu is closed when resizing to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      navbar.classList.remove("open");
      if (mobileBtn) mobileBtn.setAttribute("aria-expanded", "false");
    }
  });
});
