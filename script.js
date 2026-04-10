// Global variables
let currentPage = 'landing';
let ingredientCount = 1;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentRecipe = null;
let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;

// New global variables for enhanced features
let multiTimers = [];
let currentStepIndex = 0;
let dietaryFilters = [];
let mealPlan = {};
let chatHistory = [];
let isVoiceChatActive = false;

// Public runtime configuration
const APP_CONFIG = window.APP_CONFIG || {};
const API_PROXY_BASE_URL = normalizeApiProxyBaseUrl(APP_CONFIG.API_PROXY_BASE_URL);
let hasShownProxyConfigurationWarning = false;

function normalizeApiProxyBaseUrl(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\/$/, '');
}

function buildProxyUrl(path, params = {}) {
    if (!API_PROXY_BASE_URL) {
        return null;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${API_PROXY_BASE_URL}${normalizedPath}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
}

function notifyProxyConfigurationFallback(message) {
    if (hasShownProxyConfigurationWarning) {
        return;
    }

    hasShownProxyConfigurationWarning = true;
    console.warn(message);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            showNotification(message, 'error');
        }, { once: true });
        return;
    }

    showNotification(message, 'error');
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showLandingPage();
    updateFavoritesCount();
    setupEventListeners();
});

// Smart Back Button Handler
function handleBackButton() {
    closeRecipeView();
}

// Enhanced Navigation Functions
function showLandingPage() {
    hideAllPages();
    document.getElementById('landing-page').classList.add('active');
    currentPage = 'landing';
    window.fromFavorites = false;
    document.getElementById('close-recipe-btn').style.display = 'none';
}

function showIngredientPage() {
    hideAllPages();
    document.getElementById('ingredient-page').classList.add('active');
    currentPage = 'ingredient';
    // Reset the favorites flag when going to ingredients page
    window.fromFavorites = false;
    document.getElementById('close-recipe-btn').style.display = 'none';
}

