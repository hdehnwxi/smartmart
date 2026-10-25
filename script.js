function getCart() {
    const cart = localStorage.getItem('smartMartCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('smartMartCart', JSON.stringify(cart));
    updateCartBadge(); 
}

function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-badge').forEach(badge => {
        if (totalCount > 0) {
            badge.innerText = totalCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === product.name);

    if (existingItem) {
        existingItem.quantity += 1; 
    } else {
        product.quantity = 1; 
        cart.push(product);
    }
    
    saveCart(cart);
    showToast(`${product.name} added to cart!`);
}

function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.className = "show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {

    updateCartBadge();

    const addButtons = document.querySelectorAll('.add-to-cart');
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const name = productCard.querySelector('h3').innerText;
                const priceText = productCard.querySelector('.price').innerText;
                const image = productCard.querySelector('img').src;
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

                addToCart({ name, price, image });
            }
        });
    });

    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        renderCartPage();
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            document.querySelectorAll('.product-card').forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                card.style.display = title.includes(filter) ? "flex" : "none"; 
            });
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam && searchInput) {
        searchInput.value = queryParam; 
        searchInput.dispatchEvent(new Event('input')); 
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            showToast(`Thank you, ${document.getElementById('name').value}! Message sent.`);
            contactForm.reset(); 
        });
    }

    const navSearchIcon = document.getElementById('navSearchIcon');
    if (navSearchIcon) {
        const navInput = document.createElement('input');
        navInput.type = 'text';
        navInput.placeholder = 'Search & Press Enter...';
        navInput.style.cssText = 'padding: 6px 12px; border-radius: 20px; border: none; outline: none; margin-right: 10px; transition: all 0.3s ease; width: 0px; opacity: 0; visibility: hidden; color: #333;';

        navSearchIcon.parentNode.insertBefore(navInput, navSearchIcon);
        navSearchIcon.style.cursor = 'pointer';

        let isSearchOpen = false;

        navSearchIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            isSearchOpen = !isSearchOpen;
            if (isSearchOpen) {
                navInput.style.width = '180px';
                navInput.style.opacity = '1';
                navInput.style.visibility = 'visible';
                navInput.focus();
            } else {
                if (!navInput.value) {
                    navInput.style.width = '0px';
                    navInput.style.opacity = '0';
                    navInput.style.visibility = 'hidden';
                }
            }
        });

        navInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    window.location.href = `products.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});

function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    const emptyMsg = document.getElementById('empty-cart-message');

    if (!container) return;

    container.innerHTML = ''; 

    if (cart.length === 0) {
        if(summary) summary.style.display = 'none';
        if(emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if(emptyMsg) emptyMsg.style.display = 'none';
    if(summary) summary.style.display = 'block';

    let totalPrice = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        totalPrice += item.price * item.quantity;
        totalItems += item.quantity;

        const itemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">RM ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += itemHTML;
    });

    if(document.getElementById('total-items')) document.getElementById('total-items').innerText = totalItems;
    if(document.getElementById('total-price')) document.getElementById('total-price').innerText = `RM ${totalPrice.toFixed(2)}`;
}

function changeQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart(cart);
    renderCartPage(); 
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
    showToast("Item removed from cart");
}

function checkout() {
    let modal = document.getElementById('success-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'success-modal';
        modal.innerHTML = `
            <div class="success-content">
                <div class="success-icon"><i class="fa-solid fa-check"></i></div>
                <h2>Payment Successful!</h2>
                <p>Thank you for shopping with SmartMart.<br>Your order has been placed successfully.</p>
                <button class="shop-btn" style="width: 100%; justify-content: center; border-radius: 8px;" onclick="finishCheckout()">
                    Continue Shopping
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    setTimeout(() => modal.classList.add('show'), 10);
}

function finishCheckout() {
    localStorage.removeItem('smartMartCart');
    updateCartBadge();
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.remove('show');
    setTimeout(() => window.location.href = 'index.html', 500);
}

// ==========================================
// 7. 移动端汉堡菜单侧边栏功能
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');

    // 如果页面上有导航栏和链接
    if (navbar && navLinks) {
        // 1. 动态创建汉堡按钮
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>'; // 三条线图标
        navbar.insertBefore(hamburger, navbar.firstChild); // 插到导航栏最前面

        // 2. 动态创建侧边栏和遮罩层
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // 把原来的链接复制到侧边栏，并加上关闭按钮
        mobileMenu.innerHTML = `
            <span class="close-btn">&times;</span>
            ${navLinks.innerHTML}
        `;

        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        // 插入到 body 末尾
        document.body.appendChild(mobileMenu);
        document.body.appendChild(overlay);

        // 3. 绑定点击事件
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
        });

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        };

        // 点击 X 或 点击黑色遮罩 关闭菜单
        mobileMenu.querySelector('.close-btn').addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }
});