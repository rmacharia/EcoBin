// EcoBin - Smart Waste Management Application
class EcoBinApp {
    constructor() {
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        this.db = null;
        this.wasteService = null;
        this.impactService = null;
        this.communityService = null;
        this.init();
    }

    async init() {
        await this.initializeDatabase();
        this.setupEventListeners();
        this.initializeServices();
        this.loadUserData();
        this.setupOfflineHandling();
        this.startAnimations();
    }

    async initializeDatabase() {
        // IndexedDB setup for offline waste tracking
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('EcoBinDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Waste items store
                if (!db.objectStoreNames.contains('waste_items')) {
                    const wasteStore = db.createObjectStore('waste_items', { keyPath: 'id' });
                    wasteStore.createIndex('category', 'category', { unique: false });
                    wasteStore.createIndex('date', 'date', { unique: false });
                    wasteStore.createIndex('location', 'location', { unique: false });
                }
                
                // User settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                // Environmental impact store
                if (!db.objectStoreNames.contains('impact_data')) {
                    const impactStore = db.createObjectStore('impact_data', { keyPath: 'id' });
                    impactStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Community data store
                if (!db.objectStoreNames.contains('community_data')) {
                    const communityStore = db.createObjectStore('community_data', { keyPath: 'id' });
                    communityStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    initializeServices() {
        this.wasteService = new WasteService(this.db);
        this.impactService = new ImpactService(this.db);
        this.communityService = new CommunityService(this.db);
        this.authService = new AuthService(this.db);
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleConnectionChange();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleConnectionChange();
        });

        // Navigation handling
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav]')) {
                e.preventDefault();
                this.navigate(e.target.dataset.nav);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.openQuickWasteLog();
                        break;
                    case '/':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                }
            }
        });
    }

    setupOfflineHandling() {
        // Service worker registration for offline functionality
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    async loadUserData() {
        try {
            const userData = await this.getUserSettings();
            this.currentUser = userData;
            this.updateUIForUser();
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    async getUserSettings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('user');
            
            request.onsuccess = () => {
                resolve(request.result?.value || this.getDefaultUserSettings());
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    getDefaultUserSettings() {
        return {
            name: 'Eco Warrior',
            location: 'Nairobi, Kenya',
            theme: 'light',
            notifications: true,
            units: 'metric',
            privacy: {
                dataSharing: false,
                analytics: true
            }
        };
    }

    updateUIForUser() {
        // Update user interface elements with current user data
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });

        // Apply theme
        document.documentElement.setAttribute('data-theme', this.currentUser.theme);
    }

    handleConnectionChange() {
        const statusIndicator = document.querySelector('.connection-status');
        if (statusIndicator) {
            statusIndicator.className = `connection-status ${this.isOnline ? 'online' : 'offline'}`;
            statusIndicator.textContent = this.isOnline ? 'Online' : 'Offline';
        }
        
        // Sync data when coming back online
        if (this.isOnline) {
            this.syncOfflineData();
        }
    }

    async syncOfflineData() {
        try {
            // Sync offline waste data
            const offlineWaste = await this.getOfflineWasteData();
            if (offlineWaste.length > 0) {
                console.log(`Syncing ${offlineWaste.length} offline waste items`);
                // In a real app, this would sync with the server
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    async getOfflineWasteData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['waste_items'], 'readonly');
            const store = transaction.objectStore('waste_items');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const items = request.result.filter(item => item.syncStatus === 'pending');
                resolve(items);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    navigate(page) {
        // Simple router for single-page application
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const targetPage = `${page}.html`;
        
        if (currentPage !== targetPage) {
            window.location.href = targetPage;
        }
    }

    openQuickWasteLog() {
        const modal = this.createModal('quick-waste-log');
        modal.innerHTML = `
            <div class="quick-waste-container">
                <h3>Quick Waste Log</h3>
                <form class="waste-form">
                    <select name="category" required>
                        <option value="">Select waste category</option>
                        <option value="organic">Organic Waste</option>
                        <option value="plastic">Plastic</option>
                        <option value="paper">Paper</option>
                        <option value="metal">Metal</option>
                        <option value="glass">Glass</option>
                        <option value="electronic">Electronic</option>
                        <option value="hazardous">Hazardous</option>
                    </select>
                    <input type="text" name="item" placeholder="Item name (optional)">
                    <input type="number" name="weight" placeholder="Weight (kg)" step="0.1">
                    <input type="text" name="location" placeholder="Location">
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Log Waste</button>
                    </div>
                </form>
            </div>
        `;
        
        const form = modal.querySelector('.waste-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.logWaste(new FormData(form));
            modal.remove();
        });
    }

    async logWaste(formData) {
        const wasteItem = {
            id: this.generateId(),
            category: formData.get('category'),
            item: formData.get('item') || 'Unspecified item',
            weight: parseFloat(formData.get('weight')) || 0,
            location: formData.get('location') || this.currentUser.location,
            date: new Date().toISOString(),
            syncStatus: this.isOnline ? 'synced' : 'pending'
        };
        
        try {
            await this.storeWasteItem(wasteItem);
            this.showNotification('Waste logged successfully!', 'success');
            
            // Update environmental impact
            const impact = await this.impactService.calculateImpact(wasteItem);
            this.showNotification(`Environmental impact: ${impact.carbonSaved}kg CO2 saved`, 'info');
            
        } catch (error) {
            console.error('Failed to log waste:', error);
            this.showNotification('Failed to log waste', 'error');
        }
    }

    async storeWasteItem(wasteItem) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['waste_items'], 'readwrite');
            const store = transaction.objectStore('waste_items');
            const request = store.put(wasteItem);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createModal(id) {
        const existingModal = document.querySelector('.modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        document.body.appendChild(modal);
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    startAnimations() {
        // Initialize background leaf animation if p5.js is available
        if (typeof p5 !== 'undefined') {
            this.initLeafBackground();
        }
        
        // Initialize text animations
        this.initTextAnimations();
    }

    initLeafBackground() {
        // Floating leaf background animation
        const sketch = (p) => {
            let leaves = [];
            const numLeaves = 20;
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('leaf-background');
                canvas.style('position', 'fixed');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '-1');
                
                // Create leaves
                for (let i = 0; i < numLeaves; i++) {
                    leaves.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.3, 0.3),
                        vy: p.random(-0.3, 0.3),
                        size: p.random(8, 16),
                        rotation: p.random(p.TWO_PI),
                        rotationSpeed: p.random(-0.02, 0.02)
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw leaves
                for (let leaf of leaves) {
                    // Update position
                    leaf.x += leaf.vx;
                    leaf.y += leaf.vy;
                    leaf.rotation += leaf.rotationSpeed;
                    
                    // Wrap around edges
                    if (leaf.x < -leaf.size) leaf.x = p.width + leaf.size;
                    if (leaf.x > p.width + leaf.size) leaf.x = -leaf.size;
                    if (leaf.y < -leaf.size) leaf.y = p.height + leaf.size;
                    if (leaf.y > p.height + leaf.size) leaf.y = -leaf.size;
                    
                    // Draw leaf
                    p.push();
                    p.translate(leaf.x, leaf.y);
                    p.rotate(leaf.rotation);
                    p.fill(45, 90, 61, 30);
                    p.noStroke();
                    
                    // Simple leaf shape
                    p.ellipse(0, 0, leaf.size, leaf.size * 1.5);
                    p.ellipse(leaf.size * 0.3, 0, leaf.size * 0.7, leaf.size);
                    
                    p.pop();
                }
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        };
        
        new p5(sketch);
    }

    initTextAnimations() {
        // Initialize typed.js for environmental tips if available
        if (typeof Typed !== 'undefined') {
            const tipElement = document.querySelector('.environmental-tip');
            if (tipElement) {
                new Typed(tipElement, {
                    strings: [
                        'Reduce, Reuse, Recycle',
                        'Every small action counts',
                        'Protect our planet for future generations',
                        'Make sustainable choices every day',
                        'Together we can make a difference'
                    ],
                    typeSpeed: 50,
                    backSpeed: 30,
                    backDelay: 3000,
                    loop: true
                });
            }
        }
    }
}

// Waste Service for handling waste tracking and classification
class WasteService {
    constructor(db) {
        this.db = db;
        this.categories = {
            organic: { name: 'Organic Waste', color: '#4A6741', icon: '🌱' },
            plastic: { name: 'Plastic', color: '#6B8CAE', icon: '♻️' },
            paper: { name: 'Paper', color: '#B8860B', icon: '📄' },
            metal: { name: 'Metal', color: '#8B6914', icon: '🔩' },
            glass: { name: 'Glass', color: '#C4A484', icon: '🍾' },
            electronic: { name: 'Electronic', color: '#2D5A3D', icon: '💻' },
            hazardous: { name: 'Hazardous', color: '#8B4513', icon: '☠️' }
        };
    }

    async classifyWaste(imageData) {
        // Simulate AI waste classification
        await this.simulateDelay(2000);
        
        const categories = Object.keys(this.categories);
        const confidence = Math.random() * 0.4 + 0.6;
        const predictedCategory = categories[Math.floor(Math.random() * categories.length)];
        
        return {
            category: predictedCategory,
            confidence: confidence,
            suggestions: this.getDisposalSuggestions(predictedCategory),
            alternatives: this.getAlternativeProducts(predictedCategory)
        };
    }

    getDisposalSuggestions(category) {
        const suggestions = {
            organic: [
                'Compost in backyard or community composting facility',
                'Use for gardening and soil enrichment',
                'Avoid putting in regular trash to reduce methane emissions'
            ],
            plastic: [
                'Check local recycling guidelines for specific plastic types',
                'Clean and dry before recycling',
                'Consider reusable alternatives for future purchases'
            ],
            paper: [
                'Recycle through local paper recycling program',
                'Shred sensitive documents before recycling',
                'Consider digital alternatives to reduce paper usage'
            ],
            metal: [
                'Most metals can be recycled infinitely',
                'Clean food residue from metal containers',
                'Separate different types of metals if required'
            ],
            glass: [
                'Glass can be recycled endlessly without quality loss',
                'Separate by color if required by local program',
                'Remove lids and caps before recycling'
            ],
            electronic: [
                'Use certified e-waste recycling programs',
                'Remove personal data before disposal',
                'Consider repair or donation before recycling'
            ],
            hazardous: [
                'Never put in regular trash or recycling',
                'Use designated hazardous waste collection programs',
                'Store safely until proper disposal is available'
            ]
        };
        
        return suggestions[category] || ['Follow local waste management guidelines'];
    }

    getAlternativeProducts(category) {
        const alternatives = {
            plastic: [
                'Reusable water bottles and containers',
                'Beeswax wraps instead of plastic wrap',
                'Glass or stainless steel storage containers'
            ],
            paper: [
                'Digital documents and cloud storage',
                'Reusable cloth towels instead of paper towels',
                'Reusable shopping bags instead of paper bags'
            ],
            organic: [
                'Composting system for food scraps',
                'Reusable produce bags',
                'Meal planning to reduce food waste'
            ]
        };
        
        return alternatives[category] || [];
    }

    async getWasteStats(timeRange = 'month') {
        const wasteItems = await this.getWasteItems(timeRange);
        
        const stats = {
            totalItems: wasteItems.length,
            totalWeight: wasteItems.reduce((sum, item) => sum + (item.weight || 0), 0),
            categoryBreakdown: {},
            dailyAverage: 0,
            recyclingRate: 0
        };
        
        // Calculate category breakdown
        wasteItems.forEach(item => {
            stats.categoryBreakdown[item.category] = (stats.categoryBreakdown[item.category] || 0) + 1;
        });
        
        // Calculate daily average
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
        stats.dailyAverage = stats.totalItems / days;
        
        // Calculate recycling rate (assume proper disposal)
        const recyclableCategories = ['plastic', 'paper', 'metal', 'glass'];
        const recyclableItems = wasteItems.filter(item => 
            recyclableCategories.includes(item.category)
        ).length;
        stats.recyclingRate = (recyclableItems / stats.totalItems) * 100;
        
        return stats;
    }

    async getWasteItems(timeRange = 'all') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['waste_items'], 'readonly');
            const store = transaction.objectStore('waste_items');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let items = request.result;
                
                // Filter by time range
                if (timeRange !== 'all') {
                    const now = new Date();
                    const cutoffDate = new Date();
                    
                    switch(timeRange) {
                        case 'week':
                            cutoffDate.setDate(now.getDate() - 7);
                            break;
                        case 'month':
                            cutoffDate.setMonth(now.getMonth() - 1);
                            break;
                        case 'year':
                            cutoffDate.setFullYear(now.getFullYear() - 1);
                            break;
                    }
                    
                    items = items.filter(item => new Date(item.date) >= cutoffDate);
                }
                
                resolve(items);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Impact Service for environmental impact calculations
class ImpactService {
    constructor(db) {
        this.db = db;
        this.carbonFactors = {
            plastic: 1.5, // kg CO2 per kg of plastic
            paper: 0.8,   // kg CO2 per kg of paper
            metal: 2.0,   // kg CO2 per kg of metal
            glass: 0.5,   // kg CO2 per kg of glass
            organic: 0.2, // kg CO2 per kg of organic waste
            electronic: 5.0, // kg CO2 per kg of electronic waste
            hazardous: 3.0   // kg CO2 per kg of hazardous waste
        };
    }

    async calculateImpact(wasteItem) {
        const factor = this.carbonFactors[wasteItem.category] || 1.0;
        const weight = wasteItem.weight || 0.5; // Default weight if not specified
        
        const carbonFootprint = weight * factor;
        const carbonSaved = carbonFootprint * 0.8; // Assume 80% savings through proper disposal
        const treesEquivalent = carbonSaved / 21.77; // kg CO2 absorbed by one tree per year
        
        const impact = {
            id: this.generateId(),
            wasteItemId: wasteItem.id,
            carbonFootprint: carbonFootprint,
            carbonSaved: carbonSaved,
            treesEquivalent: treesEquivalent,
            waterSaved: weight * 100, // Liters of water saved
            energySaved: weight * 50, // kWh of energy saved
            timestamp: new Date().toISOString()
        };
        
        // Store impact data
        await this.storeImpact(impact);
        
        return impact;
    }

    async storeImpact(impact) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['impact_data'], 'readwrite');
            const store = transaction.objectStore('impact_data');
            const request = store.put(impact);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getTotalImpact(timeRange = 'all') {
        const impacts = await this.getImpactData(timeRange);
        
        const total = {
            carbonSaved: 0,
            treesEquivalent: 0,
            waterSaved: 0,
            energySaved: 0,
            totalItems: impacts.length
        };
        
        impacts.forEach(impact => {
            total.carbonSaved += impact.carbonSaved || 0;
            total.treesEquivalent += impact.treesEquivalent || 0;
            total.waterSaved += impact.waterSaved || 0;
            total.energySaved += impact.energySaved || 0;
        });
        
        return total;
    }

    async getImpactData(timeRange = 'all') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['impact_data'], 'readonly');
            const store = transaction.objectStore('impact_data');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let impacts = request.result;
                
                // Filter by time range
                if (timeRange !== 'all') {
                    const now = new Date();
                    const cutoffDate = new Date();
                    
                    switch(timeRange) {
                        case 'week':
                            cutoffDate.setDate(now.getDate() - 7);
                            break;
                        case 'month':
                            cutoffDate.setMonth(now.getMonth() - 1);
                            break;
                        case 'year':
                            cutoffDate.setFullYear(now.getFullYear() - 1);
                            break;
                    }
                    
                    impacts = impacts.filter(impact => new Date(impact.timestamp) >= cutoffDate);
                }
                
                resolve(impacts);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Community Service for community features
class CommunityService {
    constructor(db) {
        this.db = db;
        this.challenges = [
            {
                id: 'plastic-free-week',
                name: 'Plastic-Free Week',
                description: 'Avoid single-use plastics for one week',
                duration: 7,
                participants: 156,
                impact: '234kg plastic avoided'
            },
            {
                id: 'zero-waste-month',
                name: 'Zero Waste Month',
                description: 'Minimize waste generation for 30 days',
                duration: 30,
                participants: 89,
                impact: '445kg waste reduced'
            },
            {
                id: 'recycling-champion',
                name: 'Recycling Champion',
                description: 'Achieve 90% recycling rate this month',
                duration: 30,
                participants: 203,
                impact: '567kg materials recycled'
            }
        ];
    }

    async getCommunityStats() {
        return {
            totalMembers: 1247,
            activeChallenges: 3,
            totalWasteDiverted: '2.4 tons',
            carbonSaved: '1.8 tons CO2',
            treesEquivalent: 82
        };
    }

    async getLeaderboard() {
        return [
            { name: 'Sarah M.', points: 2450, wasteDiverted: '45kg', streak: 15 },
            { name: 'John K.', points: 2380, wasteDiverted: '42kg', streak: 12 },
            { name: 'Amina L.', points: 2290, wasteDiverted: '38kg', streak: 18 },
            { name: 'David R.', points: 2150, wasteDiverted: '35kg', streak: 8 },
            { name: 'Grace W.', points: 2080, wasteDiverted: '33kg', streak: 21 }
        ];
    }

    async getLocalEvents() {
        return [
            {
                id: 'cleanup-2024-11-15',
                name: 'Community Park Cleanup',
                date: '2024-11-15',
                location: 'Central Park, Nairobi',
                participants: 45,
                description: 'Join us for a community cleanup event'
            },
            {
                id: 'recycling-drive-2024-11-20',
                name: 'Electronic Waste Recycling Drive',
                date: '2024-11-20',
                location: 'City Hall, Nairobi',
                participants: 120,
                description: 'Safely dispose of electronic waste'
            }
        ];
    }

    async getEducationalContent() {
        return [
            {
                title: 'The Journey of Plastic Recycling',
                content: 'Learn how plastic waste is transformed into new products through the recycling process.',
                type: 'article',
                readTime: '5 min'
            },
            {
                title: 'Composting Basics for Beginners',
                content: 'Start composting at home with these simple steps and reduce your organic waste.',
                type: 'guide',
                readTime: '8 min'
            },
            {
                title: 'Understanding Carbon Footprint',
                content: 'How your waste management choices impact the environment and climate change.',
                type: 'educational',
                readTime: '6 min'
            }
        ];
    }
}

// Authentication Service
class AuthService {
    constructor(db) {
        this.db = db;
        this.currentUser = null;
    }

    async login(email, password) {
        // Simulate authentication
        await this.simulateDelay(1000);
        
        this.currentUser = {
            id: 'user_123',
            email: email,
            name: 'Eco Warrior',
            created: new Date().toISOString()
        };
        
        return this.currentUser;
    }

    async logout() {
        this.currentUser = null;
        return true;
    }

    async simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ecobin = new EcoBinApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcoBinApp, WasteService, ImpactService };
}