function showRecipePage() {
    hideAllPages();
    document.getElementById('recipe-page').classList.add('active');
    currentPage = 'recipe';
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Ingredient Management
function addIngredient() {
    ingredientCount++;
    const ingredientsList = document.getElementById('ingredients-list');
    const newIngredientItem = document.createElement('div');
    newIngredientItem.className = 'ingredient-item';
    newIngredientItem.innerHTML = `
        <input type="text" class="ingredient-input" placeholder="Ingredient ${ingredientCount} (e.g., chicken, onion, garlic)">
        <button class="remove-ingredient" onclick="removeIngredient(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    ingredientsList.appendChild(newIngredientItem);
    
    // Focus on the new input
    newIngredientItem.querySelector('.ingredient-input').focus();
}

function removeIngredient(button) {
    const ingredientItem = button.closest('.ingredient-item');
    ingredientItem.style.animation = 'slideInUp 0.3s ease reverse';
    setTimeout(() => {
        ingredientItem.remove();
        updateIngredientPlaceholders();
    }, 300);
}

function updateIngredientPlaceholders() {
    const ingredientInputs = document.querySelectorAll('.ingredient-input');
    ingredientInputs.forEach((input, index) => {
        input.placeholder = `Ingredient ${index + 1} (e.g., chicken, onion, garlic)`;
    });
    ingredientCount = ingredientInputs.length;
}

function getIngredients() {
    const inputs = document.querySelectorAll('.ingredient-input');
    const ingredients = [];
    inputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            ingredients.push(value);
        }
    });
    return ingredients;
}

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Recipe Generation
async function generateRecipe() {
    const ingredients = getIngredients();
    const servings = parseInt(document.getElementById('servings-input').value) || 4;
    
    if (ingredients.length === 0) {
        alert('Please enter at least one ingredient.');
        return;
    }
    
    showLoading();
    
    try {
        // Generate recipe using GROQ API
        const recipe = await generateRecipeWithGroq(ingredients, servings);
        
        // Get YouTube video
        const videoId = await getYouTubeVideo(recipe.title);
        
        // Store current recipe with servings
        currentRecipe = {
            ...recipe,
            videoId: videoId,
            ingredients: ingredients,
            servings: servings
        };
        
        // Display recipe
        displayRecipe(currentRecipe);
        showRecipePage();
        
    } catch (error) {
        console.error('Error generating recipe:', error);
        alert('There was an error generating the recipe. Please try again.');
    } finally {
        hideLoading();
    }
}

async function generateRecipeWithGroq(ingredients, servings = 4) {
    const prompt = `Create an authentic Indian recipe using these ingredients: ${ingredients.join(', ')}. 
    The recipe should serve ${servings} people.
    
    Please provide a response in JSON format with the following structure:
    {
        "title": "Recipe name",
        "description": "Brief description",
        "prepTime": 15,
        "cookTime": 30,
        "totalTime": 45,
        "servings": ${servings},
        "ingredients": ["2 cups rice", "1 cup lentils", "1 onion diced", "2 tomatoes chopped"],
        "instructions": ["Heat oil in pan", "Add onions and sauté until golden", "Add tomatoes and cook until soft"],
        "tips": "Cook on medium heat for best results",
        "difficulty": "medium",
        "nutrition": {
            "calories": 350,
            "protein": 25,
            "carbs": 45,
            "fat": 12,
            "fiber": 8
        }
    }
    
    Make sure the recipe is authentic Indian cuisine, instructions are clear step-by-step, all numeric values are actual numbers, and nutritional information is realistic for ${servings} servings.`;

    if (!API_PROXY_BASE_URL) {
        notifyProxyConfigurationFallback('AI recipe proxy is not configured. Showing an offline fallback recipe instead.');
        return createFallbackRecipe(ingredients, servings);
    }

    try {
        const response = await fetch(buildProxyUrl('/recipe'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                mode: 'ingredients',
                ingredients,
                servings
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Recipe API Error: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        const content = typeof data.recipe === 'object'
            ? JSON.stringify(data.recipe)
            : data.content || data.choices?.[0]?.message?.content || JSON.stringify(data);
        
        try {
            const recipe = JSON.parse(content);
            
            // Validate and fix recipe structure
            if (!recipe.title) recipe.title = "Delicious Indian Dish";
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
                recipe.ingredients = ingredients.map(ing => `1 cup ${ing}`);
            }
            if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
                recipe.instructions = [
                    "Heat oil in a pan over medium heat",
                    "Add spices and sauté for 30 seconds",
                    "Add main ingredients and cook thoroughly",
                    "Garnish with fresh herbs and serve hot"
                ];
            }
            
            // Ensure numeric values
            recipe.prepTime = parseInt(recipe.prepTime) || 15;
            recipe.cookTime = parseInt(recipe.cookTime) || 30;
            recipe.totalTime = parseInt(recipe.totalTime) || (recipe.prepTime + recipe.cookTime);
            recipe.servings = parseInt(recipe.servings) || servings;
            
            // Generate nutrition if not provided
            if (!recipe.nutrition) {
                recipe.nutrition = generateNutritionInfo(recipe.ingredients, recipe.servings);
            }
            
            return recipe;
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Fallback recipe if JSON parsing fails
            return createFallbackRecipe(ingredients, servings);
        }
    } catch (error) {
        console.error('Recipe Generation Error:', error);
        return createFallbackRecipe(ingredients, servings);
    }
}

// Generate realistic nutritional information
function generateNutritionInfo(ingredients, servings) {
    const baseCalories = 200 + (ingredients.length * 50);
    const baseProtein = 10 + (ingredients.length * 3);
    const baseCarbs = 20 + (ingredients.length * 8);
    const baseFat = 8 + (ingredients.length * 2);
    const baseFiber = 3 + (ingredients.length * 1);
    
    return {
        calories: Math.floor(baseCalories * (servings / 4)),
        protein: Math.floor(baseProtein * (servings / 4)),
        carbs: Math.floor(baseCarbs * (servings / 4)),
        fat: Math.floor(baseFat * (servings / 4)),
        fiber: Math.floor(baseFiber * (servings / 4))
    };
}

function createFallbackRecipe(ingredients, servings = 4) {
    const ingredientList = ingredients.map(ing => `1 cup ${ing}`).join(', ');
    return {
        title: "Quick Indian Stir Fry",
        description: `A simple and delicious Indian dish made with ${ingredientList}`,
        prepTime: 10,
        cookTime: 20,
        totalTime: 30,
        servings: servings,
        ingredients: [
            "2 tablespoons oil",
            "1 teaspoon cumin seeds",
            "1 onion, finely chopped",
            "2 tomatoes, chopped",
            ingredientList,
            "1 teaspoon turmeric powder",
            "1 teaspoon red chili powder",
            "Salt to taste",
            "Fresh coriander leaves for garnish"
        ],
        instructions: [
            "Heat oil in a pan over medium heat",
            "Add cumin seeds and let them splutter",
            "Add chopped onions and sauté until golden brown",
            "Add tomatoes and cook until they become soft and mushy",
            "Add turmeric powder, red chili powder, and salt",
            "Add the main ingredients and mix well",
            "Cover and cook for 15-20 minutes, stirring occasionally",
            "Garnish with fresh coriander leaves and serve hot with rice or roti"
        ],
        tips: "Adjust spices according to your taste preference. For extra flavor, add ginger-garlic paste.",
        difficulty: "easy",
        nutrition: generateNutritionInfo(ingredients, servings)
    };
}

async function getYouTubeVideo(recipeTitle) {
    if (!API_PROXY_BASE_URL) {
        return null;
    }

    const query = `${recipeTitle} Indian recipe cooking tutorial`;
    const url = buildProxyUrl('/youtube-search', {
        q: query,
        maxResults: '1'
    });
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API Error: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            return data.items[0].id.videoId;
        }
        return null;
    } catch (error) {
        console.error('Error fetching YouTube video:', error);
        return null;
    }
}

// Close Recipe View Function
function closeRecipeView() {
    if (window.fromFavorites) {
        // If we came from favorites, go back to landing page
        showLandingPage();
        window.fromFavorites = false;
    } else {
        // Otherwise go back to ingredients page
        showIngredientPage();
    }
    
    // Hide the close button
    document.getElementById('close-recipe-btn').style.display = 'none';
    
    // Reset timer when closing recipe
    resetTimer();
}

// Enhanced displayRecipe function
function displayRecipe(recipe) {
    const container = document.getElementById('recipe-container');
    const isBookmarked = favorites.some(fav => fav.title === recipe.title);
    
    // Show close button if we came from favorites
    const closeBtn = document.getElementById('close-recipe-btn');
    if (window.fromFavorites) {
        closeBtn.style.display = 'flex';
    } else {
        closeBtn.style.display = 'none';
    }
    
    // Add favorites-view class if coming from favorites
    const recipeCardClass = window.fromFavorites ? 'recipe-card favorites-view' : 'recipe-card';
    
    // Calculate nutrition per serving
    const nutritionPerServing = recipe.nutrition ? {
        calories: Math.round(recipe.nutrition.calories / recipe.servings),
        protein: Math.round(recipe.nutrition.protein / recipe.servings * 10) / 10,
        carbs: Math.round(recipe.nutrition.carbs / recipe.servings * 10) / 10,
        fat: Math.round(recipe.nutrition.fat / recipe.servings * 10) / 10,
        fiber: Math.round(recipe.nutrition.fiber / recipe.servings * 10) / 10
    } : null;
    
    container.innerHTML = `
        <div class="${recipeCardClass}">
            <div class="recipe-header">
                <div>
                    <h2 class="recipe-title">${recipe.title}</h2>
                    <div class="recipe-time">
                        <i class="fas fa-clock"></i>
                        <span>${recipe.totalTime || recipe.cookTime || '30'} minutes</span>
                    </div>
                    <div class="recipe-servings">
                        <i class="fas fa-users"></i>
                        <span>Serves ${recipe.servings || 4} people</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark()">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="share-btn" onclick="shareRecipe()" title="Share Recipe">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="print-btn" onclick="printRecipe()" title="Print Recipe">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </div>
            
            ${recipe.description ? `
                <div class="recipe-section">
                    <p>${recipe.description}</p>
                </div>
            ` : ''}
            
            ${nutritionPerServing ? `
                <div class="recipe-section">
                    <h3>Nutritional Information</h3>
                    <div class="nutrition-details">
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <span class="nutrition-value">${nutritionPerServing.calories}</span>
                                <span class="nutrition-label">Calories</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-value">${nutritionPerServing.protein}g</span>
                                <span class="nutrition-label">Protein</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-value">${nutritionPerServing.carbs}g</span>
                                <span class="nutrition-label">Carbs</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-value">${nutritionPerServing.fat}g</span>
                                <span class="nutrition-label">Fat</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-value">${nutritionPerServing.fiber}g</span>
                                <span class="nutrition-label">Fiber</span>
                            </div>
                        </div>
                        <div class="nutrition-per-serving">
                            <i class="fas fa-info-circle"></i>
                            Per serving (Total: ${recipe.nutrition.calories} calories for ${recipe.servings} servings)
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="recipe-section">
                <h3>Ingredients</h3>
                <div class="ingredients-grid">
                    ${recipe.ingredients.map(ing => `
                        <div class="ingredient-chip">${ing}</div>
                    `).join('')}
                </div>
                <button class="shopping-list-btn" onclick="generateShoppingList()">
                    <i class="fas fa-shopping-cart"></i>
                    Generate Shopping List
                </button>
            </div>
            
            <div class="recipe-actions-bar">
                <button class="nutrition-btn" onclick="showDetailedNutrition()">
                    <i class="fas fa-chart-pie"></i>
                    Detailed Nutrition
                </button>
                <button class="remix-btn" onclick="showRecipeRemixOptions()">
                    <i class="fas fa-magic"></i>
                    Remix Recipe
                </button>
                <button class="step-by-step-btn" onclick="startStepByStepMode()">
                    <i class="fas fa-list-ol"></i>
                    Step-by-Step
                </button>
                <button class="print-btn" onclick="printRecipe()">
                    <i class="fas fa-print"></i>
                    Print Recipe
                </button>
                <button class="share-btn" onclick="shareRecipe()">
                    <i class="fas fa-share"></i>
                    Share Recipe
                </button>
            </div>
            
            <div class="recipe-section">
                <h3>Instructions</h3>
                <div class="instructions-list">
                    ${recipe.instructions.map((instruction, index) => `
                        <div class="instruction-step">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-text">${instruction}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${recipe.tips ? `
                <div class="recipe-section">
                    <h3>Cooking Tips</h3>
                    <p>${recipe.tips}</p>
                </div>
            ` : ''}
            
            <div class="recipe-section">
                <h3>Rate This Recipe</h3>
                <div class="rating-container">
                    ${[1,2,3,4,5].map(rating => `
                        <button class="rating-star" onclick="rateRecipe(${rating})" title="${rating} star${rating > 1 ? 's' : ''}">
                            <i class="fas fa-star"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            ${recipe.videoId ? `
                <div class="recipe-section">
                    <h3>Video Tutorial</h3>
                    <div class="video-container ${window.fromFavorites ? 'enhanced' : ''}">
                        <iframe src="https://www.youtube.com/embed/${recipe.videoId}" 
                                frameborder="0" 
                                allowfullscreen>
                        </iframe>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Load saved rating for this recipe
    loadRecipeRating(recipe.title);
}

// Load saved recipe rating
function loadRecipeRating(recipeTitle) {
    const ratings = JSON.parse(localStorage.getItem('ratings')) || {};
    const savedRating = ratings[recipeTitle];
    
    if (savedRating) {
        const stars = document.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            if (index < savedRating) {
                star.classList.add('active');
            }
        });
    }
}

// Timer Functions
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            timerSeconds++;
            updateTimerDisplay();
        }, 1000);
        
        // Add visual feedback
        document.querySelector('.start-timer').style.background = '#2e7d32';
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timerInterval);
        document.querySelector('.start-timer').style.background = '#4caf50';
    }
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerSeconds = 0;
    updateTimerDisplay();
    document.querySelector('.start-timer').style.background = '#4caf50';
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer-text').textContent = display;
    
    // Add warning when timer reaches certain times
    if (timerSeconds === 300) { // 5 minutes
        document.querySelector('.timer-display').style.color = '#ff9800';
    } else if (timerSeconds === 600) { // 10 minutes
        document.querySelector('.timer-display').style.color = '#f44336';
    }
}

// Favorites Management
function toggleBookmark() {
    if (!currentRecipe) return;
    
    const index = favorites.findIndex(fav => fav.title === currentRecipe.title);
    
    if (index > -1) {
        favorites.splice(index, 1);
        document.querySelector('.bookmark-btn').classList.remove('bookmarked');
    } else {
        favorites.push(currentRecipe);
        document.querySelector('.bookmark-btn').classList.add('bookmarked');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

function updateFavoritesCount() {
    const countElements = document.querySelectorAll('.favorites-count');
    countElements.forEach(element => {
        element.textContent = favorites.length;
    });
}

function showFavorites() {
    const modal = document.getElementById('favorites-modal');
    const favoritesList = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="text-align: center; color: #666;">No favorite recipes yet!</p>';
    } else {
        favoritesList.innerHTML = favorites.map((recipe, index) => `
            <div class="favorite-item">
                <div class="favorite-info">
                    <h4>${recipe.title}</h4>
                    <p>${recipe.totalTime || recipe.cookTime || '30'} minutes • ${recipe.difficulty || 'Medium'}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="nav-btn" onclick="viewFavoriteRecipe(${index})" style="padding: 0.5rem 1rem;">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="remove-favorite" onclick="removeFavorite(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
}

function closeFavorites() {
    document.getElementById('favorites-modal').classList.remove('active');
}

function viewFavoriteRecipe(index) {
    currentRecipe = favorites[index];
    displayRecipe(currentRecipe);
    closeFavorites();
    showRecipePage();
    // Set a flag to track that we came from favorites
    window.fromFavorites = true;
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    showFavorites(); // Refresh the modal
}

// Loading Overlay
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

// Event Listeners
function setupEventListeners() {
    // Close modal when clicking outside
    document.getElementById('favorites-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeFavorites();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.active');
            if (modal) {
                closeFavorites();
            } else if (currentPage === 'recipe') {
                closeRecipeView();
            }
        }

        if (e.key === 'Enter' && currentPage === 'ingredient') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('ingredient-input')) {
                addIngredient();
            }
        }
    });

    // Mobile swipe gestures for recipe view
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (currentPage === 'recipe') {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > swipeThreshold && diff > 0) {
                closeRecipeView();
            }
        }
    });
}

