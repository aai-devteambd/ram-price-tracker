import React from 'react';
import { formatPrice } from '../utils/formatPrice';
import { calculateDifference } from '../utils/calculateDifference';

const PriceDifferenceBadge = ({ totalPaid, bestMarket }) => {
  const diff = calculateDifference(totalPaid, bestMarket);
  
  const badgeStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: diff.isSaving ? '#d4edda' : '#f8d7da',
    color: diff.isSaving ? '#155724' : '#721c24',
    border: `1px solid ${diff.isSaving ? '#c3e6cb' : '#f5c6cb'}`
  };
  
  return (
    <span style={badgeStyle}>
      {diff.isSaving ? '↓' : '↑'} {formatPrice(diff.amount)} ({diff.percentage}%)
    </span>
  );
};

export default PriceDifferenceBadge;
