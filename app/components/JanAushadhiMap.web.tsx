import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { JAN_AUSHADHI_ALL_STORES } from '@/data/janAushadhiStores';

interface JanAushadhiMapProps {
  userLocation: { lat: number; lon: number };
  nearbyStores?: Array<any>;
  openDirections?: (store: any) => void;
  selectedStoreId?: number | string;
}

const JanAushadhiMap: React.FC<JanAushadhiMapProps> = ({
  userLocation,
  nearbyStores = [],
  openDirections,
  selectedStoreId,
}) => {
  const defaultLat = userLocation?.lat || 19.0760;
  const defaultLon = userLocation?.lon || 72.8777;

  // Calculate distance for all 75 stores from user location in micro-seconds
  const allStoresWithDistance = useMemo(() => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const sourceStores = nearbyStores.length > 10 ? nearbyStores : JAN_AUSHADHI_ALL_STORES;

    return sourceStores.map(store => {
      const dist = calculateDistance(defaultLat, defaultLon, Number(store.latitude), Number(store.longitude));
      return {
        ...store,
        distance_km: store.distance_km || dist.toFixed(1)
      };
    }).sort((a, b) => parseFloat(String(a.distance_km)) - parseFloat(String(b.distance_km)));
  }, [defaultLat, defaultLon, nearbyStores]);

  // Generate an interactive HTML Leaflet map document
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #map-container { height: 100%; width: 100%; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; overflow: hidden; position: relative; }
          #map { height: 100%; width: 100%; z-index: 1; }

          /* Glass Floating Header */
          .floating-header {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 6px;
            pointer-events: none;
          }
          .search-bar-wrap {
            pointer-events: auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(226, 232, 240, 0.9);
            border-radius: 12px;
            padding: 7px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
          }
          .search-input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 13px;
            font-weight: 500;
            color: #0f172a;
            outline: none;
            font-family: inherit;
          }
          .search-badge {
            background: #0284c7;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 20px;
            white-space: nowrap;
          }

          /* Quick Filter Chips */
          .filter-chips {
            pointer-events: auto;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 2px;
            scrollbar-width: none;
          }
          .filter-chips::-webkit-scrollbar { display: none; }
          .chip {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(203, 213, 225, 0.8);
            border-radius: 20px;
            padding: 4px 11px;
            font-size: 11px;
            font-weight: 600;
            color: #334155;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;
          }
          .chip:hover, .chip.active {
            background: #0284c7;
            color: #ffffff;
            border-color: #0284c7;
          }

          /* Floating Controls */
          .floating-controls {
            position: absolute;
            right: 12px;
            bottom: 200px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .map-control-btn {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          /* Custom Markers */
          .custom-kendra-icon {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 3px 10px rgba(2, 132, 199, 0.45);
            border: 2px solid #ffffff;
            cursor: pointer;
          }
          .custom-user-icon {
            background: #2563eb;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            border: 3px solid white;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.35);
          }

          /* Bottom Kendra Drawer (Focused strictly on GPS Nearby) */
          .store-drawer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-top: 1px solid #e2e8f0;
            border-top-left-radius: 18px;
            border-top-right-radius: 18px;
            padding: 10px 12px 12px 12px;
            box-shadow: 0 -6px 24px rgba(15, 23, 42, 0.12);
            max-height: 190px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .drawer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .drawer-title {
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .drawer-subtitle {
            font-size: 11px;
            color: #0284c7;
            font-weight: 700;
          }
          .store-cards-carousel {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 2px 2px 4px 2px;
            scrollbar-width: thin;
          }
          .store-card-item {
            flex: 0 0 260px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 10px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .store-card-item:hover, .store-card-item.active {
            border-color: #0284c7;
            background: #f0f9ff;
          }
          .store-card-name {
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .store-card-sub {
            font-size: 10px;
            color: #64748b;
            line-height: 1.3;
            height: 26px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .store-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 6px;
            padding-top: 4px;
            border-top: 1px solid #f1f5f9;
          }
          .store-dist-tag {
            font-size: 10px;
            font-weight: 800;
            color: #0284c7;
            background: #e0f2fe;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .nav-action-btn {
            background: #0284c7;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            text-decoration: none;
          }
          .nav-action-btn:hover { background: #0369a1; }

          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
          }
          .leaflet-popup-content { margin: 0; line-height: 1.4; }
          .popup-inner { padding: 12px 14px; min-width: 220px; max-width: 270px; }
          .popup-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
          .popup-operator { font-size: 11px; color: #0284c7; font-weight: 600; margin-bottom: 3px; }
          .popup-addr { font-size: 10px; color: #64748b; margin-bottom: 6px; }
          .popup-btn {
            display: block;
            background: #0284c7;
            color: #ffffff;
            text-decoration: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div id="map-container">
          <div id="map"></div>

          <div class="floating-header">
            <div class="search-bar-wrap">
              <span style="font-size: 14px;">🔍</span>
              <input id="search-input" class="search-input" type="text" placeholder="Search area or pincode..." autocomplete="off" />
              <span id="store-count-badge" class="search-badge">GPS Nearby</span>
            </div>
            <div class="filter-chips">
              <button class="chip active" onclick="filterByArea('NEARBY')">📍 Nearest to GPS</button>
              <button class="chip" onclick="filterByArea('ALL')">All 75</button>
              <button class="chip" onclick="filterByArea('5KM')">&lt; 5 km</button>
              <button class="chip" onclick="filterByArea('Borivali')">Borivali</button>
              <button class="chip" onclick="filterByArea('Andheri')">Andheri</button>
              <button class="chip" onclick="filterByArea('Ghatkopar')">Ghatkopar</button>
              <button class="chip" onclick="filterByArea('Dadar')">Dadar</button>
              <button class="chip" onclick="filterByArea('Malad')">Malad</button>
            </div>
          </div>

          <div class="floating-controls">
            <button class="map-control-btn" title="Recenter Location" onclick="recenterMap()">📍</button>
            <button class="map-control-btn" title="Navigate to Closest" onclick="navigateToClosest()">🧭</button>
            <button class="map-control-btn" title="Fit Markers" onclick="fitAllKendras()">🗺️</button>
          </div>

          <div class="store-drawer">
            <div class="drawer-header">
              <div class="drawer-title">
                <span>📍 Nearby Jan Aushadhi Kendras</span>
                <span style="font-size:10px; color:#10b981;">● GPS Active</span>
              </div>
              <span id="drawer-count-text" class="drawer-subtitle">Sorted by distance</span>
            </div>
            <div id="cards-carousel" class="store-cards-carousel"></div>
          </div>
        </div>

        <script>
          const userLat = ${defaultLat};
          const userLon = ${defaultLon};
          const allStores = ${JSON.stringify(allStoresWithDistance)};
          let currentFilteredStores = allStores.slice(0, 8); // Default strictly to closest GPS stores
          let markersMap = {};

          const map = L.map('map', { 
            zoomControl: false,
            attributionControl: false
          }).setView([userLat, userLon], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

          const userIcon = L.divIcon({
            className: 'u-pin-wrap',
            html: '<div class="custom-user-icon"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          const userMarker = L.marker([userLat, userLon], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>📍 Your GPS Location</b>');

          function renderMarkers(stores) {
            Object.values(markersMap).forEach(m => map.removeLayer(m));
            markersMap = {};

            const kendraIcon = L.divIcon({
              className: 'k-pin-wrap',
              html: '<div class="custom-kendra-icon">💊</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            stores.forEach(s => {
              const lat = Number(s.latitude);
              const lon = Number(s.longitude);
              if (lat && lon) {
                const popupContent = \`
                  <div class="popup-inner">
                    <div class="popup-title">\${s.store_name}</div>
                    <div class="popup-operator">👤 \${s.operator_name}</div>
                    <div class="popup-addr">📍 \${s.address}</div>
                    <div style="font-size:10px; color:#0284c7; font-weight:700; margin-bottom:6px;">
                      🚗 \${s.distance_km} km away | PIN: \${s.pincode}
                    </div>
                    <a class="popup-btn" href="https://www.google.com/maps/dir/?api=1&destination=\${lat},\${lon}&travelmode=driving" target="_blank">
                      🧭 Navigate on Google Maps
                    </a>
                  </div>
                \`;

                const marker = L.marker([lat, lon], { icon: kendraIcon })
                  .addTo(map)
                  .bindPopup(popupContent);

                marker.on('click', () => focusStore(s.id, false));
                markersMap[s.id] = marker;
              }
            });
          }

          function renderDrawerCards(stores) {
            const container = document.getElementById('cards-carousel');
            container.innerHTML = '';
            document.getElementById('drawer-count-text').innerText = \`\${stores.length} closest stores\`;
            document.getElementById('store-count-badge').innerText = \`\${stores.length} Kendras\`;

            stores.forEach(s => {
              const card = document.createElement('div');
              card.id = \`card-\${s.id}\`;
              card.className = 'store-card-item';
              card.onclick = () => focusStore(s.id, true);

              card.innerHTML = \`
                <div>
                  <div class="store-card-name">\${s.store_name}</div>
                  <div class="store-card-sub">📍 \${s.address}</div>
                </div>
                <div class="store-card-footer">
                  <span class="store-dist-tag">🚗 \${s.distance_km} km</span>
                  <a class="nav-action-btn" href="https://www.google.com/maps/dir/?api=1&destination=\${s.latitude},\${s.longitude}&travelmode=driving" target="_blank" onclick="event.stopPropagation()">
                    🧭 Navigate
                  </a>
                </div>
              \`;
              container.appendChild(card);
            });
          }

          function focusStore(storeId, openPopup = true) {
            const store = allStores.find(s => s.id === storeId);
            if (!store) return;
            map.flyTo([store.latitude, store.longitude], 15, { animate: true, duration: 0.8 });
            document.querySelectorAll('.store-card-item').forEach(c => c.classList.remove('active'));
            const activeCard = document.getElementById(\`card-\${storeId}\`);
            if (activeCard) {
              activeCard.classList.add('active');
              activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
            if (openPopup && markersMap[storeId]) {
              setTimeout(() => markersMap[storeId].openPopup(), 300);
            }
          }

          function recenterMap() {
            map.flyTo([userLat, userLon], 14, { animate: true, duration: 0.8 });
            userMarker.openPopup();
          }

          function navigateToClosest() {
            if (allStores.length > 0) {
              const closest = allStores[0];
              focusStore(closest.id, true);
              window.open(\`https://www.google.com/maps/dir/?api=1&destination=\${closest.latitude},\${closest.longitude}&travelmode=driving\`, '_blank');
            }
          }

          function fitAllKendras() {
            const bounds = [[userLat, userLon], ...currentFilteredStores.map(s => [s.latitude, s.longitude])];
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
          }

          function filterByArea(areaKeyword) {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');

            if (areaKeyword === 'NEARBY') {
              currentFilteredStores = allStores.slice(0, 8);
            } else if (areaKeyword === 'ALL') {
              currentFilteredStores = [...allStores];
            } else if (areaKeyword === '5KM') {
              currentFilteredStores = allStores.filter(s => parseFloat(s.distance_km) <= 5.0);
            } else {
              currentFilteredStores = allStores.filter(s => 
                s.area.toLowerCase().includes(areaKeyword.toLowerCase()) ||
                s.address.toLowerCase().includes(areaKeyword.toLowerCase()) ||
                s.store_name.toLowerCase().includes(areaKeyword.toLowerCase())
              );
            }
            renderMarkers(currentFilteredStores);
            renderDrawerCards(currentFilteredStores);
            fitAllKendras();
          }

          document.getElementById('search-input').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (!q) {
              currentFilteredStores = allStores.slice(0, 8);
            } else {
              currentFilteredStores = allStores.filter(s =>
                s.store_name.toLowerCase().includes(q) ||
                s.area.toLowerCase().includes(q) ||
                s.pincode.includes(q) ||
                s.address.toLowerCase().includes(q) ||
                s.kendra_code.toLowerCase().includes(q)
              );
            }
            renderMarkers(currentFilteredStores);
            renderDrawerCards(currentFilteredStores);
          });

          // Fast Initial Render (Nearest GPS stores)
          renderMarkers(allStores);
          renderDrawerCards(currentFilteredStores);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <iframe
          title="Dynamic Jan Aushadhi Locator"
          srcDoc={leafletHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapWrapper: {
    flex: 1,
    minHeight: 480,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    position: 'relative',
  },
});

export default JanAushadhiMap;
