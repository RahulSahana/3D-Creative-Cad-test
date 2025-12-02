// Masonry helper: computes grid-row spans so each .collection-item fits properly
(function () {
    function applyMasonryGrid(gridSelector = '#collection-grid') {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;

        // Read numeric values robustly from computed styles. Some browsers expose
        // row gap through 'row-gap' while others use 'grid-row-gap'. We parse
        // floats and fallback to 0 when values are missing.
        const computed = window.getComputedStyle(grid);
        const rowHeight = parseFloat(computed.getPropertyValue('grid-auto-rows')) || 0;
        const rowGapRaw = computed.getPropertyValue('row-gap') || computed.getPropertyValue('grid-row-gap') || '0px';
        const rowGap = parseFloat(rowGapRaw) || 0;
        if (!rowHeight) return;

        const items = grid.querySelectorAll('.collection-item');
        items.forEach(item => {
            // Reset any previous inline style
            // Clear previous inline gridSpan so we get a fresh measurement
            item.style.gridRowEnd = '';

            const itemHeight = item.getBoundingClientRect().height;
            // Guard against divide-by-zero: if rowHeight is 0, make the item span 1
            const rowSpan = rowHeight > 0 ? Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap)) : 1;
            item.style.gridRowEnd = `span ${rowSpan}`;
        });
    }

    // Recalculate when images load inside the grid
    function observeImages(gridSelector = '#collection-grid') {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;

        const imgs = grid.querySelectorAll('img');
        let imagesLoaded = 0;
        const total = imgs.length;

        if (total === 0) return applyMasonryGrid(gridSelector);

        imgs.forEach(img => {
            if (img.complete) {
                imagesLoaded++;
            } else {
                img.addEventListener('load', () => {
                    imagesLoaded++;
                    applyMasonryGrid(gridSelector);
                });
                img.addEventListener('error', () => {
                    imagesLoaded++;
                    applyMasonryGrid(gridSelector);
                });
            }
        });

        // If all images were already loaded, apply masonry
        if (imagesLoaded === total) applyMasonryGrid(gridSelector);
    }

    // Public init
    function init() {
        // Apply on DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            applyMasonryGrid();
            observeImages();
        });

        // Re-apply on window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => applyMasonryGrid(), 120);
        });

        // Also run on full window load to be safe
        window.addEventListener('load', () => {
            applyMasonryGrid();
        });
    }

    // Initialize
    init();
})();
