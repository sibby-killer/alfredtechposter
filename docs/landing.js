// docs/landing.js

const WHATSAPP_NUMBER = "254762667048";
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby2cy41bXNxZNoYLmKbnF0po0FQoRP8jAG_0Bb0EsPYMkeF_qDz7f18ksXAb1uAPZwe/exec"; // Fill this in Phase 5 part 2

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Load Portfolio from data.json
    loadPortfolio();

    // 3. Handle Form Submission
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', handleFormSubmit);
    }

    // 4. Update Copyright Year
    document.getElementById('year').textContent = new Date().getFullYear();
});

// Scroll to top on load for aesthetics
window.scrollTo(0, 0);

// Set Year
document.getElementById('year').innerText = new Date().getFullYear();

// Pricing Plan Selection
window.selectPlan = function (planName, serviceType) {
    document.getElementById('entry-service').value = serviceType;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });

    // Set budget dropdown based on plan
    const budgetSelect = document.getElementById('entry-budget');
    if (planName === "Starter") budgetSelect.value = "Under Ksh 20k";
    else if (planName === "Standard") budgetSelect.value = "Ksh 20k - 40k";
    else if (planName === "Premium") budgetSelect.value = "Ksh 40k - 75k";

    document.getElementById('entry-description').value = `Hi, I am interested in the ${planName} package. Please provide more details.`;
};

// Form Submission handling
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    // Collect Data
    const name = document.getElementById('entry-name').value.trim();
    const business = document.getElementById('entry-business').value.trim();
    const service = document.getElementById('entry-service').value;
    const budget = document.getElementById('entry-budget').value;
    const description = document.getElementById('entry-description').value.trim();

    const timestamp = new Date().toISOString();

    // 1. Send to Google Sheets Webhook (if configured)
    if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL !== "") {
        try {
            await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors', // standard for simple google forms
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: timestamp,
                    name: name,
                    business: business,
                    service: service,
                    budget: budget,
                    description: description
                })
            });
            console.log("Logged to CRM");
        } catch (error) {
            console.error("CRM Logging error:", error);
        }
    }

    // 2. Build WhatsApp Message & Redirect
    const waText = `Hi Alfred! 👋\n\n*My name:* ${name}\n*Business:* ${business}\n*Service Needed:* ${service}\n*Budget:* ${budget}\n\n*What I need:* ${description}\n\nPlease get back to me!`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    // Redirect to WhatsApp
    window.location.href = waUrl;

    // Reset button after a delay
    setTimeout(() => {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        document.getElementById('lead-form').reset();
    }, 3000);
}

// Portfolio loading
async function loadPortfolio() {
    try {
        const response = await fetch('data.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Network response was not ok');
        const history = await response.json();

        // Only get active posts with a niche
        const successfulPosts = history.filter(post => post.success && post.postId && post.niche);

        renderPortfolio(successfulPosts);
    } catch (error) {
        console.error('Error loading portfolio:', error);
        const grid = document.getElementById('portfolio-grid');
        if (grid) grid.innerHTML = '<div class="col-span-full py-16 text-center text-slate-400">Our automated portfolio is updating. Check back soon!</div>';
    }
}

function renderPortfolio(posts) {
    const grid = document.getElementById('portfolio-grid');
    const filtersContainer = document.getElementById('portfolio-filters');

    if (!grid) return;

    if (posts.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-16 text-center text-slate-400">No recent AI-generated designs found in the database. When the bot runs, they will appear here!</div>';
        return;
    }

    grid.innerHTML = '';
    const niches = new Set();

    // We only want to show actual portfolio posts (like portfolio_website or images saved)
    // To prevent the grid from being 100 posts long, let's limit to the latest 6
    const displayPosts = posts.slice(0, 6);

    displayPosts.forEach(post => {
        niches.add(post.niche);

        // Create card
        const card = document.createElement('div');
        card.className = `portfolio-card relative group rounded-2xl overflow-hidden shadow-lg bg-slate-800 border border-slate-700 aspect-[4/3] filter-item`;
        card.setAttribute('data-category', post.niche);

        // For the image, if we don't have a local imagePath yet, we use a placeholder or generic Unsplash based on niche
        const fallbackImg = getFallbackImage(post.niche);
        const imgSrc = post.imagePath ? post.imagePath : fallbackImg;

        const fbLink = `https://facebook.com/${post.postId}`;
        const contentType = (post.contentType || "").replace('_', ' ');

        card.innerHTML = `
            <img src="${imgSrc}" alt="${post.niche}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            <div class="portfolio-overlay absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-0 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span class="text-blue-400 text-xs font-bold tracking-wider uppercase mb-1">${contentType}</span>
                <h3 class="text-white font-heading font-bold text-xl mb-3">${post.niche} Website</h3>
                <p class="text-slate-300 text-sm mb-4 line-clamp-2">This is an automated 4-page UI mockup designed by our AI engine for the ${post.niche} industry.</p>
                <div class="flex items-center space-x-3 transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300">
                    <a href="${fbLink}" target="_blank" class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center transition-colors shadow-lg">
                        See Full Post <i class="fab fa-facebook-f ml-2"></i>
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Setup Filters
    Array.from(niches).forEach(niche => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-5 py-2 rounded-full text-sm font-medium bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-700 transition-all`;
        btn.setAttribute('data-filter', niche);
        btn.textContent = niche;
        btn.onclick = (e) => applyFilter(e, niche);
        filtersContainer.appendChild(btn);
    });

    // Make the "All" button work
    filtersContainer.querySelector('[data-filter="all"]').onclick = (e) => applyFilter(e, 'all');
}

function applyFilter(e, category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-slate-800', 'text-slate-300');
    });
    e.target.classList.remove('bg-slate-800', 'text-slate-300');
    e.target.classList.add('bg-blue-600', 'text-white');

    // Filter items
    const items = document.querySelectorAll('.filter-item');
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
            setTimeout(() => item.style.opacity = '1', 50);
        } else {
            item.style.opacity = '0';
            setTimeout(() => item.style.display = 'none', 300);
        }
    });
}

function getFallbackImage(niche) {
    const map = {
        'E-commerce Shop': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        'Real Estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        'Restaurant / Food': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        'Salon / Beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        'Church / NGO': 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        'School / Academy': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    };
    return map[niche] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
}
