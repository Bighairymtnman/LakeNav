LakeNav - Lake Navigation Route Planner

PROJECT OVERVIEW
---------------
LakeNav is a web application that allows users to create, save, and manage navigation routes for lakes. Users can place waypoints on water bodies, optimize routes, and save them for future reference.

PROJECT STRUCTURE
----------------
lakenav/
├── api/                  # Backend PHP endpoints
│   ├── db_connect.php    # Database connection handler
│   ├── delete_route.php  # Handles route deletion
│   ├── get_route.php     # Fetches single route data
│   ├── get_routes.php    # Fetches all routes
│   └── save_route.php    # Handles route saving
├── scripts/             # Frontend JavaScript
│   ├── home.js          # Home page functionality
│   └── map.js           # Map and route creation logic
├── styles/             # CSS styling
│   └── style.css       # Main stylesheet
├── index.html          # Home page
└── map.html           # Route creation page

CORE COMPONENTS
--------------

Frontend:
1. map.js
   - Main mapping functionality
   - Waypoint management
   - Route optimization
   - Integration with HERE Maps API
   - Related files: map.html, style.css

2. home.js
   - Displays saved routes
   - Route management (view/delete)
   - Related files: index.html, style.css

Backend:
1. db_connect.php
   - Database connection configuration
   - Used by all API endpoints

2. API Endpoints
   - save_route.php: Creates new routes
   - get_routes.php: Retrieves all saved routes
   - get_route.php: Retrieves single route details
   - delete_route.php: Removes routes from database

DATABASE STRUCTURE
----------------
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE waypoints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    sequence INT NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id)
);

KEY FEATURES
-----------
- Interactive map interface
- Water body detection
- Waypoint placement and management
- Route optimization
- Route saving and loading
- Route deletion

DEPENDENCIES
-----------
- Leaflet.js for mapping
- HERE Maps API for water detection
- MySQL database
- PHP 7.4+
