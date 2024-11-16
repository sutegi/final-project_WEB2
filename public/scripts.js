window.onload = function() {
    // Check if there's a 'message' query parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    // If a message exists, show it in an alert
    if (message) {
        alert(decodeURIComponent(message));  // Decode the message to show it correctly
    }

    if (document.getElementById('portfolio-list')) {
        fetchPortfolios();
    }
};