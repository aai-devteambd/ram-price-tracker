// API Service for n8n backend integration
// Direct connection to n8n (you need to enable CORS on your n8n server)
const API_BASE_URL = 'https://n8n.srv1013270.hstgr.cloud/webhook';

// Exchange rate USD to QAR
const USD_TO_QAR = 3.64;

/**
 * Parse availability status from different vendor responses
 */
const parseAvailability = (status, pricing) => {
  if (!status && !pricing) return 'UNKNOWN';
  
  const statusLower = (status || '').toLowerCase();
  if (statusLower.includes('out of stock') || statusLower === 'out of stock') {
    return 'OUT_OF_STOCK';
  }
  if (pricing && pricing !== '') {
    return 'IN_STOCK';
  }
  return 'UNKNOWN';
};

/**
 * Parse price from different formats
 */
const parsePrice = (pricing) => {
  if (!pricing || pricing === '') return null;
  
  // Remove currency symbols and text
  const numericString = String(pricing).replace(/[^0-9.]/g, '');
  const price = parseFloat(numericString);
  
  return isNaN(price) ? null : price;
};

/**
 * Convert USD to QAR
 */
const convertUsdToQar = (usdPrice) => {
  if (!usdPrice) return null;
  return Math.round(usdPrice * USD_TO_QAR * 100) / 100;
};

/**
 * Fetch data from a specific vendor endpoint
 */
