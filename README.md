# Portfolio, News, and Cultural Events Management System

This project is a dynamic web application that combines portfolio management, news fetching, and cultural event discovery into a single platform. It provides users with the ability to manage portfolios and browse the latest news and cultural events. 

## Features

### 1. **Portfolio Management**
- **CRUD Operations**: 
  - Admins can create, edit, and delete portfolio items. 
  - Each portfolio can include a title, description, and multiple images.
- **Image Carousel**: Dynamically created for each portfolio to display associated images.
- **Role-Based Access**: Editing and deleting portfolios are restricted to admin users.

### 2. **Latest News Fetching**
- Fetches the latest top news headlines using the News API.
- Displays articles with their title, description, source, and a link to read more.
- Limits the number of displayed articles to improve readability.

### 3. **Cultural Events Discovery**
- Uses the Ticketmaster API to fetch and display upcoming cultural events.
- Displays event details such as name, date, venue, and location.
- Provides a direct link to the event page.

### 4. **Interactive Modals and Forms**
- Uses Bootstrap modals for creating and editing portfolio entries.
- Dynamic form population for editing existing portfolios.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: REST API (API endpoints for portfolio management)
- **APIs Used**:
  - [News API](https://newsapi.org/) for fetching the latest news.
  - [Ticketmaster API](https://developer.ticketmaster.com/) for discovering cultural events.

## Getting Started

### Prerequisites
1. A backend server to handle API requests for portfolio management (`/api/portfolios` endpoints).
2. API keys for:
   - News API
   - Ticketmaster API

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sutegi/final-project_WEB2.git
   ```
2. Set up the backend server and configure endpoints as needed.
3. Add your API keys:
   - Replace the placeholders for `News API` and `Ticketmaster API` in the JavaScript code.

### Usage
1. Open the `signup.html` file in your browser or serve it through a local server and register a new account.
2. Perform portfolio actions (admins only).
3. Browse the latest news and cultural events fetched dynamically.

## API Endpoints

### Portfolio API
- **GET `/api/portfolios`**: Fetch all portfolios.
- **POST `/api/portfolios`**: Create a new portfolio.
- **PUT `/api/portfolios/:id`**: Update an existing portfolio.
- **DELETE `/api/portfolios/:id`**: Delete a portfolio.

### External APIs
- **News API**: Used to fetch the latest top news headlines.
- **Ticketmaster API**: Used to fetch cultural events based on keywords.

## Attributions
- **Bootstrap 5**: For responsive design and modals.
- **News API**: For fetching the latest headlines.
- **Ticketmaster API**: For cultural events discovery.

## Contribution
Feel free to fork this repository and make your own changes. Contributions are welcome!
