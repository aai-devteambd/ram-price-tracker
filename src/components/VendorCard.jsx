import React from 'react';
import { formatPrice } from '../utils/formatPrice';

const VendorCard = ({ vendor, onUpdatePrice }) => {
  const getStockBadgeStyle = () => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block'
    };
    
    switch (vendor.availability) {
      case 'IN_STOCK':
        return {
          ...baseStyle,
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        };
      case 'OUT_OF_STOCK':
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#e2e3e5',
          color: '#383d41',
          border: '1px solid #d6d8db'
        };
    }
  };
  
  const getBorderColor = () => {
    switch (vendor.availability) {
      case 'IN_STOCK':
        return '#28a745';
      case 'OUT_OF_STOCK':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return date.toLocaleDateString();
  };
  
  return (
    <div style={{
      backgroundColor: 'white',
      border: `2px solid ${getBorderColor()}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1a1a1a'
          }}>
            {vendor.name}
          </h3>
          <div style={getStockBadgeStyle()}>
            {vendor.availability.replace('_', ' ')}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
            {formatPrice(vendor.price)}
          </div>
          {vendor.manual_override && (
            <span style={{
              fontSize: '11px',
              color: '#856404',
              backgroundColor: '#fff3cd',
              padding: '2px 6px',
              borderRadius: '4px',
              display: 'inline-block',
              marginTop: '4px'
            }}>
              Manual Override
            </span>
          )}
        </div>
      </div>
      
      <div style={{ 
        fontSize: '13px', 
        color: '#6c757d',
        marginBottom: '16px'
      }}>
        Last checked: {formatDate(vendor.last_checked_at)}
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        {vendor.product_url && (
          <a
            href={vendor.product_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Open Store
          </a>
        )}
        
        <button
          onClick={() => onUpdatePrice(vendor)}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: 'white',
            color: '#2563eb',
            border: '2px solid #2563eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#2563eb';
          }}
        >
          Update Price
        </button>
      </div>
    </div>
  );
};

export default VendorCard;