// Utility Functions
function formatRecipeTime(minutes) {
    if (!minutes) return '30 minutes';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
}

// Additional Features

// Search functionality
function searchRecipes() {
    showSearchModal();
}

function showSearchModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('search-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create search modal
    const modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content search-modal-content">
            <div class="modal-header">
                <h2>Search Recipes</h2>
                <button class="close-modal" onclick="closeSearchModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="search-input-container">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" id="search-input" placeholder="Search for recipes by name, ingredient, or cuisine..." 
                               onkeypress="handleSearchInputKeypress(event)" 
                               oninput="performLiveSearch()">
                        <button class="search-clear-btn" onclick="clearSearchInput()" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="search-filters">
                    <div class="filter-chips">
                        <button class="filter-chip active" data-filter="all" onclick="setSearchFilter('all')">All</button>
                        <button class="filter-chip" data-filter="favorites" onclick="setSearchFilter('favorites')">Favorites</button>
                        <button class="filter-chip" data-filter="recent" onclick="setSearchFilter('recent')">Recent</button>
                    </div>
                </div>
                <div class="search-results" id="search-results">
                    <div class="search-placeholder">
                        <i class="fas fa-search"></i>
                        <p>Start typing to search recipes...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on search input
    setTimeout(() => {
        document.getElementById('search-input').focus();
    }, 100);
}

function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.remove();
    }
}

function handleSearchInputKeypress(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performLiveSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    const clearBtn = document.querySelector('.search-clear-btn');
    
    if (searchTerm) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
        showSearchPlaceholder();
        return;
    }
    
    const activeFilter = document.querySelector('.filter-chip.active').dataset.filter;
    let results = [];
    
    if (activeFilter === 'all') {
        results = searchInAllRecipes(searchTerm);
    } else if (activeFilter === 'favorites') {
        results = searchInFavorites(searchTerm);
    } else if (activeFilter === 'recent') {
        results = searchInRecent(searchTerm);
    }
    
    displaySearchResults(results);
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    if (!searchTerm) return;
    
    performLiveSearch();
}

function clearSearchInput() {
    document.getElementById('search-input').value = '';
    const clearBtn = document.querySelector('.search-clear-btn');
    clearBtn.style.display = 'none';
    showSearchPlaceholder();
}

function showSearchPlaceholder() {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = `
        <div class="search-placeholder">
            <i class="fas fa-search"></i>
            <p>Start typing to search recipes...</p>
        </div>
    `;
}

function setSearchFilter(filter) {
    // Update active filter chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Re-perform search with new filter
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm) {
        performLiveSearch();
    }
}

function searchInAllRecipes(searchTerm) {
    // Search in favorites
    const favoriteResults = searchInFavorites(searchTerm);
    
    // You can add more search sources here (e.g., search history, API search)
    return favoriteResults;
}

function searchInFavorites(searchTerm) {
    return favorites.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

function searchInRecent(searchTerm) {
    // Get recent recipes from localStorage
    const recentRecipes = JSON.parse(localStorage.getItem('recentRecipes') || '[]');
    return recentRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No recipes found matching "${document.getElementById('search-input').value}"</p>
                <p>Try different keywords or check your spelling.</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = results.map((recipe, index) => `
        <div class="search-result-item" onclick="viewSearchResult(${favorites.indexOf(recipe)})">
            <div class="result-content">
                <h3>${recipe.title}</h3>
                <p>${recipe.description || 'No description available'}</p>
                <div class="result-meta">
                    <span class="result-time">
                        <i class="fas fa-clock"></i>
                        ${recipe.totalTime || recipe.cookTime || '30'} minutes
                    </span>
                    <span class="result-difficulty">
                        <i class="fas fa-signal"></i>
                        ${recipe.difficulty || 'Medium'}
                    </span>
                    <span class="result-servings">
                        <i class="fas fa-users"></i>
                        Serves ${recipe.servings || 4}
                    </span>
                </div>
                <div class="result-actions">
                    <button class="result-btn view-btn" onclick="viewSearchResult(${favorites.indexOf(recipe)})">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="result-btn favorite-btn ${favorites.some(fav => fav.title === recipe.title) ? 'favorited' : ''}" 
                            onclick="toggleFavoriteFromSearch(${favorites.indexOf(recipe)})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewSearchResult(index) {
    if (index >= 0 && index < favorites.length) {
        currentRecipe = favorites[index];
        displayRecipe(currentRecipe);
        closeSearchModal();
        showRecipePage();
        window.fromFavorites = true;
        
        // Add to recent recipes
        addToRecentRecipes(currentRecipe);
    }
}

function toggleFavoriteFromSearch(index) {
    if (index >= 0 && index < favorites.length) {
        const recipe = favorites[index];
        toggleBookmark();
        // Update the search result display
        displaySearchResults(searchInAllRecipes(document.getElementById('search-input').value.trim()));
    }
}

function addToRecentRecipes(recipe) {
    const recentRecipes = JSON.parse(localStorage.getItem('recentRecipes') || '[]');
    
    // Remove if already exists
    const existingIndex = recentRecipes.findIndex(r => r.title === recipe.title);
    if (existingIndex !== -1) {
        recentRecipes.splice(existingIndex, 1);
    }
    
    // Add to beginning
    recentRecipes.unshift({
        ...recipe,
        timestamp: Date.now()
    });
    
    // Keep only last 10 recent recipes
    if (recentRecipes.length > 10) {
        recentRecipes.splice(10);
    }
    
    localStorage.setItem('recentRecipes', JSON.stringify(recentRecipes));
}

// Dietary Filters Functions
function showDietaryFilters() {
    document.getElementById('dietary-filters-modal').classList.add('active');
    
    // Load saved filters
    const savedFilters = JSON.parse(localStorage.getItem('dietaryFilters')) || [];
    savedFilters.forEach(filter => {
        const checkbox = document.getElementById(filter);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

function closeDietaryFilters() {
    document.getElementById('dietary-filters-modal').classList.remove('active');
}

function applyDietaryFilters() {
    dietaryFilters = [];
    const checkboxes = document.querySelectorAll('.dietary-option input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        dietaryFilters.push(checkbox.value);
    });
    
    // Save filters to localStorage
    localStorage.setItem('dietaryFilters', JSON.stringify(dietaryFilters));
    
    closeDietaryFilters();
    
    // Show confirmation
    if (dietaryFilters.length > 0) {
        showNotification(`Dietary filters applied: ${dietaryFilters.join(', ')}`);
    }
    
    // If on ingredient page, regenerate recipe with filters
    if (currentPage === 'ingredient') {
        const ingredients = getIngredients();
        if (ingredients.length > 0) {
            generateRecipe();
        }
    }
}

// Meal Planner Functions
function showMealPlanner() {
    document.getElementById('meal-planner-modal').classList.add('active');
    loadMealPlan();
}

function closeMealPlanner() {
    document.getElementById('meal-planner-modal').classList.remove('active');
}

function loadMealPlan() {
    const savedMealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
    mealPlan = savedMealPlan;
    
    // Display saved meal plan
    Object.keys(mealPlan).forEach(day => {
        const dayColumn = document.querySelector(`[data-day="${day}"]`);
        if (dayColumn) {
            Object.keys(mealPlan[day]).forEach(meal => {
                const mealSlot = dayColumn.querySelector(`[data-meal="${meal}"]`);
                if (mealSlot && mealPlan[day][meal]) {
                    mealSlot.innerHTML = `
                        <i class="fas fa-${getMealIcon(meal)}"></i>
                        <span>${mealPlan[day][meal].title}</span>
                        <button class="remove-meal-btn" onclick="removeMealFromPlan('${day}', '${meal}')">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    mealSlot.classList.add('has-meal');
                }
            });
        }
    });
}

function getMealIcon(meal) {
    const icons = {
        breakfast: 'sun',
        lunch: 'cloud-sun',
        dinner: 'moon'
    };
    return icons[meal] || 'utensils';
}

function generateMealPlan() {
    showLoading();
    
    // Generate a simple meal plan for the week
    const days = ['monday', 'tuesday'];
    const meals = ['breakfast', 'lunch', 'd dinner'];
    const mealPlan = {};
    
    days.forEach(day => {
        mealPlan[day] = {};
        meals.forEach(meal => {
            mealPlan[day][meal] = {
                title: generateMealTitle(meal),
                recipe: null
            };
        });
    });
    
    // Save meal plan
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    loadMealPlan();
    hideLoading();
    
    showNotification('Meal plan generated successfully!');
}

function generateMealTitle(meal) {
    const mealTitles = {
        breakfast: ['Pancakes', 'Oatmeal', 'Eggs Benedict', 'French Toast', 'Smoothie Bowl'],
        lunch: ['Caesar Salad', 'Grilled Cheese', 'Chicken Wrap', 'Pasta Primavera', 'Veggie Stir Fry'],
        dinner: ['Roasted Chicken', 'Beef Stir Fry', 'Fish Curry', 'Vegetable Curry', 'Pasta Carbonara']
    };
    
    const titles = mealTitles[meal] || ['Delicious Dish'];
    return titles[Math.floor(Math.random() * titles.length)];
}

