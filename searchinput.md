# Search input field

HTML:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elastic Bounce Search</title>
    <link rel="stylesheet" href="elastic-bounce.css">
</head>
<body>
    <div class="search-container">
        <div class="search-wrapper">
            <input type="text" class="search-input" placeholder="Bouncy search...">
        </div>
    </div>
</body>
</html>

CSS:

/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #0a0a0a;
    color: #fff;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Container for centering */
.search-container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

/* Search wrapper */
.search-wrapper {
    position: relative;
    width: 100%;
}

/* Search input styles */
.search-input {
    width: 100%;
    padding: 15px 20px;
    font-size: 16px;
    border: 3px solid #ffd700;
    background: #1a1a1a;
    color: #fff;
    border-radius: 25px;
    outline: none;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Placeholder styling */
.search-input::placeholder {
    color: #666;
    transition: all 0.3s;
}

/* Focus states */
.search-input:focus {
    transform: scale(1.05);
    border-color: #ffed4e;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.search-input:focus::placeholder {
    opacity: 0.5;
    transform: translateX(10px);
    animation: bounce 0.6s;
}

/* Bounce animation for placeholder */
@keyframes bounce {
    0%, 100% { 
        transform: translateX(0); 
    }
    25% { 
        transform: translateX(-10px); 
    }
    75% { 
        transform: translateX(10px); 
    }
}

/* Optional: Add hover effect */
.search-input:hover {
    border-color: #ffed4e;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}