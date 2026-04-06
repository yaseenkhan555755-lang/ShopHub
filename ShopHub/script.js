// 🔥 COMPLETE SHOPHub8 - ALL FEATURES WORKING
let products = JSON.parse(localStorage.getItem('shophub8-products')) || [];
let cart = JSON.parse(localStorage.getItem('shophub8-cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('shophub8-user')) || null;

// Init
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    updateAuthUI();
    updateCartCount();
    renderProducts();
    loadDefaultProducts();
    setupEventListeners();
    showSection('home');
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', renderProducts);
    document.getElementById('categoryFilter').addEventListener('change', renderProducts);
    document.getElementById('productForm').addEventListener('submit', addProduct);
    window.onclick = function(e) {
        if (e.target.id === 'authModal') closeModal();
    };
}

// === AUTH SYSTEM ===
function toggleAuth() {
    if (currentUser) {
        logout();
    } else {
        openAuthModal();
    }
}

function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = '👤 Choose Your Seller Name';
}

function closeModal() {
    document.getElementById('authModal').style.display = 'none';
}

function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !email || !password) {
        showStatus('❌ Fill all fields!', 'error');
        return;
    }
    
    // Save user
    currentUser = {
        username: username,
        email: email,
        joined: new Date().toLocaleString()
    };
    
    localStorage.setItem('shophub8-user', JSON.stringify(currentUser));
    updateAuthUI();
    closeModal();
    document.getElementById('productForm').scrollIntoView();
    showStatus(`✅ Welcome ${username}! You can now SELL! 🛒✨`, 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('shophub8-user');
    updateAuthUI();
    showStatus('👋 Logged out successfully!', 'info');
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const sellBtn = document.getElementById('sellBtn');
    
    if (currentUser) {
        authBtn.innerHTML = `<i class="fas fa-user-check"></i> ${currentUser.username}`;
        authBtn.classList.add('seller-logged');
        sellBtn.innerHTML = `<i class="fas fa-check-circle"></i> Sell Ready!`;
        sellBtn.classList.add('ready');
        document.getElementById('loginPrompt').style.display = 'none';
        document.getElementById('productForm').style.display = 'block';
    } else {
        authBtn.innerHTML = `<i class="fas fa-user-plus"></i> Login`;
        authBtn.classList.remove('seller-logged');
        sellBtn.innerHTML = `<i class="fas fa-lock"></i> Sell (Login)`;
        sellBtn.classList.remove('ready');
        document.getElementById('loginPrompt').style.display = 'block';
        document.getElementById('productForm').style.display = 'none';
    }
}

function showStatus(message, type) {
    const status = document.getElementById('authStatus');
    status.innerHTML = `<div class="status-${type}">${message}</div>`;
    setTimeout(() => status.innerHTML = '', 4000);
}

function goToSell() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    showSection('sell');
}

// === PRODUCTS ===
function loadDefaultProducts() {
    if (products.length === 0) {
        products = [
            {id:1,name:"🎧 Wireless Headphones",price:49.99,desc:"Noise cancelling",category:"electronics",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",seller:"Demo Shop"},
            {id:2,name:"👕 Cotton T-Shirt",price:19.99,desc:"100% cotton",category:"clothing",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",seller:"Fashion Hub"},
            {id:3,name:"📚 JavaScript Book",price:29.99,desc:"Complete guide",category:"books",image:"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300",seller:"Book Store"}
        ];
        saveData();
    }
}

function renderProducts() {
    const container = document.getElementById('productsContainer');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search) && 
        (!category || p.category === category)
    );
    
    container.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img src="${p.image}" class="product-image" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div class="product-seller">👤 ${p.seller}</div>
            <button class="btn-primary" onclick="addToCart(${p.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `).join('') || '<p style="grid-column:1/-1;text-align:center;color:#666">No products found 🔍</p>';
}

function addProduct(e) {
    e.preventDefault();
    if (!currentUser) return;
    
    const product = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        desc: document.getElementById('productDesc').value,
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/300x200/667eea/fff?text=No+Image',
        seller: currentUser.username
    };
    
    products.unshift(product);
    saveData();
    renderProducts();
    e.target.reset();
    showStatus('✅ Product listed! Live for everyone! 🛒', 'success');
}

// === CART ===
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);
    
    if (cartItem) {
        cartItem.qty += 1;
    } else {
        cart.push({...product, qty: 1});
    }
    
    saveData();
    updateCartCount();
    showStatus(`${product.name} added! 🛍️`, 'success');
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').textContent = count;
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    document.getElementById('cartTotal').textContent = total.toFixed(2);
    
    if (cart.length) {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} × ${item.qty}</p>
                </div>
                <button class="remove-item" onclick="removeCartItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<div style="text-align:center;padding:3rem"><i class="fas fa-shopping-cart" style="font-size:4rem;color:#ccc"></i><p>Your cart is empty</p></div>';
    }
}

function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveData();
    updateCartCount();
    renderCart();
}

function checkout() {
    if (!cart.length) return alert('Cart empty!');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    alert(`🎉 Order confirmed!\nTotal: $${total.toFixed(2)}\nThank you for shopping Shophub8!`);
    cart = [];
    saveData();
    updateCartCount();
    renderCart();
}

function saveData() {
    localStorage.setItem('shophub8-products', JSON.stringify(products));
    localStorage.setItem('shophub8-cart', JSON.stringify(cart));
}

function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// Show cart on cart click
document.querySelector('a[onclick="showSection(\'cart\')"]').onclick = function() {
    showSection('cart');
    renderCart();
};