

// Creating the map object
let map = L.map('map').setView([0, 0], 2);

// Adding a tile layer 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Function to define the marker size based on earthquate magnitude
function markerSize(magnitude) {
    return magnitude *25000;
};

// Function to define the color based on earthquate depth
function chooseColor(depth) {
    return depth > 200 ? '#800026' :
           depth > 150 ? '#BD0026' :
           depth > 75 ? '#E31A1C' :
           depth > 50  ? '#FC4E2A' :
           depth > 20  ? '#FD8D3C' :
           depth > 10  ? '#FEB24C' :
           depth > 0   ? '#90EE90' :
                         '#8FBC8F';
};


// fetch API earthquakes
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        let earthquakes = data.features;
        earthquakes.forEach(eq => {
            let coords = eq.geometry.coordinates;
            let lat = coords[1];
            let lng = coords[0];
            let depth = coords[2];
            let mag = eq.properties.mag;
            let place = eq.properties.place;
            let time = new Date(eq.properties.time).toLocaleString();

            // Create a latitude and longitute circle marker based on the earthquake's
            L.circle([lat, lng], {
                color: chooseColor(depth),
                fillColor: chooseColor(depth),
                fillOpacity: 0.75,
                radius: markerSize(mag)
            }).addTo(map).bindPopup(
                `<strong>Location:</strong> ${place}<br>
                 <strong>Magnitude:</strong> ${mag}<br>
                 <strong>Depth:</strong> ${depth} km<br>
                 <strong>Time:</strong> ${time}`);
        });
    })


    // Create a legend for the map that explain the depth color coding
    let legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend'),
        depths = [-10, 10, 30, 50, 70, 90],
        labels = [],
        from, to, color;

    // Loop through the depth intervals and generate a label 
    for (let i = 0; i < depths.length; i++) {
        from = depths[i];
        to = depths[i + 1];

        // Get color for current depth. If it's the last one, add a '+' to denote 'and above'.
        color = chooseColor(from + 1);
        labels.push(
            '<i style="background:' + color + '"></i> ' +
            from + (to ? '–' + to : '+')
        );
    }
    // Add legend content to the div 
    div.innerHTML = '<strong>Depth (km)</strong><br>' + labels.join('<br>');
    return div;
};

  // Adding the legend to the map
legend.addTo(map);