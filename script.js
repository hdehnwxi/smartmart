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

    const productCards = document.querySelectorAll('.product-card');
    const searchInput = document.getElementById('searchInput');
    const categoryItems = document.querySelectorAll('.filter-list li');
    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.getElementById('priceDisplay');

    if (searchInput && priceRange) {
        let currentCategory = 'all';
        let currentMaxPrice = 50;
        let currentSearch = '';

        function filterProducts() {
            productCards.forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                const price = card.dataset.price ? parseFloat(card.dataset.price) : parseFloat(card.querySelector('.price').innerText.replace(/[^0-9.]/g, ''));
                const category = card.dataset.category || 'all';

                const matchSearch = title.includes(currentSearch);
                const matchCategory = (currentCategory === 'all' || category === currentCategory);
                const matchPrice = price <= currentMaxPrice;

                if (matchSearch && matchCategory && matchPrice) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            filterProducts();
        });

        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                categoryItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                currentCategory = item.dataset.category;
                filterProducts();
            });
        });

        priceRange.addEventListener('input', (e) => {
            currentMaxPrice = parseFloat(e.target.value);
            priceDisplay.innerText = `RM ${currentMaxPrice.toFixed(2)}`;
            filterProducts();
        });

        const urlParams = new URLSearchParams(window.location.search);
        
        const queryParam = urlParams.get('q');
        if (queryParam) {
            searchInput.value = queryParam;
            currentSearch = queryParam.toLowerCase();
        }

        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            currentCategory = categoryParam;
            categoryItems.forEach(item => {
                if (item.dataset.category === categoryParam) {
                    categoryItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        }

        if (queryParam || categoryParam) {
            filterProducts();
        }
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

        navInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                const query = e.target.value.trim();
                
                if (query) {
                    if (window.location.pathname.includes('products.html')) {
                        const mainSearchInput = document.getElementById('searchInput');
                        if (mainSearchInput) {
                            mainSearchInput.value = query;
                            mainSearchInput.dispatchEvent(new Event('input'));
                            
                            navInput.style.width = '0px';
                            navInput.style.opacity = '0';
                            navInput.style.visibility = 'hidden';
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    } else {
                        window.location.href = `products.html?q=${encodeURIComponent(query)}`;
                    }
                }
            }
        });
    }

    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');

    if (navbar && navLinks) {
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<img src="images/bars-solid-full.svg" style="width: 24px; height: 24px;" alt="Menu">';
        navbar.insertBefore(hamburger, navbar.firstChild);

        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `<span class="close-btn">&times;</span>${navLinks.innerHTML}`;

        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        document.body.appendChild(mobileMenu);
        document.body.appendChild(overlay);

        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
        });

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        };

        mobileMenu.querySelector('.close-btn').addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }

    const slides = document.querySelectorAll('.slider-container .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    
    if (slides.length > 0) {
        let currentIndex = 0;
        let slideInterval;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            if(dots.length > 0) dots[index].classList.add('active');
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }

        function startSlideShow() {
            slideInterval = setInterval(nextSlide, 3000);
        }

        window.currentSlide = function(index) {
            clearInterval(slideInterval); 
            currentIndex = index;
            showSlide(currentIndex);
            startSlideShow(); 
        }

        startSlideShow();
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
                        <img src="images/trash-solid-full.svg" style="width: 20px; height: 20px;" alt="Delete">
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
                <div class="success-icon" style="background: none; width: auto; height: auto; animation: none;">
                    <img src="images/circle-check-solid-full.svg" style="width: 80px; height: 80px; filter: brightness(0) saturate(100%) invert(35%) sepia(20%) saturate(1200%) hue-rotate(100deg) brightness(95%) contrast(85%);" alt="Success">
                </div>
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