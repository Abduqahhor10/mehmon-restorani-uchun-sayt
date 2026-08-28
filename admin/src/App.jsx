import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminHeader from './components/AdminHeader';
import Sidebar from './components/Sidebar';
import ProductsTab from './components/ProductsTab';
import CategoriesTab from './components/CategoriesTab';
import GuardModal from './components/GuardModal';
import CategoryModal from './components/CategoryModal';
import ProductModal from './components/ProductModal';
import { getCategories, getProducts } from './services/api';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

function AdminContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories'
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isGuardOpen, setIsGuardOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.warn('API error (Admin):', err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with full loader
    fetchData(true);

    // Auto-sync every 3.5 seconds in background when tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(false);
      }
    }, 3500);

    // Refresh immediately when window / browser tab gains focus
    const handleFocus = () => fetchData(false);
    window.addEventListener('focus', handleFocus);

    // Cross-tab broadcast listener
    let bc;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('mehmon_sync_channel');
        bc.onmessage = () => fetchData(false);
      }
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === 'mehmon_menu_update') {
        fetchData(false);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  // Instant optimistic state update when Category is saved
  const handleCategorySaved = (savedCategory, isEdit) => {
    if (savedCategory) {
      setCategories((prev) => {
        if (isEdit) {
          return prev.map((c) => (c.id === savedCategory.id ? { ...c, ...savedCategory } : c));
        } else {
          return [...prev.filter((c) => c.id !== savedCategory.id), savedCategory];
        }
      });
    }
    // Silent background sync to ensure full backend alignment
    fetchData(false);
  };

  // Instant optimistic state update when Product is saved
  const handleProductSaved = (savedProduct, isEdit) => {
    if (savedProduct) {
      setProducts((prev) => {
        if (isEdit) {
          return prev.map((p) => (p.id === savedProduct.id ? { ...p, ...savedProduct } : p));
        } else {
          return [savedProduct, ...prev.filter((p) => p.id !== savedProduct.id)];
        }
      });
    }
    // Silent background sync to ensure full backend alignment
    fetchData(false);
  };

  // Guard Clause on "Add Product"
  const handleAddProductClick = () => {
    if (!categories || categories.length === 0) {
      setIsGuardOpen(true);
      return;
    }
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  // Redirect from Guard Modal to Category Modal
  const handleGoToCreateCategory = () => {
    setActiveTab('categories');
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  // Category Actions
  const handleOpenAddCategory = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  // Product Actions
  const handleOpenEditProduct = (prod) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mehmon-bg text-mehmon-text transition-colors duration-300">
      
      {/* Admin Header */}
      <AdminHeader />

      {/* Main Layout with 20% Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          productsCount={products.length}
          categoriesCount={categories.length}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-mehmon-gold animate-spin" />
            </div>
          ) : activeTab === 'products' ? (
            <ProductsTab
              products={products}
              categories={categories}
              onAddProductClick={handleAddProductClick}
              onEditProduct={handleOpenEditProduct}
              onRefresh={() => fetchData(false)}
            />
          ) : (
            <CategoriesTab
              categories={categories}
              onAddCategory={handleOpenAddCategory}
              onEditCategory={handleOpenEditCategory}
              onRefresh={() => fetchData(false)}
            />
          )}

        </main>
      </div>

      {/* Guard Clause Modal */}
      <GuardModal
        isOpen={isGuardOpen}
        onClose={() => setIsGuardOpen(false)}
        onGoToCreateCategory={handleGoToCreateCategory}
      />

      {/* Category Creation / Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onSaved={handleCategorySaved}
      />

      {/* Product Creation / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSaved={handleProductSaved}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AdminContent />
    </ThemeProvider>
  );
}
