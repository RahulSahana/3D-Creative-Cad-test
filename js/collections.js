document.addEventListener('DOMContentLoaded', () => {
    const collectionGrid = document.getElementById('collection-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let allJewelry = [];
    let userWishlist = new Set();

    async function initializePage() {
        // If the page is used as a static demo (no Supabase loaded), avoid
        // calling into the supabase client so we don't throw a ReferenceError.
        if (typeof supabase === 'undefined') return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await fetchUserWishlist(session.user.id);
            }
        } catch (err) {
            // If auth or network fails, just continue to fetch jewelry if possible.
            console.warn('Supabase session fetch failed', err);
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

            // FIX: Use 'image-container' to match CSS and static HTML
            itemElement.innerHTML = `
                <div class="image-container">
                    <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
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

            // If we have data from the server, use it to render filtered results.
            if (allJewelry && allJewelry.length > 0) {
                const filteredItems = category === 'all' ? allJewelry : allJewelry.filter(item => item.category === category);
                displayJewelry(filteredItems);
                return;
            }

            // Fallback for static/demo pages: filter existing DOM items
            const domItems = collectionGrid.querySelectorAll('.collection-item');
            domItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (category === 'all' || itemCategory === category) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });

            // Trigger a resize so a masonry recalculation (if present) runs
            window.dispatchEvent(new Event('resize'));
        });
    });

    collectionGrid.addEventListener('click', async (e) => {
        const button = e.target.closest('.wishlist-icon-btn');
        if (!button) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            // Trigger the login modal from admin-login.js (assuming shared class)
            // Or alert user
            alert("Please login to use the wishlist feature.");
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