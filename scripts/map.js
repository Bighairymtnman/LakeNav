document.addEventListener('DOMContentLoaded', function() {
    // Initialize map centered on a default location
    const map = L.map('map').setView([43.0, -87.5], 8);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Get route ID from URL if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('route');

    // If routeId exists, load the saved route
    if (routeId) {
        fetch(`api/get_route.php?id=${routeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    data.route.waypoints.forEach((wp, index) => {
                        const marker = L.marker([wp.lat, wp.lng], {
                            icon: createWaypointIcon(index + 1)
                        });
                        marker.addTo(map);
                        waypoints.push({
                            lat: wp.lat,
                            lng: wp.lng,
                            marker: marker
                        });
                    });
                    updateRouteLine();
                }
            });
    }

    // HERE Maps credentials
    const hereApiKey = 'qtFoibUC3IxKwJUFcjzsInoqMXEd-_hhh0NMO59j0lg';

    // Function to check if location is water using HERE API
    async function isWater(lat, lng) {
        const url = `https://browse.search.hereapi.com/v1/browse?at=${lat},${lng}&categories=350-3500-0304,350-3500-0233,350-3500-0302&radius=50&limit=1&apiKey=${hereApiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Browse API response:', {
                location: { lat, lng },
                nearbyFeatures: data.items,
                categories: data.items?.map(item => item.categories)
            });
            
            return data.items && data.items.length > 0;
        } catch (error) {
            console.log('Water detection error:', error);
            return false;
        }
    }

    // Array to store waypoints
    let waypoints = [];
    let addingWaypoint = false;
    let routeLine = null;

    // Function to update route line
    function updateRouteLine() {
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        if (waypoints.length > 1) {
            const points = waypoints.map(wp => wp.marker.getLatLng());
            routeLine = L.polyline(points, {color: 'blue', weight: 3}).addTo(map);
        }
    }

    // Function to create custom waypoint icon
    function createWaypointIcon(number) {
        return L.divIcon({
            className: 'waypoint-icon',
            html: `<div class="waypoint-number">${number}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    // Function to optimize route
    function optimizeRoute() {
        if (waypoints.length < 2) return;

        // Start with the first waypoint
        let optimizedWaypoints = [waypoints[0]];
        let remainingWaypoints = waypoints.slice(1);

        // Find nearest neighbor for each point
        while (remainingWaypoints.length > 0) {
            const currentPoint = optimizedWaypoints[optimizedWaypoints.length - 1];
            let nearestIndex = 0;
            let shortestDistance = calculateDistance(
                currentPoint.lat,
                currentPoint.lng,
                remainingWaypoints[0].lat,
                remainingWaypoints[0].lng
            );

            // Find the nearest unvisited waypoint
            remainingWaypoints.forEach((waypoint, index) => {
                const distance = calculateDistance(
                    currentPoint.lat,
                    currentPoint.lng,
                    waypoint.lat,
                    waypoint.lng
                );
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestIndex = index;
                }
            });

            optimizedWaypoints.push(remainingWaypoints[nearestIndex]);
            remainingWaypoints.splice(nearestIndex, 1);
        }

        // Update waypoints array with optimized order
        waypoints = optimizedWaypoints;
        
        // Update markers and numbers
        waypoints.forEach((wp, index) => {
            wp.marker.setIcon(createWaypointIcon(index + 1));
        });

        // Update the route line
        updateRouteLine();
    }

    // Helper function to calculate distance between two points
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Add waypoint button functionality
    const addWaypointBtn = document.getElementById('addWaypoint');
    addWaypointBtn.addEventListener('click', function() {
        addingWaypoint = !addingWaypoint;
        this.classList.toggle('active');
        this.style.backgroundColor = addingWaypoint ? '#e74c3c' : '#2c3e50';
        console.log('Add waypoint mode:', addingWaypoint);
    });

    // Clear waypoints button functionality
    document.getElementById('clearWaypoints').addEventListener('click', function() {
        waypoints.forEach(waypoint => {
            map.removeLayer(waypoint.marker);
        });
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        waypoints = [];
        console.log('Cleared all waypoints');
    });

    // Optimize route button functionality
    document.getElementById('optimizeRoute').addEventListener('click', function() {
        optimizeRoute();
        console.log('Route optimized');
    });

    // Save route button functionality
    const saveRouteBtn = document.getElementById('saveRoute');
    if (saveRouteBtn) {
        saveRouteBtn.addEventListener('click', function() {
            console.log('Save button clicked');
            if (waypoints.length < 2) {
                alert('Please add at least 2 waypoints');
                return;
            }
            const modal = document.getElementById('saveRouteModal');
            modal.style.display = 'block';
            console.log('Modal displayed');
        });
    }

    // Save confirmation handler
    const confirmSaveBtn = document.getElementById('confirmSave');
    if (confirmSaveBtn) {
        confirmSaveBtn.addEventListener('click', function() {
            const routeName = document.getElementById('routeName').value;
            if (!routeName) {
                alert('Please enter a route name');
                return;
            }

            const routeData = {
                name: routeName,
                waypoints: waypoints.map(wp => ({
                    lat: wp.lat,
                    lng: wp.lng
                }))
            };

            fetch('api/save_route.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(routeData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'index.html';
                } else {
                    alert('Error saving route: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to save route');
            });
        });
    }

    // Cancel save handler
    const cancelSaveBtn = document.getElementById('cancelSave');
    if (cancelSaveBtn) {
        cancelSaveBtn.addEventListener('click', function() {
            document.getElementById('saveRouteModal').style.display = 'none';
        });
    }

    // Add waypoint on map click
    map.on('click', async function(e) {
        console.log('Map clicked at:', e.latlng);
        if (addingWaypoint) {
            console.log('Checking if location is water...');
            const waterCheck = await isWater(e.latlng.lat, e.latlng.lng);
            console.log('Water check result:', waterCheck);
            
            if (!waterCheck) {
                alert('Please place waypoints only on water bodies!');
                return;
            }

            const marker = L.marker(e.latlng, {
                icon: createWaypointIcon(waypoints.length + 1)
            });
            
            marker.on('click', function() {
                if (confirm('Delete this waypoint?')) {
                    map.removeLayer(marker);
                    waypoints = waypoints.filter(wp => wp.marker !== marker);
                    waypoints.forEach((wp, index) => {
                        wp.marker.setIcon(createWaypointIcon(index + 1));
                    });
                    updateRouteLine();
                    console.log('Waypoint deleted');
                }
            });

            marker.addTo(map);
            waypoints.push({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                marker: marker
            });
            
            updateRouteLine();
            console.log('New waypoint added');
            
            addingWaypoint = false;
            addWaypointBtn.classList.remove('active');
            addWaypointBtn.style.backgroundColor = '#2c3e50';
        }
    });
});



