const products = [
  {
    id: 1,
    model_code: "CMP64GX5M2B6400C32W",
    name: "Corsair Vengeance RGB 64GB DDR5 6400MHz White",
    total_paid_price: 1999,
    best_market_price: 1197,
    vendors: [
      {
        id: 1,
        name: "Amazon",
        price: 1197,
        availability: "IN_STOCK",
        last_checked_at: "2025-12-11T10:00:00Z",
        product_url: "https://amazon.com/product/xyz",
        manual_override: false
      },
      {
        id: 2,
        name: "Newegg",
        price: 1250,
        availability: "IN_STOCK",
        last_checked_at: "2025-12-11T10:00:00Z",
        product_url: "https://newegg.com/product/xyz",
        manual_override: false
      },
      {
        id: 3,
        name: "Microless",
        price: null,
        availability: "OUT_OF_STOCK",
        last_checked_at: "2025-12-11T09:40:00Z",
        product_url: null,
        manual_override: false
      }
    ]
  },
  {
    id: 2,
    model_code: "F5-6000J3636F16GX2-TZ5RK",
    name: "G.SKILL Trident Z5 RGB 32GB DDR5 6000MHz",
    total_paid_price: 899,
    best_market_price: 749,
    vendors: [
      {
        id: 4,
        name: "Amazon",
        price: 749,
        availability: "IN_STOCK",
        last_checked_at: "2025-12-11T09:30:00Z",
        product_url: "https://amazon.com/product/abc",
        manual_override: false
      },
      {
        id: 5,
        name: "Newegg",
        price: 799,
        availability: "IN_STOCK",
        last_checked_at: "2025-12-11T09:45:00Z",
        product_url: "https://newegg.com/product/abc",
        manual_override: false
      },
      {
        id: 6,
        name: "Best Buy",
        price: 850,
        availability: "IN_STOCK",
        last_checked_at: "2025-12-11T08:00:00Z",
        product_url: "https://bestbuy.com/product/abc",
        manual_override: false
      }
    ]
  },
  {
    id: 3,
    model_code: "KF560C40BBAK2-32",
    name: "Kingston FURY Beast 32GB DDR5 5600MHz Black",
    total_paid_price: 650,
    best_market_price: 699,
    vendors: [
      {
        id: 7,
        name: "Amazon",
        price: 699,
        availability: "IN_STOCK",
        last_checked_at: "2025-12-11T10:15:00Z",
        product_url: "https://amazon.com/product/def",
        manual_override: false
      },
      {
        id: 8,
        name: "Newegg",
        price: 720,
        availability: "IN_STOCK",
        last_checked_at: "2025-12-11T10:00:00Z",
        product_url: "https://newegg.com/product/def",
        manual_override: false
      },
      {
        id: 9,
        name: "Microless",
        price: null,
        availability: "UNKNOWN",
        last_checked_at: "2025-12-11T07:00:00Z",
        product_url: null,
        manual_override: false
      }
    ]
  }
];

export default products;