function removeMealFromPlan(day, meal) {
    if (mealPlan[day] && mealPlan[day][meal]) {
        delete mealPlan[day][meal];
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        loadMealPlan();
    }
}

function generateGroceryListFromPlan() {
    const allIngredients = [];
    
    Object.values(mealPlan).forEach(day => {
        Object.values(day).forEach(meal => {
            if (meal && meal.recipe && meal.recipe.ingredients) {
                allIngredients.push(...meal.recipe.ingredients);
            }
        });
    });
    
    // Remove duplicates
    const uniqueIngredients = [...new Set(allIngredients)];
    
    const listText = `Grocery List for Weekly Meal Plan:\n\n${uniqueIngredients.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Weekly Grocery List',
            text: listText
        });
    } else {
        navigator.clipboard.writeText(listText).then(() => {
            showNotification('Grocery list copied to clipboard!');
        });
    }
}

// AI Chat Assistant Functions
function showChatAssistant() {
    document.getElementById('chat-assistant-modal').classList.add('active');
    
    // Load chat history
    loadChatHistory();
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('chat-input').focus();
    }, 100);
}

function closeChatAssistant() {
    document.getElementById('chat-assistant-modal').classList.remove('active');
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Add typing indicator
    addChatMessage('...', 'ai', true);
    
    // Generate AI response
    setTimeout(() => {
        generateAIResponse(message);
    }, 1000);
}

function handleChatInputKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function addChatMessage(message, sender, isTyping = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `${sender}-message ${isTyping ? 'typing' : ''}`;
    
    messageElement.innerHTML = `
        <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        <p>${message}</p>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to history if not typing
    if (!isTyping) {
        chatHistory.push({ message, sender, timestamp: Date.now() });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
}

function generateAIResponse(userMessage) {
    // Remove typing indicator
    const typingMessage = document.querySelector('.ai-message.typing');
    if (typingMessage) {
        typingMessage.remove();
    }
    
    // Generate contextual response
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('substitute') || lowerMessage.includes('replace')) {
        response = 'For ingredient substitutions, try these alternatives:\n\n🥥 For meat: Chicken → Tofu, Paneer, or Mushrooms\n🥛 For dairy: Almond milk, coconut milk, or cashew cream\n🌾 For wheat: Rice flour, almond flour, or quinoa\n🥑 For oil: Avocado oil, coconut oil, or ghee';
    } else if (lowerMessage.includes('how long') || lowerMessage.includes('cook time')) {
        response = 'Cooking times vary by recipe:\n\n🍳 Quick recipes: 15-20 minutes\n🍲 Medium recipes: 30-45 minutes\n🍲 Complex recipes: 45-60 minutes\n\nAlways check for doneness and use a timer for best results!';
    } else if (lowerMessage.includes('temperature') || lowerMessage.includes('heat')) {
        response = 'Temperature guide for Indian cooking:\n\n🔥 High heat: For searing and stir-frying (400-450°F)\n🌡 Medium heat: For simmering and sautéing (300-350°F)\n🔥 Low heat: For gentle cooking (200-250°F)\n\nAdjust based on your stove and recipe requirements.';
    } else if (lowerMessage.includes('spice') || lowerMessage.includes('flavor')) {
        response = 'Essential Indian spices:\n\n🌶️ Must-have: Cumin, Coriander, Turmeric, Garam Masala\n🌶️ Common: Red chili powder, Garam Masala, Cardamom, Cinnamon\n🌶️ Regional: Mustard seeds, Fenugreek, Asafoetida\n\n🌶️ Fresh: Ginger, Garlic, Curry leaves, Coriander';
    } else {
        response = `I can help you with cooking tips, ingredient substitutions, recipe questions, and more! Try asking about:\n\n• Ingredient substitutions\n• Cooking techniques\n• Recipe modifications\n• Time and temperature guidance\n• Spice combinations\n• Storage tips`;
    }
    
    addChatMessage(response, 'ai');
}

function toggleVoiceChat() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('Voice chat is not supported in your browser.');
        return;
    }
    
    if (isVoiceChatActive) {
        // Stop voice recognition
        if (window.voiceRecognition) {
            window.voiceRecognition.stop();
        }
        isVoiceChatActive = false;
        document.querySelector('.voice-chat-btn').classList.remove('active');
    } else {
        // Start voice recognition
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
            sendChatMessage();
        };
        
        recognition.onerror = function(event) {
            console.error('Voice recognition error:', event.error);
            showNotification('Voice input failed. Please try again.');
            isVoiceChatActive = false;
            document.querySelector('.voice-chat-btn').classList.remove('active');
        };
        
        recognition.start();
        isVoiceChatActive = true;
        document.querySelector('.voice-chat-btn').classList.add('active');
        showNotification('Listening... Speak clearly!');
    }
}

function loadChatHistory() {
    const messagesContainer = document.getElementById('chat-messages');
    const savedHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    
    // Clear existing messages except the welcome message
    const welcomeMessage = messagesContainer.querySelector('.ai-message');
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(welcomeMessage);
    
    // Load chat history
    savedHistory.forEach(item => {
        addChatMessage(item.message, item.sender);
    });
}
function shareRecipe() {
    if (!currentRecipe) return;
    
    const shareText = `Check out this amazing Indian recipe: ${currentRecipe.title}\n\nIngredients: ${currentRecipe.ingredients.join(', ')}\n\nCooking time: ${currentRecipe.totalTime} minutes`;
    
    if (navigator.share) {
        navigator.share({
            title: currentRecipe.title,
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Recipe copied to clipboard!');
        });
    }
}

// Print recipe
function printRecipe() {
    if (!currentRecipe) return;
    
    window.print();
}

// Shopping list generator
function generateShoppingList() {
    if (!currentRecipe) return;
    
    const shoppingList = currentRecipe.ingredients.filter(ing => 
        !ing.toLowerCase().includes('salt') && 
        !ing.toLowerCase().includes('water') &&
        !ing.toLowerCase().includes('oil')
    );
    
    const listText = `Shopping List for ${currentRecipe.title}:\n\n${shoppingList.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Shopping List - ${currentRecipe.title}`,
            text: listText
        });
    } else {
        navigator.clipboard.writeText(listText).then(() => {
            alert('Shopping list copied to clipboard!');
        });
    }
}

// Recipe Remix AI Features
async function remixRecipe(remixType) {
    if (!currentRecipe) {
        alert('Please generate a recipe first before remixing.');
        return;
    }
    
    showLoading();
    closeRecipeRemixModal();
    
    try {
        const remixPrompt = getRemixPrompt(remixType, currentRecipe);
        const remixedRecipe = await generateRecipeWithGroq(currentRecipe.ingredients, currentRecipe.servings, remixPrompt);
        
        // Get YouTube video for remixed recipe
        const videoId = await getYouTubeVideo(remixedRecipe.title);
        
        // Store remixed recipe
        currentRecipe = {
            ...remixedRecipe,
            videoId: videoId,
            ingredients: currentRecipe.ingredients,
            servings: currentRecipe.servings,
            originalTitle: currentRecipe.title
        };
        
        // Display remixed recipe
        displayRecipe(currentRecipe);
        showRecipePage();
        
    } catch (error) {
        console.error('Error remixing recipe:', error);
        alert('There was an error remixing the recipe. Please try again.');
    } finally {
        hideLoading();
    }
}

function getRemixPrompt(remixType, recipe) {
    const prompts = {
        healthier: `Make this recipe healthier by reducing calories, fat, and sugar while maintaining great taste. Use more vegetables, whole grains, and lean proteins.`,
        vegan: `Convert this recipe to be completely vegan by removing all animal products (meat, dairy, eggs, honey) and replacing them with plant-based alternatives.`,
        spicy: `Make this recipe spicier by adding more heat and bold Indian spices. Include chili peppers, cayenne, garam masala, and other warming spices.`,
        indian: `Transform this recipe into an authentic Indian dish with traditional Indian spices, cooking techniques, and flavors.`,
        keto: `Convert this recipe to be keto-friendly by removing carbohydrates and using healthy fats, while maintaining great taste.`,
        glutenfree: `Make this recipe completely gluten-free by replacing wheat, flour, and other gluten-containing ingredients with gluten-free alternatives.`
    };
    
    return `Please remix the following recipe: ${recipe.title}. ${prompts[remixType]} 
    
    Original recipe details:
    - Ingredients: ${recipe.ingredients.join(', ')}
    - Instructions: ${recipe.instructions.join(' ')}
    
    Please provide the remixed recipe in the same JSON format with updated ingredients and instructions.`;
}

// Recipe Remix Modal Functions
function showRecipeRemixOptions() {
    document.getElementById('recipe-remix-modal').classList.add('active');
}

function closeRecipeRemixModal() {
    document.getElementById('recipe-remix-modal').classList.remove('active');
}

