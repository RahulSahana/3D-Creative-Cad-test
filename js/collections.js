document.addEventListener('DOMContentLoaded', () => {
    const collectionGrid = document.getElementById('collection-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let allJewelry = [];
    let userWishlist = new Set();

    async function initializePage() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchUserWishlist(session.user.id);
        }
        await fetchJewelry();
    }

    async function fetchUserWishlist(userId) {
        const { data, error } = await supabase
            .from('wishlist_items')
            .select('jewelry_id')
            .eq('user_id', userId);
        
        if (data) {
            userWishlist = new Set(data.map(item => item.jewelry_id));
        }
    }

    async function fetchJewelry() {
        const { data, error } = await supabase
            .from('jewelry')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            collectionGrid.innerHTML = `<p class="error-message">Could not load designs. Please try again later.</p>`;
            return;
        }
        allJewelry = data;
        displayJewelry(allJewelry);
    }

    function displayJewelry(items) {
        collectionGrid.innerHTML = '';
        if (items.length === 0) {
            collectionGrid.innerHTML = `<p>No designs found in this category.</p>`;
            return;
        }

        items.forEach(item => {
            const isWishlisted = userWishlist.has(item.id);
            const itemElement = document.createElement('div');
            itemElement.className = 'collection-item';
            itemElement.setAttribute('data-category', item.category);

            itemElement.innerHTML = `
                <div class="item-image-container">
                    <img src="${item.imageUrl}" alt="${item.title}">
                    <button class="wishlist-icon-btn ${isWishlisted ? 'added' : ''}" data-id="${item.id}" aria-label="Add to wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="item-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            collectionGrid.appendChild(itemElement);
        });
    }

    // --- Event Listeners ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.filter;
            const filteredItems = category === 'all' ? allJewelry : allJewelry.filter(item => item.category === category);
            displayJewelry(filteredItems);
        });
    });

    collectionGrid.addEventListener('click', async (e) => {
        const button = e.target.closest('.wishlist-icon-btn');
        if (!button) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            // Trigger the login modal from auth.js
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) loginBtn.click();
            return;
        }

        const jewelryId = button.dataset.id;
        const userId = session.user.id;
        const isAdded = button.classList.contains('added');

        button.disabled = true;

        if (isAdded) {
            // Remove from wishlist
            const { error } = await supabase
                .from('wishlist_items')
                .delete()
                .match({ user_id: userId, jewelry_id: jewelryId });
            
            if (!error) button.classList.remove('added');

        } else {
            // Add to wishlist
            const { error } = await supabase
                .from('wishlist_items')
                .insert([{ user_id: userId, jewelry_id: jewelryId }]);
            
            if (!error) button.classList.add('added');
        }
        
        button.disabled = false;
    });

    initializePage();
});

