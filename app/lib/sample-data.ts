export interface SampleDatasetPreset {
  id: string;
  name: string;
  filename: string;
  description: string;
  data: any[];
}

export const SAMPLE_USERS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    age: 29,
    active: true,
    country: "India",
    address: {
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      geo: { lat: 23.0225, lng: 72.5714 }
    },
    role: "Admin",
    joined_date: "2023-01-15T09:30:00Z"
  },
  {
    id: 2,
    name: "Aarav Patel",
    email: "aarav@example.com",
    age: 34,
    active: true,
    country: "India",
    address: {
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      geo: { lat: 19.076, lng: 72.8777 }
    },
    role: "Member",
    joined_date: "2023-03-22T14:15:00Z"
  },
  {
    id: 3,
    name: "Elena Rostova",
    email: "elena@example.org",
    age: 26,
    active: false,
    country: "Germany",
    address: {
      city: "Berlin",
      state: "Berlin",
      country: "Germany",
      geo: { lat: 52.52, lng: 13.405 }
    },
    role: "Member",
    joined_date: "2023-05-10T11:00:00Z"
  },
  {
    id: 4,
    name: "John Miller",
    email: null,
    age: 42,
    active: true,
    country: "USA",
    address: {
      city: "San Francisco",
      state: "California",
      country: "USA",
      geo: { lat: 37.7749, lng: -122.4194 }
    },
    role: "Manager",
    joined_date: "2022-11-04T08:20:00Z"
  },
  {
    id: 5,
    name: "Priya Nair",
    email: "priya@example.in",
    age: 31,
    active: true,
    country: "India",
    address: {
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      geo: { lat: 12.9716, lng: 77.5946 }
    },
    role: "Member",
    joined_date: "2023-07-19T16:45:00Z"
  },
  {
    id: 6,
    name: "Kenji Sato",
    email: "kenji@example.jp",
    age: 38,
    active: false,
    country: "Japan",
    address: {
      city: "Tokyo",
      state: "Kanto",
      country: "Japan",
      geo: { lat: 35.6762, lng: 139.6503 }
    },
    role: "Member",
    joined_date: "2022-08-30T10:05:00Z"
  },
  {
    id: 7,
    name: "Sarah Jenkins",
    email: "sarah.j@example.co.uk",
    age: 24,
    active: true,
    country: "UK",
    address: {
      city: "London",
      state: "Greater London",
      country: "UK",
      geo: { lat: 51.5074, lng: -0.1278 }
    },
    role: "Member",
    joined_date: "2024-02-01T13:25:00Z"
  },
  {
    id: 8,
    name: "Mateo Alvarez",
    email: "mateo@example.es",
    age: 45,
    active: true,
    country: "Spain",
    address: {
      city: "Madrid",
      state: "Madrid",
      country: "Spain",
      geo: { lat: 40.4168, lng: -3.7038 }
    },
    role: "Manager",
    joined_date: "2022-04-18T18:50:00Z"
  }
];

export const SAMPLE_ORDERS = [
  { order_id: 101, user_id: 1, total: 249.50, status: "Completed", items_count: 3, payment_method: "UPI", created_at: "2024-01-10" },
  { order_id: 102, user_id: 1, total: 89.00, status: "Completed", items_count: 1, payment_method: "Card", created_at: "2024-02-14" },
  { order_id: 103, user_id: 2, total: 540.20, status: "Shipped", items_count: 5, payment_method: "NetBanking", created_at: "2024-03-01" },
  { order_id: 104, user_id: 3, total: 45.00, status: "Cancelled", items_count: 1, payment_method: "Card", created_at: "2024-03-12" },
  { order_id: 105, user_id: 4, total: 1200.00, status: "Completed", items_count: 8, payment_method: "Wire", created_at: "2024-01-28" },
  { order_id: 106, user_id: 5, total: 310.75, status: "Processing", items_count: 2, payment_method: "UPI", created_at: "2024-03-15" },
  { order_id: 107, user_id: 7, total: 78.40, status: "Completed", items_count: 2, payment_method: "Card", created_at: "2024-02-20" },
  { order_id: 108, user_id: 8, total: 620.00, status: "Shipped", items_count: 4, payment_method: "PayPal", created_at: "2024-03-11" }
];

export const SAMPLE_PRODUCTS = [
  { product_id: "P-101", title: "Wireless Noise-Cancelling Headphones", category: "Electronics", price: 199.99, rating: 4.7, in_stock: true, stock: 45 },
  { product_id: "P-102", title: "Ergonomic Mechanical Keyboard", category: "Electronics", price: 129.50, rating: 4.9, in_stock: true, stock: 18 },
  { product_id: "P-103", title: "Organic Fair-Trade Coffee Beans 1kg", category: "Groceries", price: 28.00, rating: 4.8, in_stock: true, stock: 120 },
  { product_id: "P-104", title: "Stainless Steel Insulated Tumbler", category: "Home", price: 24.99, rating: 4.5, in_stock: true, stock: 85 },
  { product_id: "P-105", title: "4K Ultra-Wide Curved Monitor 34\"", category: "Electronics", price: 499.00, rating: 4.6, in_stock: false, stock: 0 },
  { product_id: "P-106", title: "Standing Desk Converter", category: "Furniture", price: 189.00, rating: 4.4, in_stock: true, stock: 14 }
];

export const PRESET_DATASETS: SampleDatasetPreset[] = [
  {
    id: "preset_users",
    name: "users.json",
    filename: "users.json",
    description: "Nested user records with geo coordinates, country, role, and joined timestamps.",
    data: SAMPLE_USERS
  },
  {
    id: "preset_orders",
    name: "orders.json",
    filename: "orders.json",
    description: "E-commerce order records with user_id foreign keys, amounts, and statuses.",
    data: SAMPLE_ORDERS
  },
  {
    id: "preset_products",
    name: "products.json",
    filename: "products.json",
    description: "Catalog of products with categories, pricing, stock count, and ratings.",
    data: SAMPLE_PRODUCTS
  }
];
