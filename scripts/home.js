document.addEventListener('DOMContentLoaded', function() {
    loadSavedRoutes();
});

function loadSavedRoutes() {
    fetch('api/get_routes.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRoutes(data.routes);
            } else {
                console.error('Error loading routes:', data.error);
            }
        })
        .catch(error => {
            console.error('Failed to load routes:', error);
        });
}

function displayRoutes(routes) {
    const routesList = document.getElementById('routesList');
    routesList.innerHTML = '';

    if (routes.length === 0) {
        routesList.innerHTML = '<p>No saved routes yet.</p>';
        return;
    }

    routes.forEach(route => {
        const routeElement = document.createElement('div');
        routeElement.className = 'route-item';
        routeElement.innerHTML = `
            <h3>${route.name}</h3>
            <p>Created: ${new Date(route.created_at).toLocaleDateString()}</p>
            <button onclick="viewRoute(${route.id})">View Route</button>
            <button onclick="deleteRoute(${route.id})">Delete</button>
        `;
        routesList.appendChild(routeElement);
    });
}

function viewRoute(routeId) {
    window.location.href = `map.html?route=${routeId}`;
}

function deleteRoute(routeId) {
    if (confirm('Are you sure you want to delete this route?')) {
        fetch(`api/delete_route.php?id=${routeId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadSavedRoutes();
                } else {
                    alert('Error deleting route: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Failed to delete route:', error);
            });
    }
}