// Multi-Timer System
function showMultiTimer() {
    document.getElementById('multi-timer-container').style.display = 'block';
    if (multiTimers.length === 0) {
        // Add a default timer if none exist
        addNewTimer();
    }
}

function closeMultiTimer() {
    document.getElementById('multi-timer-container').style.display = 'none';
}

function addNewTimer() {
    const timerId = Date.now();
    const timer = {
        id: timerId,
        name: `Timer ${multiTimers.length + 1}`,
        seconds: 0,
        isRunning: false,
        interval: null
    };
    
    multiTimers.push(timer);
    renderMultiTimers();
}

function renderMultiTimers() {
    const container = document.getElementById('multi-timers-list');
    container.innerHTML = multiTimers.map(timer => `
        <div class="multi-timer-item" data-timer-id="${timer.id}">
            <div class="timer-info">
                <input type="text" class="timer-name" value="${timer.name}" 
                       onchange="updateTimerName(${timer.id}, this.value)">
                <div class="timer-display-small">
                    <span class="timer-time">${formatTime(timer.seconds)}</span>
                </div>
            </div>
            <div class="timer-controls-small">
                <button class="timer-btn-small ${timer.isRunning ? 'pause' : 'start'}" 
                        onclick="toggleMultiTimer(${timer.id})">
                    <i class="fas fa-${timer.isRunning ? 'pause' : 'play'}"></i>
                </button>
                <button class="timer-btn-small reset" onclick="resetMultiTimer(${timer.id})">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="timer-btn-small delete" onclick="deleteMultiTimer(${timer.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateTimerName(timerId, newName) {
    const timer = multiTimers.find(t => t.id === timerId);
    if (timer) {
        timer.name = newName;
    }
}

function toggleMultiTimer(timerId) {
    const timer = multiTimers.find(t => t.id === timerId);
    if (!timer) return;
    
    if (timer.isRunning) {
        // Pause timer
        timer.isRunning = false;
        clearInterval(timer.interval);
    } else {
        // Start timer
        timer.isRunning = true;
        timer.interval = setInterval(() => {
            timer.seconds++;
            updateMultiTimerDisplay(timerId);
        }, 1000);
    }
    
    renderMultiTimers();
}

function resetMultiTimer(timerId) {
    const timer = multiTimers.find(t => t.id === timerId);
    if (timer) {
        timer.isRunning = false;
        clearInterval(timer.interval);
        timer.seconds = 0;
        updateMultiTimerDisplay(timerId);
        renderMultiTimers();
    }
}

function deleteMultiTimer(timerId) {
    const timerIndex = multiTimers.findIndex(t => t.id === timerId);
    if (timerIndex !== -1) {
        const timer = multiTimers[timerIndex];
        clearInterval(timer.interval);
        multiTimers.splice(timerIndex, 1);
        renderMultiTimers();
    }
}

function updateMultiTimerDisplay(timerId) {
    const timer = multiTimers.find(t => t.id === timerId);
    if (!timer) return;
    
    const timerElement = document.querySelector(`[data-timer-id="${timerId}"] .timer-time`);
    if (timerElement) {
        timerElement.textContent = formatTime(timer.seconds);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Step-by-Step Cooking Mode
function startStepByStepMode() {
    if (!currentRecipe || !currentRecipe.instructions) {
        alert('No recipe instructions available. Please generate a recipe first.');
        return;
    }
    
    currentStepIndex = 0;
    updateStepDisplay();
    document.getElementById('step-by-step-modal').classList.add('active');
}

function closeStepByStepMode() {
    document.getElementById('step-by-step-modal').classList.remove('active');
}

function updateStepDisplay() {
    if (!currentRecipe || !currentRecipe.instructions) return;
    
    const instructions = currentRecipe.instructions;
    const currentStep = instructions[currentStepIndex];
    
    // Update step content
    document.getElementById('step-title').textContent = `Step ${currentStepIndex + 1}`;
    document.getElementById('step-instruction').textContent = currentStep;
    
    // Update step counter
    document.getElementById('step-counter').textContent = `Step ${currentStepIndex + 1} of ${instructions.length}`;
    
    // Update progress bar
    const progressFill = document.getElementById('step-progress-fill');
    const progressPercentage = ((currentStepIndex + 1) / instructions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    
    // Update navigation buttons
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    prevBtn.disabled = currentStepIndex === 0;
    nextBtn.disabled = currentStepIndex === instructions.length - 1;
    
    if (currentStepIndex === instructions.length - 1) {
        nextBtn.innerHTML = 'Finish <i class="fas fa-check"></i>';
    } else {
        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    }
}

function nextStep() {
    if (!currentRecipe || !currentRecipe.instructions) return;
    
    if (currentStepIndex < currentRecipe.instructions.length - 1) {
        currentStepIndex++;
        updateStepDisplay();
    } else {
        // Finished all steps
        closeStepByStepMode();
        alert('Congratulations! You have completed all the cooking steps!');
    }
}

function previousStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        updateStepDisplay();
    }
}
function showDetailedNutrition() {
    if (!currentRecipe) {
        alert('No recipe currently loaded. Please generate a recipe first.');
        return;
    }
    
    if (!currentRecipe.nutrition) {
        alert('Nutritional information not available for this recipe.');
        return;
    }
    
    try {
        const nutrition = currentRecipe.nutrition;
        const servings = currentRecipe.servings || 4;
        const perServing = {
            calories: Math.round(nutrition.calories / servings),
            protein: Math.round(nutrition.protein / servings * 10) / 10,
            carbs: Math.round(nutrition.carbs / servings * 10) / 10,
            fat: Math.round(nutrition.fat / servings * 10) / 10,
            fiber: Math.round(nutrition.fiber / servings * 10) / 10
        };
        
        const dailyValues = {
            calories: 2000,
            protein: 50,
            carbs: 300,
            fat: 65,
            fiber: 25
        };
        
        const percentages = {
            calories: Math.round((perServing.calories / dailyValues.calories) * 100),
            protein: Math.round((perServing.protein / dailyValues.protein) * 100),
            carbs: Math.round((perServing.carbs / dailyValues.carbs) * 100),
            fat: Math.round((perServing.fat / dailyValues.fat) * 100),
            fiber: Math.round((perServing.fiber / dailyValues.fiber) * 100)
        };
        
        const nutritionMessage = `📊 Detailed Nutritional Information\n\n` +
              `🍽️ Per Serving (${servings} servings total):\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `🔥 Calories: ${perServing.calories} kcal (${percentages.calories}% DV)\n` +
              `💪 Protein: ${perServing.protein}g (${percentages.protein}% DV)\n` +
              `🍞 Carbohydrates: ${perServing.carbs}g (${percentages.carbs}% DV)\n` +
              `🥑 Fat: ${perServing.fat}g (${percentages.fat}% DV)\n` +
              `🌾 Fiber: ${perServing.fiber}g (${percentages.fiber}% DV)\n\n` +
              `📈 Total Recipe (${servings} servings):\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `🔥 Total Calories: ${nutrition.calories} kcal\n` +
              `💪 Total Protein: ${nutrition.protein}g\n` +
              `🍞 Total Carbs: ${nutrition.carbs}g\n` +
              `🥑 Total Fat: ${nutrition.fat}g\n` +
              `🌾 Total Fiber: ${nutrition.fiber}g\n\n` +
              `💡 Daily Values (DV) based on 2,000 calorie diet\n` +
              `*Values are estimates and may vary based on ingredients`;
        
        // Use a safer way to display the message
        console.log('Nutrition Info:', nutritionMessage);
        
        // Create a modal instead of alert for better UX
        showNutritionModal(nutritionMessage);
        
    } catch (error) {
        console.error('Error showing nutrition:', error);
        alert('Error displaying nutritional information. Please try again.');
    }
}

// Create a nutrition modal for better display
function showNutritionModal(message) {
    // Remove existing modal if any
    const existingModal = document.getElementById('nutrition-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'nutrition-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content nutrition-modal-content">
            <div class="modal-header">
                <h2>Nutritional Information</h2>
                <button class="close-modal" onclick="closeNutritionModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <pre style="white-space: pre-line; font-family: 'Poppins', sans-serif; line-height: 1.6;">${message}</pre>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close nutrition modal
function closeNutritionModal() {
    const modal = document.getElementById('nutrition-modal');
    if (modal) {
        modal.remove();
    }
}

// Update the old showNutritionalInfo function
function showNutritionalInfo() {
    showDetailedNutrition();
}

// Rating system
function rateRecipe(rating) {
    if (!currentRecipe) return;
    
    // Save rating to localStorage
    const ratings = JSON.parse(localStorage.getItem('ratings')) || {};
    ratings[currentRecipe.title] = rating;
    localStorage.setItem('ratings', JSON.stringify(ratings));
    
    alert(`You rated ${currentRecipe.title} ${rating} stars!`);
}

// Voice input for ingredients
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input is not supported in your browser.');
        return;
    }
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        addVoiceIngredient(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        alert('Voice input failed. Please try again.');
    };
    
    recognition.start();
    alert('Listening for ingredients... Speak clearly and say "add ingredient" followed by the ingredient name.');
}

function addVoiceIngredient(transcript) {
    const ingredientsList = document.getElementById('ingredients-list');
    const inputs = ingredientsList.querySelectorAll('.ingredient-input');
    const emptyInput = Array.from(inputs).find(input => !input.value.trim());
    
    if (emptyInput) {
        // Extract ingredient from transcript
        const ingredientMatch = transcript.match(/add ingredient (.+)/i);
        if (ingredientMatch) {
            emptyInput.value = ingredientMatch[1].trim();
            emptyInput.focus();
        }
    } else {
        addIngredient();
        setTimeout(() => {
            const newInputs = ingredientsList.querySelectorAll('.ingredient-input');
            const lastInput = newInputs[newInputs.length - 1];
            const ingredientMatch = transcript.match(/add ingredient (.+)/i);
            if (ingredientMatch) {
                lastInput.value = ingredientMatch[1].trim();
                lastInput.focus();
            }
        }, 100);
    }
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Offline support
function setupOfflineSupport() {
    window.addEventListener('online', () => {
        console.log('App is online');
        hideOfflineMessage();
    });
    
    window.addEventListener('offline', () => {
        console.log('App is offline');
        showOfflineMessage();
    });
}

function showOfflineMessage() {
    const message = document.createElement('div');
    message.className = 'offline-message';
    message.innerHTML = `
        <i class="fas fa-wifi"></i>
        <span>You're offline. Some features may not be available.</span>
    `;
    document.body.appendChild(message);
}

function hideOfflineMessage() {
    const message = document.querySelector('.offline-message');
    if (message) {
        message.remove();
    }
}

// Enhanced error handling
function handleApiError(error, apiName) {
    console.error(`${apiName} Error:`, error);
    
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your configuration.';
    } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.';
    }
    
    alert(errorMessage);
}

// Guide Tab Functions
function showGuideTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.guide-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected panel
    document.getElementById(tabName + '-guide').classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Floating Assistant Functions
function toggleFloatingAssistant() {
    const panel = document.getElementById('assistant-panel');
    const isOpen = panel.style.display === 'block';
    
    if (isOpen) {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
    }
}

function showHelpTopic(topic) {
    const helpContent = getHelpContent(topic);
    
    // Create help modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content help-modal-content">
            <div class="modal-header">
                <h2>${helpContent.title}</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${helpContent.content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function getHelpContent(topic) {
    const helpData = {
        basics: {
            title: 'How to Get Recipes',
            content: `
                <div class="help-content">
                    <h3>Getting Started with RecipeMagic</h3>
                    <p>RecipeMagic makes it easy to create delicious Indian recipes based on what you have at home!</p>
                    
                    <h4>Step 1: Choose Your Input Method</h4>
                    <ul>
                        <li><strong>Text Input:</strong> Type ingredients you have available</li>
                        <li><strong>Voice Input:</strong> Click the microphone and speak your ingredients</li>
                        <li><strong>Photo Upload:</strong> Take a photo of ingredients or dishes for AI recognition</li>
                    </ul>
                    
                    <h4>Step 2: Customize Your Recipe</h4>
                    <ul>
                        <li>Set the number of servings (1-12 people)</li>
                        <li>Apply dietary filters (vegetarian, vegan, keto, etc.)</li>
                        <li>Choose your preferred spice level</li>
                    </ul>
                    
                    <h4>Step 3: Generate & Cook</h4>
                    <ul>
                        <li>Click "Generate Recipe" to create your custom recipe</li>
                        <li>Watch YouTube video tutorials for step-by-step guidance</li>
                        <li>Use the smart cooking timer for perfect timing</li>
                    </ul>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Pro Tip:</strong> The more specific you are with ingredients, the better your recipe will be!
                    </div>
                </div>
            `
        },
        ingredients: {
            title: 'Adding Ingredients',
            content: `
                <div class="help-content">
                    <h3>How to Add Ingredients</h3>
                    
                    <h4>Text Input Method</h4>
                    <ul>
                        <li>Type ingredient names in the input fields</li>
                        <li>Be specific (e.g., "chicken breast" instead of just "chicken")</li>
                        <li>Include quantities if you want (e.g., "2 onions")</li>
                        <li>Click "Add More Ingredients" for additional items</li>
                    </ul>
                    
                    <h4>Voice Input Method</h4>
                    <ul>
                        <li>Click the microphone button</li>
                        <li>Speak clearly and list your ingredients</li>
                        <li>Works great when your hands are messy from cooking!</li>
                    </ul>
                    
                    <h4>Photo Recognition Method</h4>
                    <ul>
                        <li>Click "Photo" in the navigation</li>
                        <li>Choose "Ingredient Recognition"</li>
                        <li>Upload a clear photo of your ingredients</li>
                        <li>AI will identify ingredients automatically</li>
                    </ul>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Best Practices:</strong> Include cooking oils, spices, and staple ingredients for better recipe suggestions.
                    </div>
                </div>
            `
        },
        photo: {
            title: 'Using Photo Upload',
            content: `
                <div class="help-content">
                    <h3>Photo Upload Features</h3>
                    
                    <h4>Ingredient Recognition</h4>
                    <p>Take a photo of ingredients you have, and our AI will identify them and suggest recipes.</p>
                    <ul>
                        <li>Works with common Indian ingredients</li>
                        <li>Best results with good lighting and clear photos</li>
                        <li>Can identify multiple ingredients in one photo</li>
                    </ul>
                    
                    <h4>Dish Recreation</h4>
                    <p>Upload a photo of a dish you want to recreate, and we'll provide step-by-step instructions.</p>
                    <ul>
                        <li>Identifies popular Indian dishes</li>
                        <li>Provides authentic recipes and techniques</li>
                        <li>Includes video tutorials for complex dishes</li>
                    </ul>
                    
                    <h4>How to Get Best Results</h4>
                    <ul>
                        <li>Use good, even lighting</li>
                        <li>Place ingredients on a neutral background</li>
                        <li>Ensure ingredients are clearly visible</li>
                        <li>For dishes, include the entire plate</li>
                    </ul>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Tip:</strong> The AI learns from each photo, so results improve over time!
                    </div>
                </div>
            `
        },
        ai: {
            title: 'AI Recipe Generation',
            content: `
                <div class="help-content">
                    <h3>How AI Recipe Generation Works</h3>
                    
                    <h4>Our AI Technology</h4>
                    <p>RecipeMagic uses advanced AI trained on thousands of authentic Indian recipes to create personalized dishes based on your ingredients.</p>
                    
                    <h4>What the AI Considers</h4>
                    <ul>
                        <li><strong>Ingredient Combinations:</strong> How flavors work together</li>
                        <li><strong>Cooking Methods:</strong> Traditional Indian cooking techniques</li>
                        <li><strong>Spice Balance:</strong> Authentic flavor profiles</li>
                        <li><strong>Nutritional Value:</strong> Balanced meal planning</li>
                        <li><strong>Cooking Time:</strong> Practical preparation time</li>
                    </ul>
                    
                    <h4>Customization Options</h4>
                    <ul>
                        <li><strong>Recipe Remix:</strong> Make recipes healthier, spicier, vegan, etc.</li>
                        <li><strong>Dietary Filters:</strong> Vegetarian, vegan, keto, gluten-free options</li>
                        <li><strong>Serving Sizes:</strong> Automatically scales ingredients</li>
                    </ul>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Did You Know:</strong> Our AI specializes in Indian cuisine and understands regional cooking styles!
                    </div>
                </div>
            `
        },
        timer: {
            title: 'Cooking Timer',
            content: `
                <div class="help-content">
                    <h3>Smart Cooking Timer System</h3>
                    
                    <h4>Basic Timer</h4>
                    <ul>
                        <li>Start, pause, and reset functionality</li>
                        <li>Visual warnings at 5 and 10 minutes</li>
                        <li>Perfect for single cooking tasks</li>
                    </ul>
                    
                    <h4>Multi-Timer System</h4>
                    <p>Manage multiple cooking times simultaneously for complex recipes:</p>
                    <ul>
                        <li>Create timers for different dishes or steps</li>
                        <li>Name each timer (e.g., "Rice," "Curry," "Dal")</li>
                        <li>Independent controls for each timer</li>
                        <li>Visual and audio alerts</li>
                    </ul>
                    
                    <h4>Timer Features</h4>
                    <ul>
                        <li><strong>Color Coding:</strong> Visual warnings change color</li>
                        <li><strong>Memory:</strong> Timer names are saved</li>
                        <li><strong>Flexibility:</strong> Add or remove timers as needed</li>
                    </ul>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Chef's Tip:</strong> Use different timers for prep work, cooking, and resting times!
                    </div>
                </div>
            `
        },
        favorites: {
            title: 'Saving Favorites',
            content: `
                <div class="help-content">
                    <h3>Favorites System</h3>
                    
                    <h4>How to Save Recipes</h4>
                    <ul>
                        <li>Click the heart icon on any recipe</li>
                        <li>Recipe is automatically saved to your device</li>
                        <li>Access anytime from the Favorites menu</li>
                    </ul>
                    
                    <h4>Managing Favorites</h4>
                    <ul>
                        <li>View all saved recipes from the navigation menu</li>
                        <li>Click the heart icon again to unsave</li>
                        <li>Recipes are stored locally on your device</li>
                        <li>No account or login required</li>
                    </ul>
                    
                    <h4>Benefits of Favorites</h4>
                    <ul>
                        <li><strong>Quick Access:</strong> Find your go-to recipes instantly</li>
                        <li><strong>Offline Access:</strong> View saved recipes without internet</li>
                        <li><strong>Personal Collection:</strong> Build your recipe library</li>
                    </ul>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Organization Tip:</strong> Save recipes you love and want to make again!
                    </div>
                </div>
            `
        },
        dietary: {
            title: 'Dietary Filters',
            content: `
                <div class="help-content">
                    <h3>Dietary Preference Filters</h3>
                    
                    <h4>Available Filters</h4>
                    <ul>
                        <li><strong>Vegetarian:</strong> No meat or fish, includes dairy</li>
                        <li><strong>Vegan:</strong> No animal products at all</li>
                        <li><strong>Keto:</strong> Low carb, high fat recipes</li>
                        <li><strong>Gluten-Free:</strong> No wheat or gluten ingredients</li>
                        <li><strong>Dairy-Free:</strong> No milk, cheese, or yogurt</li>
                        <li><strong>Low-Carb:</strong> Reduced carbohydrate options</li>
                    </ul>
                    
                    <h4>How to Use Filters</h4>
                    <ul>
                        <li>Click "Dietary" in the navigation menu</li>
                        <li>Select your preferred dietary options</li>
                        <li>Apply filters before generating recipes</li>
                        <li>Combine multiple filters for specific needs</li>
                    </ul>
                    
                    <h4>Smart Adaptations</h4>
                    <p>Our AI automatically adapts recipes to match your dietary preferences while maintaining authentic Indian flavors.</p>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Health Tip:</strong> Use dietary filters to maintain your lifestyle while enjoying delicious food!
                    </div>
                </div>
            `
        },
        troubleshoot: {
            title: 'Troubleshooting',
            content: `
                <div class="help-content">
                    <h3>Common Issues & Solutions</h3>
                    
                    <h4>Recipe Generation Problems</h4>
                    <ul>
                        <li><strong>Issue:</strong> API errors or failed generation</li>
                        <li><strong>Solution:</strong> Check internet connection and API key</li>
                        <li><strong>Issue:</strong> Poor recipe quality</li>
                        <li><strong>Solution:</strong> Be more specific with ingredients</li>
                    </ul>
                    
                    <h4>Photo Upload Issues</h4>
                    <ul>
                        <li><strong>Issue:</strong> Image not recognized</li>
                        <li><strong>Solution:</strong> Use better lighting and clearer photos</li>
                        <li><strong>Issue:</strong> File too large</li>
                        <li><strong>Solution:</strong> Use images under 5MB</li>
                    </ul>
                    
                    <h4>Timer Problems</h4>
                    <ul>
                        <li><strong>Issue:</strong> Timer not working</li>
                        <li><strong>Solution:</strong> Refresh the page and try again</li>
                        <li><strong>Issue:</strong> Can't hear alerts</li>
                        <li><strong>Solution:</strong> Check device volume settings</li>
                    </ul>
                    
                    <h4>General Tips</h4>
                    <ul>
                        <li>Use modern browsers (Chrome, Firefox, Safari)</li>
                        <li>Clear browser cache if experiencing issues</li>
                        <li>Ensure JavaScript is enabled</li>
                        <li>Check internet connection for AI features</li>
                    </ul>
                </div>
            `
        },
        tips: {
            title: 'Cooking Tips',
            content: `
                <div class="help-content">
                    <h3>Essential Indian Cooking Tips</h3>
                    
                    <h4>Spice Management</h4>
                    <ul>
                        <li><strong>Toast spices:</strong> Heat whole spices in oil for deeper flavor</li>
                        <li><strong>Layer flavors:</strong> Add spices at different cooking stages</li>
                        <li><strong>Bloom spices:</strong> Add ground spices to hot oil and cook briefly</li>
                        <li><strong>Balance flavors:</strong> Combine sweet, sour, spicy, and salty</li>
                    </ul>
                    
                    <h4>Cooking Techniques</h4>
                    <ul>
                        <li><strong>Browning onions:</strong> Cook slowly until deeply caramelized</li>
                        <li><strong>Tempering:</strong> Hot oil with spices poured over dishes</li>
                        <li><strong>Dum cooking:</strong> Seal pot with dough for steam cooking</li>
                        <li><strong>Resting time:</strong> Let curries sit for flavors to meld</li>
                    </ul>
                    
                    <h4>Ingredient Tips</h4>
                    <ul>
                        <li><strong>Fresh ginger-garlic paste:</strong> More flavorful than powdered</li>
                        <li><strong>Ghee vs oil:</strong> Ghee adds richness, oil for neutral cooking</li>
                        <li><strong>Tomato cooking:</strong> Cook until oil separates for best flavor</li>
                        <li><strong>Yogurt marinade:</strong> Tenderizes meat and adds tang</li>
                    </ul>
                    
                    <div class="tip-box">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Master Tip:</strong> Taste and adjust seasoning at each cooking stage!
                    </div>
                </div>
            `
        }
    };
    
    return helpData[topic] || {
        title: 'Help Topic Not Found',
        content: '<p>Sorry, this help topic is not available. Please try another topic or contact support.</p>'
    };
}

// Initialize offline support
setupOfflineSupport();

// Image Upload and AI Vision Functions
let uploadedIngredientImage = null;
let uploadedDishImage = null;

// Navigation Functions
function showImageUploadPage() {
    hideAllPages();
    document.getElementById('image-upload-page').classList.add('active');
    currentPage = 'image-upload';
    window.fromFavorites = false;
    document.getElementById('close-recipe-btn').style.display = 'none';
}

// Ingredient Upload Functions
function showIngredientUpload() {
    document.getElementById('ingredient-upload-modal').classList.add('active');
    setupDragAndDrop('ingredient-upload-area', handleIngredientImageDrop);
}

function closeIngredientUpload() {
    document.getElementById('ingredient-upload-modal').classList.remove('active');
    resetIngredientUpload();
}

function handleIngredientImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processIngredientImage(file);
    } else {
        showNotification('Please select a valid image file', 'error');
    }
}

function handleIngredientImageDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        processIngredientImage(files[0]);
    } else {
        showNotification('Please drop a valid image file', 'error');
    }
}

function processIngredientImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedIngredientImage = e.target.result;
        displayIngredientPreview(e.target.result);
        document.getElementById('analyze-ingredients-btn').disabled = false;
    };
    reader.readAsDataURL(file);
}

function displayIngredientPreview(imageSrc) {
    const preview = document.getElementById('ingredient-image-preview');
    const img = document.getElementById('ingredient-preview-img');
    const placeholder = document.querySelector('#ingredient-upload-area .upload-placeholder');
    
    img.src = imageSrc;
    preview.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
}

function removeIngredientImage() {
    uploadedIngredientImage = null;
    document.getElementById('ingredient-image-preview').style.display = 'none';
    document.querySelector('#ingredient-upload-area .upload-placeholder').style.display = 'block';
    document.getElementById('analyze-ingredients-btn').disabled = true;
    document.getElementById('ingredient-file-input').value = '';
}

function resetIngredientUpload() {
    removeIngredientImage();
    document.getElementById('image-servings-input').value = '4';
}

// Dish Upload Functions
function showDishUpload() {
    document.getElementById('dish-upload-modal').classList.add('active');
    setupDragAndDrop('dish-upload-area', handleDishImageDrop);
}

function closeDishUpload() {
    document.getElementById('dish-upload-modal').classList.remove('active');
    resetDishUpload();
}

function handleDishImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processDishImage(file);
    } else {
        showNotification('Please select a valid image file', 'error');
    }
}

function handleDishImageDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        processDishImage(files[0]);
    } else {
        showNotification('Please drop a valid image file', 'error');
    }
}

function processDishImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedDishImage = e.target.result;
        displayDishPreview(e.target.result);
        document.getElementById('analyze-dish-btn').disabled = false;
    };
    reader.readAsDataURL(file);
}

function displayDishPreview(imageSrc) {
    const preview = document.getElementById('dish-image-preview');
    const img = document.getElementById('dish-preview-img');
    const placeholder = document.querySelector('#dish-upload-area .upload-placeholder');
    
    img.src = imageSrc;
    preview.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
}

function removeDishImage() {
    uploadedDishImage = null;
    document.getElementById('dish-image-preview').style.display = 'none';
    document.querySelector('#dish-upload-area .upload-placeholder').style.display = 'block';
    document.getElementById('analyze-dish-btn').disabled = true;
    document.getElementById('dish-file-input').value = '';
}

function resetDishUpload() {
    removeDishImage();
    document.getElementById('dish-name-input').value = '';
}

// Drag and Drop Setup
function setupDragAndDrop(areaId, dropHandler) {
    const area = document.getElementById(areaId);
    if (!area) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.add('drag-over'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.remove('drag-over'), false);
    });
    
    area.addEventListener('drop', dropHandler, false);
}

// AI Vision Analysis Functions
async function analyzeIngredientImage() {
    if (!uploadedIngredientImage) {
        showNotification('Please upload an ingredient image first', 'error');
        return;
    }
    
    const servings = parseInt(document.getElementById('image-servings-input').value) || 4;
    
    showLoading();
    closeIngredientUpload();
    
    try {
        // Simulate AI vision analysis (in production, this would call a vision API)
        const recognizedIngredients = await recognizeIngredients(uploadedIngredientImage);
        
        // Generate recipe using recognized ingredients
        const recipe = await generateRecipeWithGroq(recognizedIngredients, servings);
        
        // Get YouTube video
        const videoId = await getYouTubeVideo(recipe.title);
        
        // Store current recipe
        currentRecipe = {
            ...recipe,
            videoId: videoId,
            ingredients: recognizedIngredients,
            servings: servings,
            imageAnalysis: {
                type: 'ingredients',
                originalImage: uploadedIngredientImage,
                recognizedIngredients: recognizedIngredients
            }
        };
        
        // Display recipe
        displayRecipe(currentRecipe);
        showRecipePage();
        
        showNotification(`Successfully recognized ${recognizedIngredients.length} ingredients!`, 'success');
        
    } catch (error) {
        console.error('Error analyzing ingredient image:', error);
        showNotification('Failed to analyze ingredients. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function analyzeDishImage() {
    if (!uploadedDishImage) {
        showNotification('Please upload a dish image first', 'error');
        return;
    }
    
    const dishName = document.getElementById('dish-name-input').value.trim();
    
    showLoading();
    closeDishUpload();
    
    try {
        // Simulate AI vision analysis (in production, this would call a vision API)
        const dishAnalysis = await analyzeDish(uploadedDishImage, dishName);
        
        // Generate recipe based on dish analysis
        const recipe = await generateRecipeFromDish(dishAnalysis);
        
        // Get YouTube video
        const videoId = await getYouTubeVideo(recipe.title);
        
        // Store current recipe
        currentRecipe = {
            ...recipe,
            videoId: videoId,
            servings: 4,
            imageAnalysis: {
                type: 'dish',
                originalImage: uploadedDishImage,
                dishName: dishName || recipe.title,
                analysis: dishAnalysis
            }
        };
        
        // Display recipe
        displayRecipe(currentRecipe);
        showRecipePage();
        
        showNotification(`Successfully analyzed dish: ${recipe.title}!`, 'success');
        
    } catch (error) {
        console.error('Error analyzing dish image:', error);
        showNotification('Failed to analyze dish. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Simulated AI Vision Functions (in production, replace with actual API calls)
async function recognizeIngredients(imageData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate ingredient recognition based on common Indian ingredients
    const commonIngredients = [
        'onion', 'tomato', 'potato', 'garlic', 'ginger', 'chili', 'turmeric', 'cumin',
        'coriander', 'rice', 'lentils', 'chicken', 'eggs', 'yogurt', 'milk', 'flour',
        'oil', 'ghee', 'mustard seeds', 'fenugreek', 'curry leaves', 'coconut'
    ];
    
    // Randomly select 3-8 ingredients for simulation
    const numIngredients = Math.floor(Math.random() * 6) + 3;
    const recognized = [];
    
    for (let i = 0; i < numIngredients; i++) {
        const randomIndex = Math.floor(Math.random() * commonIngredients.length);
        const ingredient = commonIngredients[randomIndex];
        if (!recognized.includes(ingredient)) {
            recognized.push(ingredient);
        }
    }
    
    return recognized;
}

async function analyzeDish(imageData, dishName) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate dish analysis
    const dishTypes = [
        { name: 'Butter Chicken', cuisine: 'North Indian', difficulty: 'medium', mainIngredients: ['chicken', 'butter', 'cream', 'tomato'] },
        { name: 'Biryani', cuisine: 'Mughlai', difficulty: 'hard', mainIngredients: ['rice', 'meat', 'spices', 'herbs'] },
        { name: 'Palak Paneer', cuisine: 'North Indian', difficulty: 'medium', mainIngredients: ['spinach', 'paneer', 'spices'] },
        { name: 'Sambar', cuisine: 'South Indian', difficulty: 'medium', mainIngredients: ['lentils', 'vegetables', 'tamarind'] },
        { name: 'Chole Bhature', cuisine: 'North Indian', difficulty: 'medium', mainIngredients: ['chickpeas', 'flour', 'spices'] }
    ];
    
    // If dish name is provided, try to match it
    if (dishName) {
        const match = dishTypes.find(dish => 
            dish.name.toLowerCase().includes(dishName.toLowerCase()) ||
            dishName.toLowerCase().includes(dish.name.toLowerCase())
        );
        if (match) return match;
    }
    
    // Otherwise return a random dish
    return dishTypes[Math.floor(Math.random() * dishTypes.length)];
}

async function generateRecipeFromDish(dishAnalysis) {
    const prompt = `Create an authentic ${dishAnalysis.name} recipe (${dishAnalysis.cuisine} cuisine).
    
    Please provide a response in JSON format with the following structure:
    {
        "title": "${dishAnalysis.name}",
        "description": "Brief description of this ${dishAnalysis.name} dish",
        "prepTime": 20,
        "cookTime": 40,
        "totalTime": 60,
        "servings": 4,
        "ingredients": ["2 cups rice", "1 cup lentils", "1 onion diced", "2 tomatoes chopped"],
        "instructions": ["Heat oil in pan", "Add onions and sauté until golden", "Add tomatoes and cook until soft"],
        "tips": "Cook on medium heat for best results",
        "difficulty": "${dishAnalysis.difficulty}",
        "nutrition": {
            "calories": 400,
            "protein": 25,
            "carbs": 50,
            "fat": 15,
            "fiber": 8
        }
    }
    
    Make sure the recipe is authentic ${dishAnalysis.cuisine} cuisine, instructions are clear step-by-step, all numeric values are actual numbers, and nutritional information is realistic for 4 servings.`;

    if (!API_PROXY_BASE_URL) {
        notifyProxyConfigurationFallback('AI recipe proxy is not configured. Showing an offline fallback recipe instead.');
        return createDishFallbackRecipe(dishAnalysis);
    }

    try {
        const response = await fetch(buildProxyUrl('/recipe'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                mode: 'dish',
                dishAnalysis
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        const content = typeof data.recipe === 'object'
            ? JSON.stringify(data.recipe)
            : data.content || data.choices?.[0]?.message?.content || JSON.stringify(data);
        
        try {
            const recipe = JSON.parse(content);
            
            // Validate and fix recipe structure
            if (!recipe.title) recipe.title = dishAnalysis.name;
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
                recipe.ingredients = dishAnalysis.mainIngredients.map(ing => `1 cup ${ing}`);
            }
            if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
                recipe.instructions = [
                    "Heat oil in a pan over medium heat",
                    "Add spices and sauté for 30 seconds",
                    "Add main ingredients and cook thoroughly",
                    "Garnish with fresh herbs and serve hot"
                ];
            }
            
            // Ensure numeric values
            recipe.prepTime = parseInt(recipe.prepTime) || 20;
            recipe.cookTime = parseInt(recipe.cookTime) || 40;
            recipe.totalTime = parseInt(recipe.totalTime) || (recipe.prepTime + recipe.cookTime);
            recipe.servings = parseInt(recipe.servings) || 4;
            recipe.difficulty = recipe.difficulty || dishAnalysis.difficulty;
            
            // Generate nutrition if not provided
            if (!recipe.nutrition) {
                recipe.nutrition = generateNutritionInfo(recipe.ingredients, recipe.servings);
            }
            
            return recipe;
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Fallback recipe if JSON parsing fails
            return createDishFallbackRecipe(dishAnalysis);
        }
    } catch (error) {
        console.error('Recipe Generation Error:', error);
        // Return fallback recipe on any error
        return createDishFallbackRecipe(dishAnalysis);
    }
}

function createDishFallbackRecipe(dishAnalysis) {
    return {
        title: dishAnalysis.name,
        description: `A delicious ${dishAnalysis.cuisine} dish with authentic flavors and spices`,
        prepTime: 20,
        cookTime: 40,
        totalTime: 60,
        servings: 4,
        ingredients: [
            "2 tablespoons oil",
            "1 teaspoon cumin seeds",
            "1 onion, finely chopped",
            "2 tomatoes, chopped",
            ...dishAnalysis.mainIngredients.map(ing => `1 cup ${ing}`),
            "1 teaspoon turmeric powder",
            "1 teaspoon red chili powder",
            "Salt to taste",
            "Fresh coriander leaves for garnish"
        ],
        instructions: [
            "Heat oil in a pan over medium heat",
            "Add cumin seeds and let them splutter",
            "Add chopped onions and sauté until golden brown",
            "Add tomatoes and cook until they become soft and mushy",
            "Add turmeric powder, red chili powder, and salt",
            "Add the main ingredients and mix well",
            "Cover and cook for 20-30 minutes, stirring occasionally",
            "Garnish with fresh coriander leaves and serve hot"
        ],
        tips: `For best results, use fresh ingredients and authentic ${dishAnalysis.cuisine} spices.`,
        difficulty: dishAnalysis.difficulty,
        nutrition: generateNutritionInfo(dishAnalysis.mainIngredients, 4)
    };
}

