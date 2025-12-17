import React from 'react';
import { useNavigate } from 'react-router-dom';
import PriceDifferenceBadge from './PriceDifferenceBadge';
import { formatPrice } from '../utils/formatPrice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #e0e0e0'
  };
  
  const handleCardHover = (e, isHovering) => {
    if (isHovering) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
    } else {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }
  };
  
  return (
    <div 
      style={cardStyle}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={(e) => handleCardHover(e, true)}
      onMouseLeave={(e) => handleCardHover(e, false)}
    >
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '8px',
        color: '#1a1a1a'
      }}>
        {product.name}
      </h3>
      
      <p style={{ 
        fontSize: '13px', 
        color: '#666', 
        marginBottom: '16px',
        fontFamily: 'monospace'
      }}>
        {product.model_code}
      </p>
      
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Total Paid
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
          {formatPrice(product.total_paid_price)}
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Best Market Price
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#2563eb' }}>
          {formatPrice(product.best_market_price)}
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <PriceDifferenceBadge 
          totalPaid={product.total_paid_price} 
          bestMarket={product.best_market_price} 
        />
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        flexWrap: 'wrap',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        {product.vendors.map(vendor => (
          <div 
            key={vendor.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          >
            <span style={{ fontWeight: '600', color: '#495057' }}>
              {vendor.name}
            </span>
            <span style={{ color: '#6c757d' }}>
              {vendor.price ? formatPrice(vendor.price) : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
