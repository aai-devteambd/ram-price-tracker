import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VendorCard from '../components/VendorCard';
import PriceDifferenceBadge from '../components/PriceDifferenceBadge';
import ManualUpdateModal from '../components/ManualUpdateModal';
import useProductStore from '../hooks/useProducts';
import { formatPrice } from '../utils/formatPrice';
import { fetchGoogleShoppingResults } from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState(null);
  const [shoppingResults, setShoppingResults] = useState({ qatar: [], uk: [] });
  const [loadingShoppingResults, setLoadingShoppingResults] = useState(false);
  
  const product = useProductStore((state) => state.getProductById(id));
  const updateVendorPrice = useProductStore((state) => state.updateVendorPrice);
  const refreshProduct = useProductStore((state) => state.refreshProduct);
  
  useEffect(() => {
    if (!product) {
      // If product not found, navigate back to dashboard
      navigate('/');
    } else {
      // Fetch Google Shopping results when product loads
      loadShoppingResults();
    }
  }, [product, navigate]);
  
  const loadShoppingResults = async () => {
    if (!product) return;
    
    setLoadingShoppingResults(true);
    try {
      const results = await fetchGoogleShoppingResults(product.model_code);
      setShoppingResults(results);
    } catch (error) {
      console.error('Failed to load shopping results:', error);
      setShoppingResults({ qatar: [], uk: [] });
    } finally {
      setLoadingShoppingResults(false);
    }
  };
  
  if (!product) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Product not found</h2>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const handleUpdatePrice = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };
  
  const handleSavePrice = (productId, vendorId, price, availability, manualOverride) => {
    updateVendorPrice(productId, vendorId, price, availability, manualOverride);
  };
  
  const handleRefresh = async () => {
    if (!product) return;
    
    setIsRefreshing(true);
    setRefreshMessage(null);
    
    try {
      await refreshProduct(product.model_code);
      setRefreshMessage({ type: 'success', text: 'Prices updated successfully from n8n backend!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (error) {
      setRefreshMessage({ 
        type: 'error', 
        text: `Failed to refresh prices: ${error.message}` 
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            marginBottom: '24px',
            padding: '10px 20px',
            backgroundColor: 'white',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#495057',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Dashboard
        </button>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px'
        }}>
          {/* Left Column - Product Info */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              top: '20px'
            }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                {product.name}
              </h1>
              
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                fontFamily: 'monospace',
                marginBottom: '32px',
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                {product.model_code}
              </p>
              
              <div style={{
                borderTop: '2px solid #f0f0f0',
                paddingTop: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    Total Paid Price
                  </div>
                  <div style={{
                    fontSize: '40px',
                    fontWeight: '700',
                    color: '#1a1a1a'
                  }}>
                    {formatPrice(product.total_paid_price)}
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    Best Market Price
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#2563eb'
                  }}>
                    {formatPrice(product.best_market_price)}
                  </div>
                </div>
                
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    Difference
                  </div>
                  <PriceDifferenceBadge 
                    totalPaid={product.total_paid_price} 
                    bestMarket={product.best_market_price} 
                  />
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: isRefreshing ? '#cbd5e1' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isRefreshing) {
                    e.target.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRefreshing) {
                    e.target.style.backgroundColor = '#10b981';
                  }
                }}
              >
                {isRefreshing ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: '18px',
                      height: '18px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Refreshing from n8n...
                  </>
                ) : (
                  <>
                    🔄 Refresh Prices
                  </>
                )}
              </button>
              
              {refreshMessage && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: refreshMessage.type === 'success' ? '#d1fae5' : '#fecaca',
                  color: refreshMessage.type === 'success' ? '#065f46' : '#991b1b',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: `1px solid ${refreshMessage.type === 'success' ? '#a7f3d0' : '#fca5a5'}`
                }}>
                  {refreshMessage.text}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Vendor Cards */}
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '20px'
            }}>
              Vendor Prices
            </h2>
            
            {product.vendors.map((vendor) => (
              <VendorCard 
                key={vendor.id} 
                vendor={vendor}
                onUpdatePrice={handleUpdatePrice}
              />
            ))}
            
            {product.vendors.length === 0 && (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                No vendors available for this product
              </div>
            )}
          </div>
        </div>
        
        {/* Google Shopping Results Section */}
        <div style={{
          marginTop: '48px',
          maxWidth: '1400px',
          margin: '48px auto 0'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '20px'
          }}>
            Google Shopping Results
          </h2>
          
          {loadingShoppingResults ? (
            <div style={{
              backgroundColor: 'white',
              padding: '60px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #e0e0e0',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <p style={{ color: '#6c757d', fontSize: '16px' }}>Loading shopping results...</p>
            </div>
          ) : (
            <>
              {/* Qatar Results Table */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🇶🇦 Qatar Results
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6c757d',
                    backgroundColor: '#f0f0f0',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>
                    Top 10
                  </span>
                </h3>
                
                {shoppingResults.qatar && shoppingResults.qatar.length > 0 ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                      }}>
                        <thead>
                          <tr style={{
                            backgroundColor: '#f8f9fa',
                            borderBottom: '2px solid #e0e0e0'
                          }}>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'left',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Source</th>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'left',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Price</th>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'left',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Stock</th>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shoppingResults.qatar.map((result, index) => (
                            <tr key={result.id || index} style={{
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <td style={{
                                padding: '16px 20px',
                                fontSize: '14px',
                                color: '#1a1a1a',
                                fontWeight: '500'
                              }}>
                                {result.source}
                              </td>
                              <td style={{
                                padding: '16px 20px',
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#2563eb'
                              }}>
                                {formatPrice(result.price)}
                              </td>
                              <td style={{
                                padding: '16px 20px',
                                fontSize: '14px'
                              }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  backgroundColor: result.stock === 'In stock' ? '#d1fae5' : '#fecaca',
                                  color: result.stock === 'In stock' ? '#065f46' : '#991b1b'
                                }}>
                                  {result.stock}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 20px',
                                textAlign: 'center'
                              }}>
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '8px 20px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'inline-block',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                                >
                                  View Deal
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#6c757d',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    No Qatar results available
                  </div>
                )}
              </div>

              {/* UK Results Table */}
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🇬🇧 UK Results
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6c757d',
                    backgroundColor: '#f0f0f0',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>
                    Top 10
                  </span>
                </h3>
                
                {shoppingResults.uk && shoppingResults.uk.length > 0 ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                      }}>
                        <thead>
                          <tr style={{
                            backgroundColor: '#f8f9fa',
                            borderBottom: '2px solid #e0e0e0'
                          }}>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'left',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Source</th>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'left',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Price</th>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'left',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Stock</th>
                            <th style={{
                              padding: '16px 20px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#495057',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shoppingResults.uk.map((result, index) => (
                            <tr key={result.id || index} style={{
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <td style={{
                                padding: '16px 20px',
                                fontSize: '14px',
                                color: '#1a1a1a',
                                fontWeight: '500'
                              }}>
                                {result.source}
                              </td>
                              <td style={{
                                padding: '16px 20px',
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#2563eb'
                              }}>
                                {formatPrice(result.price)}
                              </td>
                              <td style={{
                                padding: '16px 20px',
                                fontSize: '14px'
                              }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  backgroundColor: result.stock === 'In stock' ? '#d1fae5' : '#fecaca',
                                  color: result.stock === 'In stock' ? '#065f46' : '#991b1b'
                                }}>
                                  {result.stock}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 20px',
                                textAlign: 'center'
                              }}>
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '8px 20px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'inline-block',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                                >
                                  View Deal
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#6c757d',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    No UK results available
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Manual Update Modal */}
      {isModalOpen && selectedVendor && (
        <ManualUpdateModal
          vendor={selectedVendor}
          productId={product.id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePrice}
        />
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
