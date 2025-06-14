
export interface DemoProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  wholesaler: string;
  location: string;
  minOrder: number;
  inStock: boolean;
}

export const demoProducts: DemoProduct[] = [
  {
    id: "demo-prod-1",
    name: "Premium Basmati Rice",
    price: 2500,
    image: "/placeholder.svg",
    description: "High quality basmati rice sourced from Punjab. Perfect for restaurants and retailers.",
    category: "Food & Beverages",
    wholesaler: "Punjab Rice Mills",
    location: "Lahore, Punjab",
    minOrder: 50,
    inStock: true
  },
  {
    id: "demo-prod-2", 
    name: "Cotton Fabric Rolls",
    price: 450,
    image: "/placeholder.svg",
    description: "Premium cotton fabric rolls for textile manufacturing. Various colors available.",
    category: "Textiles",
    wholesaler: "Karachi Textiles Ltd",
    location: "Karachi, Sindh",
    minOrder: 100,
    inStock: true
  },
  {
    id: "demo-prod-3",
    name: "Surgical Instruments Set",
    price: 15000,
    image: "/placeholder.svg", 
    description: "Professional grade surgical instruments manufactured in Sialkot.",
    category: "Medical Equipment",
    wholesaler: "Sialkot Surgical Co",
    location: "Sialkot, Punjab",
    minOrder: 10,
    inStock: true
  },
  {
    id: "demo-prod-4",
    name: "Football Manufacturing Kit",
    price: 800,
    image: "/placeholder.svg",
    description: "Complete football manufacturing materials and components.",
    category: "Sports Goods", 
    wholesaler: "Sports City Sialkot",
    location: "Sialkot, Punjab",
    minOrder: 25,
    inStock: true
  },
  {
    id: "demo-prod-5",
    name: "Leather Goods Bundle",
    price: 3200,
    image: "/placeholder.svg",
    description: "Premium leather products including bags, wallets, and belts.",
    category: "Leather Goods",
    wholesaler: "Karachi Leather Works",
    location: "Karachi, Sindh", 
    minOrder: 20,
    inStock: true
  },
  {
    id: "demo-prod-6",
    name: "Electronic Components",
    price: 1200,
    image: "/placeholder.svg",
    description: "Various electronic components for manufacturing and repair.",
    category: "Electronics",
    wholesaler: "Tech Components Hub",
    location: "Islamabad, ICT",
    minOrder: 50,
    inStock: true
  },
  {
    id: "demo-prod-7",
    name: "Pharmaceutical Supplies",
    price: 5500,
    image: "/placeholder.svg",
    description: "Quality pharmaceutical raw materials and supplies.",
    category: "Pharmaceuticals", 
    wholesaler: "Medical Supply Co",
    location: "Lahore, Punjab",
    minOrder: 15,
    inStock: true
  },
  {
    id: "demo-prod-8",
    name: "Construction Materials",
    price: 850,
    image: "/placeholder.svg",
    description: "Building and construction materials in bulk quantities.",
    category: "Construction",
    wholesaler: "Build Pro Materials",
    location: "Rawalpindi, Punjab",
    minOrder: 100,
    inStock: true
  },
  {
    id: "demo-prod-9",
    name: "Automotive Parts",
    price: 2800,
    image: "/placeholder.svg",
    description: "Genuine automotive parts and accessories for various vehicle models.",
    category: "Automotive",
    wholesaler: "Auto Parts Pakistan",
    location: "Gujranwala, Punjab", 
    minOrder: 30,
    inStock: true
  },
  {
    id: "demo-prod-10",
    name: "Agricultural Tools",
    price: 1650,
    image: "/placeholder.svg",
    description: "Modern agricultural tools and equipment for farming.",
    category: "Agriculture",
    wholesaler: "Farm Tech Solutions",
    location: "Faisalabad, Punjab",
    minOrder: 40,
    inStock: true
  }
];

// Helper function to get a product by ID
export const getProductById = (id: string): DemoProduct | undefined => {
  return demoProducts.find(product => product.id === id);
};

// Helper function to get products by category  
export const getProductsByCategory = (category: string): DemoProduct[] => {
  return demoProducts.filter(product => product.category === category);
};

// Helper function to get all categories
export const getCategories = (): string[] => {
  return [...new Set(demoProducts.map(product => product.category))];
};
