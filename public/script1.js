// This is the function to fetch and display portfolio items
async function fetchPortfolios() {
    try {
        const response = await fetch('/api/portfolios');  // Fetch portfolio data from the backend
        const portfolios = await response.json();

        const portfolioList = document.getElementById('portfolio-list');
        portfolioList.innerHTML = '';  // Clear existing items

        // Simulating dynamic user role and ID (replace with actual logic)
        const userRole = "admin";  // Placeholder: set dynamically (e.g., from session or user data)
        const currentUserId = "12345";  // Placeholder: set dynamically (e.g., from session or user data)

        portfolios.forEach(portfolio => {
            const portfolioItem = document.createElement('div');
            portfolioItem.classList.add('col-md-4');
            portfolioItem.classList.add('portfolio-item');
            
            const card = document.createElement('div');
            card.classList.add('card');

            // Create a carousel for the portfolio images
            const carousel = createCarousel(portfolio.images, portfolio._id);
            card.appendChild(carousel);

            // Create the portfolio title and description
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');
            const title = document.createElement('h5');
            title.classList.add('card-title');
            title.innerText = portfolio.title;
            const description = document.createElement('p');
            description.classList.add('card-text');
            description.innerText = portfolio.description;
            cardBody.appendChild(title);
            cardBody.appendChild(description);
            
            // Create a div to hold the buttons (edit and delete)
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('d-flex', 'justify-content-between', 'mt-2');

            // Create the Edit button (only for admins)
            if (userRole === "admin") {
                const editButton = document.createElement('button');
                editButton.classList.add('btn', 'btn-warning');
                editButton.innerText = 'Edit';
                editButton.addEventListener('click', function () {
                    editPortfolio(portfolio);
                });
                buttonContainer.appendChild(editButton);
            }

            // Create the Delete button (only for admins)
            if (userRole === "admin") {
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-danger');
                deleteButton.innerText = 'Delete';
                deleteButton.addEventListener('click', function () {
                    deletePortfolio(portfolio._id, portfolioItem);
                });
                buttonContainer.appendChild(deleteButton);
            }

            // Append buttons container to cardBody
            cardBody.appendChild(buttonContainer);

            card.appendChild(cardBody);
            portfolioItem.appendChild(card);
            portfolioList.appendChild(portfolioItem);
        });
    } catch (error) {
        console.error('Error fetching portfolios:', error);
        alert('Failed to load portfolios.');
    }
}

// This function creates a carousel for the portfolio images
function createCarousel(images, portfolioId) {
    const carousel = document.createElement('div');
    carousel.classList.add('carousel', 'slide');
    carousel.setAttribute('id', `carousel-${portfolioId}`);
    carousel.setAttribute('data-bs-ride', 'carousel');

    const carouselInner = document.createElement('div');
    carouselInner.classList.add('carousel-inner');
    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.classList.add('carousel-item');
        if (index === 0) item.classList.add('active');
        const img = document.createElement('img');
        img.src = image;
        img.classList.add('d-block', 'w-100');
        img.alt = `Image for portfolio ${portfolioId}`;  // Added alt text for accessibility
        item.appendChild(img);
        carouselInner.appendChild(item);
    });

    carousel.appendChild(carouselInner);

    const prevButton = document.createElement('button');
    prevButton.classList.add('carousel-control-prev');
    prevButton.setAttribute('type', 'button');
    prevButton.setAttribute('data-bs-target', `#carousel-${portfolioId}`);
    prevButton.setAttribute('data-bs-slide', 'prev');
    prevButton.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span>';
    carousel.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.classList.add('carousel-control-next');
    nextButton.setAttribute('type', 'button');
    nextButton.setAttribute('data-bs-target', `#carousel-${portfolioId}`);
    nextButton.setAttribute('data-bs-slide', 'next');
    nextButton.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span>';
    carousel.appendChild(nextButton);

    return carousel;
}

// Function to delete a portfolio
async function deletePortfolio(portfolioId, portfolioItem) {
    try {
        const response = await fetch(`/api/portfolios/${portfolioId}`, { method: 'DELETE' });

        if (response.ok) {
            portfolioItem.remove();
            alert('Portfolio deleted successfully');
        } else {
            alert('Only admins can perform this action.');
        }
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('Only admins can perform this action.');
    }
}

// Event listener for the Create New Portfolio button
document.getElementById('createNewButton').addEventListener('click', function () {
    const portfolioForm = document.getElementById('portfolioForm');
    portfolioForm.reset();
    portfolioForm.dataset.editing = false;
    const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioModal'));
    portfolioModal.show();
});

