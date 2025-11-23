document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Element References ---
    const container = document.querySelector('.shortcut-container');
    const allCards = Array.from(document.querySelectorAll('.shortcut-card'));
    const searchBox = document.getElementById('search-box');
    
    // --- Local Storage Key ---
    const linkOrderKey = 'myLinkOrder';

    // --- Core Functions ---

    /**
     * Reads the saved order of link IDs from localStorage.
     * @returns {string[]} An array of link IDs in their saved order.
     */
    function getSavedOrder() {
        return JSON.parse(localStorage.getItem(linkOrderKey)) || [];
    }

    /**
     * Saves a new order of link IDs to localStorage.
     * @param {string[]} order - An array of link IDs to save.
     */
    function saveOrder(order) {
        localStorage.setItem(linkOrderKey, JSON.stringify(order));
    }

    /**
     * Re-arranges the cards in the DOM based on the saved order on page load.
     */
    function reorderCardsOnLoad() {
        const savedOrder = getSavedOrder();
        
        const cardsById = allCards.reduce((acc, card) => {
            acc[card.dataset.id] = card;
            return acc;
        }, {});

        savedOrder.forEach(id => {
            if (cardsById[id]) {
                container.appendChild(cardsById[id]);
            }
        });

        allCards.forEach(card => {
            if (!savedOrder.includes(card.dataset.id)) {
                container.appendChild(card);
            }
        });
    }

    // --- Event Handlers ---

    /**
     * Handles clicking on a card to track recency AND visually move it to the top.
     * @param {Event} e - The click event.
     */
    function handleCardClick(e) {
        // We use .currentTarget to ensure we're listening on the container,
        // but still find the specific card that was clicked.
        const clickedCard = e.target.closest('.shortcut-card');
        if (!clickedCard) return;

        const clickedId = clickedCard.dataset.id;
        let currentOrder = getSavedOrder();

        // Remove the ID from its current position
        currentOrder = currentOrder.filter(id => id !== clickedId);
        // Add the ID to the beginning of the array (most recent)
        currentOrder.unshift(clickedId);
        // Save the new order for the next page load
        saveOrder(currentOrder);

        // --- KEY CHANGE: Visually move the card to the top of the container in real-time ---
        container.prepend(clickedCard);
    }

    /**
     * Handles the search input to filter cards.
     */
    function handleSearch() {
        const query = searchBox.value.toLowerCase();
        
        allCards.forEach(card => {
            const title = card.querySelector('.shortcut-title').textContent.toLowerCase();
            const description = card.querySelector('.shortcut-description').textContent.toLowerCase();
            const isVisible = title.includes(query) || description.includes(query);
            
            card.classList.toggle('is-hidden', !isVisible);
        });
    }

    /**
     * Fades in cards as they become visible on the screen.
     */
    function initializeCardFadeIn() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Re-query the cards in their *current* DOM order to apply the fade-in correctly
        const cardsInOrder = document.querySelectorAll('.shortcut-card');
        cardsInOrder.forEach(card => observer.observe(card));
    }

    /**
     * Automatically cycles through the available color themes.
     */
    function initializeThemeCycler() {
        const themes = ['theme-soft-pink', 'theme-soft-blue', 'theme-soft-green', 'theme-soft-peach'];
        let bodyClasses = document.body.className.split(' ');
        let currentTheme = bodyClasses.find(c => themes.includes(c)) || themes[0];
        let currentThemeIndex = themes.indexOf(currentTheme);

        const themeIntervalTime = 15000; // 15 seconds

        setInterval(() => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const newTheme = themes[currentThemeIndex];
            
            document.body.classList.remove(...themes);
            document.body.classList.add(newTheme);
        }, themeIntervalTime);
    }
    
    // --- Page Initialization ---
    
    reorderCardsOnLoad();
    initializeCardFadeIn();
    initializeThemeCycler();

    // Attach event listeners
    container.addEventListener('click', handleCardClick);
    searchBox.addEventListener('input', handleSearch);
});

// --- Anti-Zoom Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Prevent "Ctrl + Scroll" on Desktop
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false }); // 'passive: false' is required to use preventDefault

    // 2. Prevent Keyboard Zooming (Ctrl/Cmd + "+", "-", "0")
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && 
            (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
            e.preventDefault();
        }
    });

    // 3. Prevent "Pinch to Zoom" on iOS Safari (The Meta Tag is often ignored)
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
    
    // 4. Prevent double-tap to zoom on some older mobile browsers
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});