const fetchVendorData = async (endpoint, modelName) => {
  console.log(`🔍 Fetching from ${endpoint} with model: "${modelName || 'all'}"`);
  console.log(`📤 Request URL: ${API_BASE_URL}/${endpoint}`);
  
  try {
    const formData = new FormData();
    // Use "all" when no model is specified, otherwise use the model name
    formData.append('model', modelName || 'all');
    console.log(`📤 Sending with FormData - model: "${modelName || 'all'}"`);
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    
    console.log(`📡 ${endpoint} response status: ${response.status} ${response.statusText}`);
    console.log(`📡 ${endpoint} response headers:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
    });
    
    if (!response.ok) {
      console.warn(`⚠️ ${endpoint}: HTTP ${response.status} - ${response.statusText}`);
      return [];
    }
    
    // Check if response has content
    const text = await response.text();
    
    console.log(`📄 ${endpoint} response length: ${text.length} chars`);
    if (text.length > 0 && text.length < 500) {
      console.log(`📄 ${endpoint} response preview:`, text);
    }
    
    // Handle empty response
    if (!text || text.trim() === '') {
      console.warn(`⚠️ ${endpoint}: Empty response received`);
      return [];
    }
    
    // Try to parse JSON
    try {
      const data = JSON.parse(text);
      console.log(`✅ ${endpoint} returned ${Array.isArray(data) ? data.length : 1} item(s)`);
      return Array.isArray(data) ? data : [];
    } catch (parseError) {
      console.error(`❌ ${endpoint}: Invalid JSON response:`, text.substring(0, 200));
      return [];
    }
  } catch (error) {
    console.error(`❌ ${endpoint}: Network error -`, error.message);
    return [];
  }
};

/**
 * Fetch data from all vendors for a specific model
 */
export const fetchProductData = async (modelName) => {
  try {
    // Fetch from all vendor endpoints in parallel
    const [amazonData, store974Data, geekayData, neweggData, allData] = await Promise.all([
      fetchVendorData('get-amazon-data', modelName),
      fetchVendorData('get-store974-data', modelName),
      fetchVendorData('get-geekay-data', modelName),
      fetchVendorData('get-newegg-data', modelName),
      fetchVendorData('get-all-data', modelName),
    ]);

    // Get product info from allData
    const productInfo = allData.find(item => 
      item.model === modelName
    );

    console.log(`📦 Product info for ${modelName}:`, productInfo);
    console.log(`🔍 Amazon data (${amazonData.length} items):`, amazonData);
    console.log(`🔍 Store974 data (${store974Data.length} items):`, store974Data);
    console.log(`🔍 Geekay data (${geekayData.length} items):`, geekayData);
    console.log(`🔍 Newegg data (${neweggData.length} items):`, neweggData);

    // Build vendors array
    const vendors = [];
    let vendorId = 1;

    // Amazon vendor (filter out empty data) - converts USD to QAR
    const validAmazon = amazonData.find(item => 
      item.model === modelName && item.pricing && item.pricing !== '' && item.pricing !== 0
    );
    
    console.log(`🛒 Valid Amazon for ${modelName}:`, validAmazon);
    
    if (validAmazon) {
      const priceUsd = parsePrice(validAmazon.pricing);
      const priceQar = convertUsdToQar(priceUsd);
      
      vendors.push({
        id: vendorId++,
        name: 'Amazon',
        price: priceQar,
        availability: priceUsd ? 'IN_STOCK' : 'OUT_OF_STOCK',
        last_checked_at: validAmazon.created_at || new Date().toISOString(),
        product_url: validAmazon.url || null,
        manual_override: false,
        rating: validAmazon.avg_rating || null,
        asin: validAmazon.asin || null,
        original_price_usd: priceUsd,
      });
    }

    // Store974 vendor (filter out empty data) - already in QAR
    const validStore974 = store974Data.find(item => 
      item.model === modelName && (item.pricing || item.status)
    );
    
    if (validStore974) {
      const priceQar = parsePrice(validStore974.pricing);
      
      vendors.push({
        id: vendorId++,
        name: 'Store974',
        price: priceQar,
        availability: parseAvailability(validStore974.status, validStore974.pricing),
        last_checked_at: validStore974.created_at || new Date().toISOString(),
        product_url: validStore974.url || null,
        manual_override: false,
      });
    }

    // Geekay vendor (filter out empty data) - already in QAR
    const validGeekay = geekayData.find(item => 
      item.model === modelName && (item.pricing || item.status)
    );
    
    if (validGeekay) {
      const priceQar = parsePrice(validGeekay.pricing);
      
      vendors.push({
        id: vendorId++,
        name: 'Geekay',
        price: priceQar,
        availability: parseAvailability(validGeekay.status, validGeekay.pricing),
        last_checked_at: validGeekay.created_at || new Date().toISOString(),
        product_url: validGeekay.url || null,
        manual_override: false,
      });
    }

    // Newegg vendor (filter out empty data) - already in QAR
    const validNewegg = neweggData.find(item => 
      item.model === modelName && (item.pricing || item.status)
    );
    
    if (validNewegg) {
      const priceQar = parsePrice(validNewegg.pricing);
      
      vendors.push({
        id: vendorId++,
        name: 'Newegg',
        price: priceQar,
        availability: parseAvailability(validNewegg.status, validNewegg.pricing),
        last_checked_at: validNewegg.created_at || new Date().toISOString(),
        product_url: validNewegg.url || null,
        manual_override: false,
      });
    }

    // Calculate best market price (lowest available price)
    const availablePrices = vendors
      .filter(v => v.price !== null && v.availability === 'IN_STOCK')
      .map(v => v.price);
    
    const bestMarketPrice = availablePrices.length > 0 
      ? Math.min(...availablePrices)
      : null;

    // Get product name from productInfo
    let productName = productInfo?.item_name || 'Unknown Product';

    // Get total paid price from productInfo (already in QAR)
    const totalPaidPrice = productInfo?.total_price || bestMarketPrice;

    const result = {
      model_code: modelName,
      name: productName,
      total_paid_price: totalPaidPrice,
      best_market_price: bestMarketPrice,
      vendors: vendors,
      capacity: productInfo?.capacity || null,
      speed: productInfo?.speed || null,
      timings: productInfo?.timings || null,
      voltage: productInfo?.voltage || null,
      color: productInfo?.color || null,
      last_updated: new Date().toISOString(),
    };
    
    console.log(`✅ Built product object for ${modelName}:`, result);
    return result;
  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
  }
};

/**
 * Fetch all products (without model filter)
 */
export const fetchAllProducts = async () => {
  try {
    // Fetch the complete list from all-data endpoint WITHOUT model parameter
    const allData = await fetchVendorData('get-all-data', null);
    
    if (!allData || allData.length === 0) {
      console.warn('No data returned from get-all-data endpoint');
      return [];
    }

    console.log(`📊 Received ${allData.length} rows from get-all-data`);

    // Get unique model codes from "model" field
    const modelCodes = [...new Set(
      allData
        .map(item => item.model)
        .filter(model => model && model.trim() !== '')
    )];

    console.log(`📝 Found ${modelCodes.length} unique models:`, modelCodes);

    // Fetch data for each model
    const productsPromises = modelCodes.map(async (modelCode, index) => {
      const productData = await fetchProductData(modelCode);
      if (productData) {
        return {
          id: index + 1,
          ...productData,
        };
      }
      return null;
    });

    const products = await Promise.all(productsPromises);
    const validProducts = products.filter(p => p !== null);
    
    console.log(`✅ Successfully fetched ${validProducts.length} products`);
    return validProducts;
  } catch (error) {
    console.error('❌ Error fetching all products:', error);
    return [];
  }
};

/**
 * Refresh product data (re-fetch from n8n)
 */
export const refreshProductData = async (modelCode) => {
  console.log(`Refreshing data for ${modelCode}...`);
  return await fetchProductData(modelCode);
};

/**
 * Fetch Google Shopping search results for a product
 */
export const fetchGoogleShoppingResults = async (modelCode) => {
  console.log(`🔍 Fetching Google Shopping results for ${modelCode}...`);
  
  try {
    // Fetch from both Qatar and UK endpoints in parallel
    const [qatarResults, ukResults] = await Promise.all([
      fetchVendorData('qatar/google-search', modelCode),
      fetchVendorData('uk/google-search', modelCode),
    ]);

    console.log(`🛒 Qatar results: ${qatarResults.length} items`);
    console.log(`🛒 UK results: ${ukResults.length} items`);

    // Process Qatar results
    const processedQatarResults = qatarResults.map(item => {
      let priceQar = item.price;
      
      // Convert USD to QAR
      if (item.currency === 'USD') {
        priceQar = convertUsdToQar(item.price);
      }
      // Convert THB to QAR (Thai Baht, approximate rate)
      else if (item.currency === 'THB') {
        priceQar = Math.round((item.price * 0.11) * 100) / 100;
      }
      // Keep as is if already in QAR
      
      return {
        id: item.id,
        source: item.source,
        price: priceQar,
        original_price: item.price,
        currency: item.currency,
        stock: item.stock,
        url: item.url,
        location: 'Qatar',
        created_at: item.created_at,
      };
    })
    .filter(item => item.price && item.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10); // Get top 10

    // Process UK results
    const processedUkResults = ukResults.map(item => {
      let priceQar = item.price;
      
      // Convert USD to QAR
      if (item.currency === 'USD') {
        priceQar = convertUsdToQar(item.price);
      }
      // Convert GBP to QAR (British Pound)
      else if (item.currency === 'GBP') {
        priceQar = Math.round((item.price * 4.72) * 100) / 100; // GBP to QAR
      }
      // Convert THB to QAR (Thai Baht)
      else if (item.currency === 'THB') {
        priceQar = Math.round((item.price * 0.11) * 100) / 100;
      }
      // Keep as is if already in QAR
      
      return {
        id: item.id,
        source: item.source,
        price: priceQar,
        original_price: item.price,
        currency: item.currency,
        stock: item.stock,
        url: item.url,
        location: 'UK',
        created_at: item.created_at,
      };
    })
    .filter(item => item.price && item.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10); // Get top 10

    console.log(`✅ Processed ${processedQatarResults.length} Qatar results, ${processedUkResults.length} UK results`);
    
    return {
      qatar: processedQatarResults,
      uk: processedUkResults
    };
  } catch (error) {
    console.error('❌ Error fetching Google Shopping results:', error);
    return {
      qatar: [],
      uk: []
    };
  }
};

/**
 * Trigger manual reload of all data from the backend
 */
const reloadAllData = async () => {
  console.log('🔄 Triggering manual data reload...');
  try {
    const response = await fetch('https://n8n.srv1013270.hstgr.cloud/webhook/ram-price-tracker/main/reload', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger reload: ${response.status} ${response.statusText}`);
    }
    
    console.log('✅ Data reload triggered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error triggering data reload:', error);
    throw error;
  }
};

const api = {
  fetchProductData,
  fetchAllProducts,
  refreshProductData,
  fetchGoogleShoppingResults,
  reloadAllData,
};

export default api;