// Event listener for form submission
document.getElementById('portfolioForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const title = document.getElementById('portfolioTitle').value;
    const description = document.getElementById('portfolioDescription').value;
    const images = document.getElementById('portfolioImages').value.split(',').map(url => url.trim());

    const portfolioData = { title, description, images };

    if (this.dataset.editing === 'true') {
        portfolioData._id = this.dataset.id;
        await updatePortfolio(portfolioData);
    } else {
        await createPortfolio(portfolioData);
    }
});

// Function to create a new portfolio
async function createPortfolio(portfolioData) {
    try {
        const response = await fetch('/api/portfolios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(portfolioData)
        });
        if (response.ok) {
            const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioModal'));
            portfolioModal.hide();
            fetchPortfolios();  // Refresh portfolio list
        }
    } catch (error) {
        console.error('Error creating portfolio:', error);
    }
}

// Function to update an existing portfolio
async function updatePortfolio(portfolioData) {
    try {
        const response = await fetch(`/api/portfolios/${portfolioData._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(portfolioData)
        });

        if (response.ok) {
            const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioModal'));
            portfolioModal.hide();
            fetchPortfolios(); // Refresh portfolio list
        } else {
            alert('Only admins can perform this action');
        }
    } catch (error) {
        console.error('Error updating portfolio:', error);
        alert('Error updating portfolio. Please try again.');
    }
}

// Event listener to open the Edit Portfolio form and populate it
function editPortfolio(portfolio) {
    const portfolioForm = document.getElementById('portfolioForm');
    portfolioForm.reset();
    portfolioForm.dataset.editing = true;
    portfolioForm.dataset.id = portfolio._id;

    document.getElementById('portfolioTitle').value = portfolio.title;
    document.getElementById('portfolioDescription').value = portfolio.description;
    document.getElementById('portfolioImages').value = portfolio.images.join(', ');

    const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioModal'));
    portfolioModal.show();
}

// Function to fetch the latest news articles
async function fetchLatestNews() {
    try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=f3cbaa9985e2406381cd5d3989a67130`);
        const data = await response.json();
        
        // Limit the number of articles displayed (e.g., limit to 5 articles)
        const limitedArticles = data.articles.slice(0, 5);  // Adjust the number as needed
        if (data.status === 'ok') {
            displayNewsArticles(limitedArticles);  // Pass only the limited articles
        } else {
            alert('Failed to fetch news. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        alert('An error occurred while fetching the latest news.');
    }
}

// Function to display the fetched (limited) news articles
function displayNewsArticles(articles) {
    const newsContainer = document.getElementById('latestNews');
    newsContainer.innerHTML = '';  // Clear existing news

    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.classList.add('news-article');

        const title = document.createElement('h3');
        const link = document.createElement('a');
        link.href = article.url;
        link.target = '_blank';  // Open the link in a new tab
        link.innerText = article.title;
        title.appendChild(link);

        const description = document.createElement('p');
        description.innerText = article.description;

        const source = document.createElement('p');
        source.innerHTML = `<strong>Source:</strong> ${article.source.name}`;

        articleElement.appendChild(title);
        articleElement.appendChild(description);
        articleElement.appendChild(source);

        newsContainer.appendChild(articleElement);
    });
}

// Function to fetch cultural events from Ticketmaster API
async function fetchCulturalEvents() {
    try {
        const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=iv4rGtNfEpJ0bAcFSACpFAd4xG8V2V5X&keyword=culture&locale=*&size=5`);
        const data = await response.json();

        if (data._embedded && data._embedded.events) {
            displayCulturalEvents(data._embedded.events);
        } else {
            alert('No cultural events found. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching cultural events:', error);
        alert('An error occurred while fetching cultural events.');
    }
}

// Function to display the fetched events
function displayCulturalEvents(events) {
    const eventsContainer = document.getElementById('culturalEvents');
    eventsContainer.innerHTML = ''; // Clear any existing events

    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('event-item', 'mb-3');

        const title = document.createElement('h4');
        const link = document.createElement('a');
        link.href = event.url;
        link.target = '_blank'; // Open link in a new tab
        link.innerText = event.name;
        title.appendChild(link);

        const date = document.createElement('p');
        date.innerHTML = `<strong>Date:</strong> ${new Date(event.dates.start.dateTime).toLocaleString()}`;

        const venue = document.createElement('p');
        venue.innerHTML = `<strong>Venue:</strong> ${event._embedded.venues[0].name}`;

        const location = document.createElement('p');
        location.innerHTML = `<strong>Location:</strong> ${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].country.name}`;

        eventElement.appendChild(title);
        eventElement.appendChild(date);
        eventElement.appendChild(venue);
        eventElement.appendChild(location);

        eventsContainer.appendChild(eventElement);
    });
}

// Call the fetchLatestNews function when the page loads
window.onload = function () {
    fetchCulturalEvents();
    fetchLatestNews();
    fetchPortfolios();
};

