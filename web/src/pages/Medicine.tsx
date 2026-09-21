// src/pages/Medicine.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Medicine } from '../types/medicine';
import { fallbackMedicines } from '../data/fallbackMedicines';
import { JAN_AUSHADHI_ALL_STORES, JanAushadhiStore } from '../data/janAushadhiStores';
import '../styles/medicine.css';

const Medicine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'kendras'>('directory');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [kendraSearch, setKendraSearch] = useState('');
  const [selectedAreaChip, setSelectedAreaChip] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Default Mumbai user location
  const userLat = 19.0760;
  const userLon = 72.8777;

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setIsOfflineMode(false);
      
      console.log('🔍 Fetching medicines from Supabase...');
      
      const { data, error } = await supabase
        .from('Medicines')
        .select('*');

      if (error || !data || data.length === 0) {
        console.warn('⚠️ Supabase fetch issue, using fallback directory:', error);
        useFallbackData();
        return;
      }

      console.log(`✅ Loaded ${data.length} medicines from Supabase`);
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (err: any) {
      console.warn('⚠️ Failed to fetch medicines from network. Loading fallback directory:', err);
      useFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackData = () => {
    setIsOfflineMode(true);
    setMedicines(fallbackMedicines);
    setFilteredMedicines(fallbackMedicines);
  };

  // Filter medicines based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = medicines.filter(med =>
        med.product_name?.toLowerCase().includes(query) ||
        med.salt_composition?.toLowerCase().includes(query) ||
        med.sub_category?.toLowerCase().includes(query) ||
        med.product_manufactured?.toLowerCase().includes(query)
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
    setCurrentPage(1);
  }, [medicines, searchQuery]);

  // Filter and sort Jan Aushadhi Kendras
  const sortedKendras = useMemo(() => {
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

    return JAN_AUSHADHI_ALL_STORES.map(store => ({
      ...store,
      distance_km: calculateDistance(userLat, userLon, store.latitude, store.longitude).toFixed(1)
    })).sort((a, b) => parseFloat(a.distance_km) - parseFloat(b.distance_km));
  }, [userLat, userLon]);

  const filteredKendras = useMemo(() => {
    let list = sortedKendras;
    if (selectedAreaChip !== 'ALL') {
      list = list.filter(k => 
        k.area.toLowerCase().includes(selectedAreaChip.toLowerCase()) ||
        k.address.toLowerCase().includes(selectedAreaChip.toLowerCase()) ||
        k.store_name.toLowerCase().includes(selectedAreaChip.toLowerCase())
      );
    }
    if (kendraSearch.trim()) {
      const q = kendraSearch.toLowerCase();
      list = list.filter(k => 
        k.store_name.toLowerCase().includes(q) ||
        k.area.toLowerCase().includes(q) ||
        k.pincode.includes(q) ||
        k.address.toLowerCase().includes(q) ||
        k.kendra_code.toLowerCase().includes(q) ||
        k.operator_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sortedKendras, selectedAreaChip, kendraSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatPrice = (price: string) => {
    if (!price) return 'N/A';
    return price.startsWith('₹') ? price : `₹${price}`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

  // Generate Leaflet Map HTML for 75 Kendras
  const leafletMapHtml = useMemo(() => {
    return `
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
            html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; position: relative; }
            
            .custom-kendra-icon {
              background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
              color: white;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
              box-shadow: 0 4px 14px rgba(2, 132, 199, 0.45);
              border: 2.5px solid white;
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .custom-kendra-icon:hover {
              transform: scale(1.25) translateY(-2px);
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
            }
            .custom-user-icon {
              background: #2563eb;
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.35);
              position: relative;
            }
            .custom-user-icon::after {
              content: '';
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.2);
              animation: radar 2s infinite ease-out;
            }
            @keyframes radar {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(1.8); opacity: 0; }
            }

            .leaflet-popup-content-wrapper {
              border-radius: 16px;
              box-shadow: 0 16px 36px rgba(15, 23, 42, 0.2);
              padding: 0;
              overflow: hidden;
            }
            .leaflet-popup-content { margin: 0; }
            .popup-inner { padding: 14px 16px; min-width: 240px; max-width: 290px; }
            .popup-badge { 
              display: inline-block; 
              background: #e0f2fe; 
              color: #0284c7; 
              font-size: 11px; 
              font-weight: 800; 
              padding: 2px 8px; 
              border-radius: 12px; 
            }
            .popup-code {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              background: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              margin-left: 4px;
            }
            .popup-title { font-weight: 800; font-size: 14px; color: #0f172a; margin: 4px 0 2px 0; }
            .popup-operator { font-size: 12px; color: #0284c7; font-weight: 600; margin-bottom: 4px; }
            .popup-desc { font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.4; max-height: 60px; overflow-y: auto; }
            .popup-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #0284c7;
              color: white;
              text-decoration: none;
              padding: 8px 12px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              text-align: center;
            }
            .popup-btn:hover { background: #0369a1; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const map = L.map('map', { zoomControl: true }).setView([${userLat}, ${userLon}], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors | PMBJP'
            }).addTo(map);

            const userIcon = L.divIcon({
              className: 'user-pin-wrap',
              html: '<div class="custom-user-icon"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            L.marker([${userLat}, ${userLon}], { icon: userIcon })
              .addTo(map)
              .bindPopup('<b>📍 Your Location (Mumbai)</b>');

            const kendraIcon = L.divIcon({
              className: 'kendra-pin-wrap',
              html: '<div class="custom-kendra-icon">💊</div>',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            const stores = ${JSON.stringify(sortedKendras)};
            const bounds = [[${userLat}, ${userLon}]];

            stores.forEach(s => {
              const lat = Number(s.latitude);
              const lon = Number(s.longitude);
              if (lat && lon) {
                bounds.push([lat, lon]);
                const popupHtml = \`
                  <div class="popup-inner">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="popup-badge">PMBJP Kendra</span>
                      <span class="popup-code">\${s.kendra_code}</span>
                    </div>
                    <div class="popup-title">\${s.store_name}</div>
                    <div class="popup-operator">👤 \${s.operator_name}</div>
                    <div class="popup-desc">📍 \${s.address}</div>
                    <div style="font-size:11px; color:#0284c7; font-weight:700; margin-bottom:8px;">
                      🚗 \${s.distance_km} km away | PIN: \${s.pincode} | 📞 \${s.phone}
                    </div>
                    <a class="popup-btn" href="https://www.google.com/maps/dir/?api=1&destination=\${lat},\${lon}&travelmode=driving" target="_blank">
                      🧭 Navigate (Google Maps) ↗
                    </a>
                  </div>
                \`;
                L.marker([lat, lon], { icon: kendraIcon })
                  .addTo(map)
                  .bindPopup(popupHtml);
              }
            });

            if (bounds.length > 1) {
              map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
            }
          </script>
        </body>
      </html>
    `;
  }, [sortedKendras, userLat, userLon]);

  if (loading) {
    return (
      <div className="medicine-page skeleton-page">
        <div className="medicine-header">
          <div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-subtitle" style={{ display: 'block' }}></div>
          </div>
          <div className="skeleton skeleton-btn"></div>
        </div>
        <div className="search-container">
          <div className="skeleton skeleton-search"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="medicine-page">
      {/* Header with Navigation Tabs */}
      <div className="medicine-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1>💊 Generic Medicines & PMBJP Kendras</h1>
            {isOfflineMode && (
              <span className="offline-pill-badge">
                ⚡ Offline Presets Loaded
              </span>
            )}
          </div>
          <p className="medicine-count">
            {activeTab === 'directory' ? `${medicines.length} Medicines Registered` : `${JAN_AUSHADHI_ALL_STORES.length} Official PMBJP Kendras Mapped`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className={`refresh-btn ${activeTab === 'directory' ? 'active-tab-btn' : ''}`}
            style={{ background: activeTab === 'directory' ? '#0474FC' : '#E2E8F0', color: activeTab === 'directory' ? '#FFF' : '#334155' }}
            onClick={() => setActiveTab('directory')}
          >
            📋 Medicine Directory
          </button>
          <button 
            className={`refresh-btn ${activeTab === 'kendras' ? 'active-tab-btn' : ''}`}
            style={{ background: activeTab === 'kendras' ? '#0EA5E9' : '#E2E8F0', color: activeTab === 'kendras' ? '#FFF' : '#334155' }}
            onClick={() => setActiveTab('kendras')}
          >
            📍 PMBJP Kendra Map ({JAN_AUSHADHI_ALL_STORES.length})
          </button>
          <button className="refresh-btn" onClick={loadMedicines}>
            🔄 Sync
          </button>
        </div>
      </div>

      {activeTab === 'kendras' ? (
        /* Jan Aushadhi Kendra Map & Directory View */
        <div className="kendra-view-section">
          {/* Interactive Dynamic Leaflet Map */}
          <div style={{ 
            height: '460px', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            marginBottom: '16px'
          }}>
            <iframe 
              title="PMBJP Kendras Dynamic Map"
              srcDoc={leafletMapHtml}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>

          {/* Quick Locality Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
            {['ALL', 'Borivali', 'Andheri', 'Dadar', 'Ghatkopar', 'Malad', 'Kurla', 'Kandivali', 'Bhandup', 'Thane'].map((area) => (
              <button
                key={area}
                onClick={() => setSelectedAreaChip(area)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: selectedAreaChip === area ? '1px solid #0284c7' : '1px solid var(--border)',
                  background: selectedAreaChip === area ? '#0284c7' : 'var(--surface)',
                  color: selectedAreaChip === area ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {area === 'ALL' ? '🗺️ All 75 Kendras' : area}
              </button>
            ))}
          </div>

          {/* Kendra Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search Kendras by Area, Pin Code (e.g. 400091, Borivali, Ghatkopar, Dadar), or Licensee..."
                value={kendraSearch}
                onChange={(e) => setKendraSearch(e.target.value)}
                className="search-input"
              />
              {kendraSearch && (
                <button className="clear-search" onClick={() => setKendraSearch('')}>
                  ✕
                </button>
              )}
              <span className="search-count">
                {filteredKendras.length} of {JAN_AUSHADHI_ALL_STORES.length} Kendras
              </span>
            </div>
          </div>

          {/* Kendras Grid List */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            {filteredKendras.map((kendra) => (
              <div 
                key={kendra.id} 
                style={{
                  background: 'var(--surface)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '12px' }}>
                      🚗 {kendra.distance_km} km away
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {kendra.kendra_code}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {kendra.store_name}
                  </h3>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', margin: '0 0 6px 0' }}>
                    👤 {kendra.operator_name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    📍 {kendra.address}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                    <b>PIN:</b> {kendra.pincode} | <b>📞</b> {kendra.phone}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${kendra.latitude},${kendra.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#0284c7',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}
                  >
                    🧭 Navigate (Google Maps) ↗
                  </a>
                  <a
                    href={`tel:${kendra.phone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      color: '#334155',
                      textDecoration: 'none',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                    title="Call Kendra"
                  >
                    📞
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Medicine Directory View */
        <>
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, salt, category, or manufacturer..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
              <span className="search-count">
                {filteredMedicines.length} results
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="medicine-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Salt Composition</th>
                  <th>Manufacturer</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentMedicines.map((medicine, index) => (
                  <tr key={medicine.Id}>
                    <td>{startIndex + index + 1}</td>
                    <td className="product-name">{medicine.product_name || 'N/A'}</td>
                    <td>
                      <span className="category-badge">{medicine.sub_category || 'Uncategorized'}</span>
                    </td>
                    <td>{medicine.salt_composition || 'N/A'}</td>
                    <td>{medicine.product_manufactured || 'N/A'}</td>
                    <td className="price">{formatPrice(medicine.product_price)}</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedMedicine(medicine)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMedicines.length === 0 && (
              <div className="no-results">
                <p>No medicines found matching your search query.</p>
                <button onClick={() => setSearchQuery('')}>Clear Search</button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages} 
                (Showing {startIndex + 1} - {Math.min(endIndex, filteredMedicines.length)} of {filteredMedicines.length})
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedMedicine && (
        <div className="modal-overlay" onClick={() => setSelectedMedicine(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMedicine(null)}>×</button>
            
            <h2 className="modal-title">{selectedMedicine.product_name || 'Unnamed Medicine'}</h2>
            
            <div className="modal-body">
              <div className="modal-detail">
                <span className="modal-label">Category</span>
                <span>{selectedMedicine.sub_category || 'N/A'}</span>
              </div>
              <div className="modal-detail">
                <span className="modal-label">Salt Composition</span>
                <span>{selectedMedicine.salt_composition || 'N/A'}</span>
              </div>
              <div className="modal-detail">
                <span className="modal-label">Price</span>
                <span className="modal-price">{formatPrice(selectedMedicine.product_price)}</span>
              </div>
              <div className="modal-detail">
                <span className="modal-label">Manufactured By</span>
                <span>{selectedMedicine.product_manufactured || 'N/A'}</span>
              </div>
              {selectedMedicine.medicine_desc && (
                <div className="modal-detail">
                  <span className="modal-label">Description</span>
                  <p>{selectedMedicine.medicine_desc}</p>
                </div>
              )}
              {selectedMedicine.side_effects && (
                <div className="modal-detail">
                  <span className="modal-label">Side Effects</span>
                  <p>{selectedMedicine.side_effects}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicine;