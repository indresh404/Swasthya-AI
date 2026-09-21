// src/pages/Medicine.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Medicine } from '../types/medicine';
import { fallbackMedicines } from '../data/fallbackMedicines';
import '../styles/medicine.css';

const Medicine: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

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
              {[...Array(8)].map((_, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '80%', display: 'block' }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-badge" style={{ display: 'block' }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '90%', display: 'block' }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '70%', display: 'block' }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '40px', display: 'block' }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-action" style={{ display: 'block' }}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="medicine-page">
      <div className="medicine-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1>💊 Medicine Directory</h1>
            {isOfflineMode && (
              <span className="offline-pill-badge">
                ⚡ Offline Presets Loaded
              </span>
            )}
          </div>
          <p className="medicine-count">Total: {medicines.length} medicines registered</p>
        </div>
        <button className="refresh-btn" onClick={loadMedicines}>
          🔄 Refresh Sync
        </button>
      </div>

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