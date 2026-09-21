import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { JAN_AUSHADHI_ALL_STORES, JanAushadhiStore } from '@/data/janAushadhiStores';

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

  const allStoresWithDistance = useMemo(() => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const source = nearbyStores.length > 10 ? nearbyStores : JAN_AUSHADHI_ALL_STORES;

    return source.map(store => {
      const dist = calculateDistance(defaultLat, defaultLon, Number(store.latitude), Number(store.longitude));
      return {
        ...store,
        distance_km: store.distance_km || dist.toFixed(1)
      };
    }).sort((a, b) => parseFloat(String(a.distance_km)) - parseFloat(String(b.distance_km)));
  }, [defaultLat, defaultLon, nearbyStores]);

  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #map-container { height: 100%; width: 100%; font-family: -apple-system, Roboto, sans-serif; overflow: hidden; position: relative; }
          #map { height: 100%; width: 100%; z-index: 1; }

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
            border-radius: 12px;
            padding: 7px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
          }
          .search-input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 13px;
            color: #0f172a;
            outline: none;
          }
          .search-badge {
            background: #0284c7;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 12px;
          }

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
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #cbd5e1;
            border-radius: 16px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            color: #334155;
            white-space: nowrap;
          }
          .chip.active {
            background: #0284c7;
            color: #ffffff;
            border-color: #0284c7;
          }

          .custom-kendra-icon {
            background: #0284c7;
            color: white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 3px 8px rgba(2, 132, 199, 0.45);
            border: 2px solid white;
          }
          .custom-user-icon {
            background: #2563eb;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            border: 3px solid white;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4);
          }

          .store-drawer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.97);
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            padding: 8px 10px 10px 10px;
            box-shadow: 0 -4px 16px rgba(0,0,0,0.1);
            border-top: 1px solid #e2e8f0;
            max-height: 170px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .store-cards-carousel {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 2px;
          }
          .store-card-item {
            flex: 0 0 240px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .store-card-name {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .store-card-sub {
            font-size: 10px;
            color: #64748b;
            line-height: 1.3;
            height: 24px;
            overflow: hidden;
          }
          .store-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 4px;
          }
          .store-dist-tag {
            font-size: 10px;
            font-weight: 700;
            color: #0284c7;
            background: #e0f2fe;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .nav-action-btn {
            background: #0284c7;
            color: #ffffff;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            text-decoration: none;
          }

          .leaflet-popup-content-wrapper { border-radius: 12px; font-family: -apple-system, sans-serif; }
          .popup-title { font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px; }
          .popup-code { font-size: 10px; color: #0284c7; font-weight: bold; margin-bottom: 3px; }
          .popup-sub { font-size: 11px; color: #475569; margin-bottom: 6px; }
          .popup-nav {
            display: block;
            background: #0284c7;
            color: #fff;
            text-align: center;
            text-decoration: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div id="map-container">
          <div id="map"></div>

          <div class="floating-header">
            <div class="search-bar-wrap">
              <span>🔍</span>
              <input id="search-input" class="search-input" type="text" placeholder="Search area or pincode..." />
              <span id="badge-count" class="search-badge">GPS Nearby</span>
            </div>
            <div class="filter-chips">
              <button class="chip active" onclick="filterArea('NEARBY')">📍 Nearest to GPS</button>
              <button class="chip" onclick="filterArea('ALL')">All 75</button>
              <button class="chip" onclick="filterArea('5KM')">&lt; 5 km</button>
              <button class="chip" onclick="filterArea('Borivali')">Borivali</button>
              <button class="chip" onclick="filterArea('Andheri')">Andheri</button>
              <button class="chip" onclick="filterArea('Dadar')">Dadar</button>
              <button class="chip" onclick="filterArea('Ghatkopar')">Ghatkopar</button>
            </div>
          </div>

          <div class="store-drawer">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#0f172a;">📍 Nearby Jan Aushadhi Kendras</span>
              <span id="drawer-subtitle" style="font-size:10px; color:#64748b;">GPS Distance</span>
            </div>
            <div id="cards-carousel" class="store-cards-carousel"></div>
          </div>
        </div>

        <script>
          const userLat = ${defaultLat};
          const userLon = ${defaultLon};
          const allStores = ${JSON.stringify(allStoresWithDistance)};
          let currentStores = allStores.slice(0, 8); // Nearest 8 stores to GPS
          let markers = {};

          const map = L.map('map', { zoomControl: false }).setView([userLat, userLon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

          const userIcon = L.divIcon({
            className: 'u-pin',
            html: '<div class="custom-user-icon"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          L.marker([userLat, userLon], { icon: userIcon }).addTo(map).bindPopup('<b>📍 Your Location</b>');

          const kendraIcon = L.divIcon({
            className: 'k-pin',
            html: '<div class="custom-kendra-icon">💊</div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          function renderMarkers(stores) {
            Object.values(markers).forEach(m => map.removeLayer(m));
            markers = {};

            stores.forEach(s => {
              const lat = Number(s.latitude);
              const lon = Number(s.longitude);
              if (lat && lon) {
                const html = \`
                  <div style="min-width:180px;">
                    <div class="popup-title">\${s.store_name}</div>
                    <div class="popup-code">\${s.kendra_code}</div>
                    <div class="popup-sub">📍 \${s.address}</div>
                    <div style="font-size:11px; color:#0284c7; font-weight:bold;">🚗 \${s.distance_km} km away</div>
                    <a class="popup-nav" href="https://www.google.com/maps/dir/?api=1&destination=\${lat},\${lon}&travelmode=driving" target="_blank">
                      🧭 Navigate (Maps)
                    </a>
                  </div>
                \`;
                const m = L.marker([lat, lon], { icon: kendraIcon }).addTo(map).bindPopup(html);
                m.on('click', () => focusStore(s.id, false));
                markers[s.id] = m;
              }
            });
          }

          function renderCards(stores) {
            const container = document.getElementById('cards-carousel');
            container.innerHTML = '';
            document.getElementById('badge-count').innerText = \`\${stores.length} Kendras\`;
            document.getElementById('drawer-subtitle').innerText = \`Showing \${stores.length} stores\`;

            stores.forEach(s => {
              const el = document.createElement('div');
              el.className = 'store-card-item';
              el.onclick = () => focusStore(s.id, true);
              el.innerHTML = \`
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
              container.appendChild(el);
            });
          }

          function focusStore(id, openPopup) {
            const s = allStores.find(x => x.id === id);
            if (!s) return;
            map.flyTo([s.latitude, s.longitude], 15, { animate: true, duration: 0.8 });
            if (openPopup && markers[id]) {
              setTimeout(() => markers[id].openPopup(), 300);
            }
          }

          function filterArea(area) {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            if (area === 'NEARBY') {
              currentStores = allStores.slice(0, 8);
            } else if (area === 'ALL') {
              currentStores = [...allStores];
            } else if (area === '5KM') {
              currentStores = allStores.filter(s => parseFloat(s.distance_km) <= 5.0);
            } else {
              currentStores = allStores.filter(s => s.area.toLowerCase().includes(area.toLowerCase()) || s.address.toLowerCase().includes(area.toLowerCase()));
            }
            renderMarkers(currentStores);
            renderCards(currentStores);
          }

          document.getElementById('search-input').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            currentStores = q ? allStores.filter(s => s.store_name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.pincode.includes(q)) : allStores.slice(0, 8);
            renderMarkers(currentStores);
            renderCards(currentStores);
          });

          renderMarkers(allStores);
          renderCards(currentStores);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <WebView
          originWhitelist={['*']}
          source={{ html: leafletHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
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
    minHeight: 380,
  },
  map: {
    flex: 1,
  },
});

export default JanAushadhiMap;
