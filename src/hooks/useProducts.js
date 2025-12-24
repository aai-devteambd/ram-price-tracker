import { create } from 'zustand';
import { fetchAllProducts, fetchProductData, refreshProductData } from '../services/api';
import api from '../services/api';

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,
  
  // Fetch all products from n8n backend
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await fetchAllProducts();
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Failed to fetch products:', error);
    }
  },

  // Reload all data from backend and refresh products
  reloadData: async () => {
    set({ loading: true, error: null });
    try {
      // First trigger the backend reload
      await api.reloadAllData();
      
      // Wait a bit for the backend to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then fetch the updated products
      const products = await fetchAllProducts();
      set({ products, loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Failed to reload data:', error);
      return false;
    }
  },
  
  // Fetch a single product by model code
  fetchProductByModel: async (modelCode) => {
    set({ loading: true, error: null });
    try {
      const productData = await fetchProductData(modelCode);
      if (productData) {
        // Update or add product to the list
        const currentProducts = get().products;
        const existingIndex = currentProducts.findIndex(p => p.model_code === modelCode);
        
        let updatedProducts;
        if (existingIndex >= 0) {
          updatedProducts = [...currentProducts];
          updatedProducts[existingIndex] = { ...productData, id: currentProducts[existingIndex].id };
        } else {
          updatedProducts = [...currentProducts, { ...productData, id: currentProducts.length + 1 }];
        }
        
        set({ products: updatedProducts, loading: false });
        return productData;
      } else {
        set({ error: 'Product not found', loading: false });
        return null;
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Failed to fetch product:', error);
      return null;
    }
  },
  
  // Refresh product data from n8n
  refreshProduct: async (modelCode) => {
    console.log(`🔄 Refreshing product: ${modelCode}`);
    set({ loading: true, error: null });
    try {
      const productData = await refreshProductData(modelCode);
      console.log(`🔄 Received refreshed data:`, productData);
      
      if (productData) {
        const currentProducts = get().products;
        console.log(`🔄 Current products count: ${currentProducts.length}`);
        
        const updatedProducts = currentProducts.map(p => {
          if (p.model_code === modelCode) {
            console.log(`🔄 Updating product ${modelCode}`);
            return { ...productData, id: p.id };
          }
          return p;
        });
        
        console.log(`🔄 Updated products:`, updatedProducts);
        set({ products: updatedProducts, loading: false });
        return productData;
      }
      console.warn(`⚠️ No product data returned for ${modelCode}`);
      set({ loading: false });
      return null;
    } catch (error) {
      console.error(`❌ Failed to refresh product ${modelCode}:`, error);
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  updateVendorPrice: (productId, vendorId, price, availability, manualOverride) => {
    set((state) => ({
      products: state.products.map((product) => {
        if (product.id === productId) {
          const updatedVendors = product.vendors.map((vendor) => {
            if (vendor.id === vendorId) {
              return {
                ...vendor,
                price,
                availability,
                manual_override: manualOverride,
                last_checked_at: new Date().toISOString()
              };
            }
            return vendor;
          });
          
          // Recalculate best market price
          const availablePrices = updatedVendors
            .filter(v => v.price !== null && v.availability === 'IN_STOCK')
            .map(v => v.price);
          
          const bestMarketPrice = availablePrices.length > 0 
            ? Math.min(...availablePrices) 
            : product.best_market_price;
          
          return {
            ...product,
            vendors: updatedVendors,
            best_market_price: bestMarketPrice
          };
        }
        return product;
      })
    }));
  },
  
  getProductById: (id) => {
    return get().products.find(p => p.id === Number.parseInt(id, 10));
  },
  
  getProductByModel: (modelCode) => {
    return get().products.find(p => p.model_code === modelCode);
  }
}));

export default useProductStore;
