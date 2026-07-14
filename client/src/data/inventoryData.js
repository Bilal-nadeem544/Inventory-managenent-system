export const initialProducts = [
  { id: 1, name: "Wireless Keyboard", sku: "SKU-2231", category: "Electronics", quantity: 2, reorderLevel: 10, unitPrice: 3200, supplier: "TechSource Ltd", updatedAt: "2026-07-06" },
  { id: 2, name: '27" Monitor', sku: "SKU-1187", category: "Electronics", quantity: 0, reorderLevel: 5, unitPrice: 28500, supplier: "DisplayPro", updatedAt: "2026-07-05" },
  { id: 3, name: "USB-C Hub", sku: "SKU-3305", category: "Electronics", quantity: 4, reorderLevel: 15, unitPrice: 1800, supplier: "TechSource Ltd", updatedAt: "2026-07-04" },
  { id: 4, name: "Office Chair", sku: "SKU-4410", category: "Furniture", quantity: 18, reorderLevel: 5, unitPrice: 15500, supplier: "HomeComfort", updatedAt: "2026-07-06" },
  { id: 5, name: "Standing Desk", sku: "SKU-4411", category: "Furniture", quantity: 6, reorderLevel: 4, unitPrice: 42000, supplier: "HomeComfort", updatedAt: "2026-07-03" },
  { id: 6, name: "Cotton T-Shirt", sku: "SKU-5522", category: "Clothing", quantity: 120, reorderLevel: 30, unitPrice: 950, supplier: "FabricWorld", updatedAt: "2026-07-02" },
  { id: 7, name: "Denim Jeans", sku: "SKU-5523", category: "Clothing", quantity: 45, reorderLevel: 20, unitPrice: 2800, supplier: "FabricWorld", updatedAt: "2026-07-01" },
  { id: 8, name: "Basmati Rice 5kg", sku: "SKU-6601", category: "Groceries", quantity: 3, reorderLevel: 10, unitPrice: 1450, supplier: "GreenMart", updatedAt: "2026-07-07" },
  { id: 9, name: "Cooking Oil 1L", sku: "SKU-6602", category: "Groceries", quantity: 80, reorderLevel: 25, unitPrice: 650, supplier: "GreenMart", updatedAt: "2026-07-06" },
  { id: 10, name: "Wireless Mouse", sku: "SKU-2232", category: "Electronics", quantity: 35, reorderLevel: 15, unitPrice: 1500, supplier: "TechSource Ltd", updatedAt: "2026-07-05" },
  { id: 11, name: "Bookshelf", sku: "SKU-4412", category: "Furniture", quantity: 9, reorderLevel: 3, unitPrice: 12800, supplier: "HomeComfort", updatedAt: "2026-06-30" },
  { id: 12, name: "Green Tea Box", sku: "SKU-6603", category: "Groceries", quantity: 1, reorderLevel: 10, unitPrice: 480, supplier: "GreenMart", updatedAt: "2026-07-07" },
  { id: 13, name: "Bluetooth Speaker", sku: "SKU-2233", category: "Electronics", quantity: 22, reorderLevel: 8, unitPrice: 5600, supplier: "TechSource Ltd", updatedAt: "2026-07-04" },
  { id: 14, name: "Winter Jacket", sku: "SKU-5524", category: "Clothing", quantity: 14, reorderLevel: 10, unitPrice: 6200, supplier: "FabricWorld", updatedAt: "2026-06-29" },
  { id: 15, name: "Study Table", sku: "SKU-4413", category: "Furniture", quantity: 0, reorderLevel: 5, unitPrice: 18500, supplier: "HomeComfort", updatedAt: "2026-06-28" },
];

export const categories = ["Electronics", "Furniture", "Clothing", "Groceries"];

export function getStockStatus(quantity, reorderLevel) {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
}