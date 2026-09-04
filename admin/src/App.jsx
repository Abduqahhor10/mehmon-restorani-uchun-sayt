import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminHeader from './components/AdminHeader';
import Sidebar from './components/Sidebar';
import ProductsTab from './components/ProductsTab';
import CategoriesTab from './components/CategoriesTab';
import GuardModal from './components/GuardModal';
import CategoryModal from './components/CategoryModal';
import ProductModal from './components/ProductModal';
import LoginScreen from './components/LoginScreen';
import { describeApiError, getCategories, getProducts } from './services/api';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const SYNC_INTERVAL_MS = 8000;

function AdminContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories'
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  // Modals state
  const [isGuardOpen, setIsGuardOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Background polling must not yank data out from under an open form.
  const isModalOpen = isCategoryModalOpen || isProductModalOpen;
  const isModalOpenRef = useRef(isModalOpen);
  isModalOpenRef.current = isModalOpen;

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(prods)) setProducts(prods);
      setSyncError(null);
    } catch (err) {
      // Keep the last known good data on screen and tell the user sync is broken,
      // instead of silently showing a stale or empty panel.
      setSyncError(describeApiError(err));
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);

    const backgroundSync = () => {
      if (document.visibilityState === 'visible' && !isModalOpenRef.current) {
        fetchData(false);
      }
    };

    const interval = setInterval(backgroundSync, SYNC_INTERVAL_MS);
    window.addEventListener('focus', backgroundSync);

    // Cross-tab broadcast listener
    let bc;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('mehmon_sync_channel');
        bc.onmessage = backgroundSync;
      }
    } catch {
      // BroadcastChannel unavailable: polling and the storage event still cover us.
    }

    const handleStorage = (e) => {
      if (e.key === 'mehmon_menu_update') backgroundSync();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', backgroundSync);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [fetchData]);

  // Instant optimistic state update when Category is saved
  const handleCategorySaved = (savedCategory, isEdit) => {
    if (savedCategory) {
      setCategories((prev) =>
        isEdit
          ? prev.map((c) => (c.id === savedCategory.id ? { ...c, ...savedCategory } : c))
          : [...prev.filter((c) => c.id !== savedCategory.id), savedCategory]
      );
    }
    fetchData(false);
  };

  // Instant optimistic state update when Product is saved
  const handleProductSaved = (savedProduct, isEdit) => {
    if (savedProduct) {
      setProducts((prev) =>
        isEdit
          ? prev.map((p) => (p.id === savedProduct.id ? { ...p, ...savedProduct } : p))
          : [savedProduct, ...prev.filter((p) => p.id !== savedProduct.id)]
      );
    }
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
    setIsGuardOpen(false);
    setActiveTab('categories');
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenAddCategory = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mehmon-bg text-mehmon-text transition-colors duration-300">

      <AdminHeader />

      {syncError && (
        <div
          role="status"
          className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 bg-red-950/20 border-b border-red-500/40 text-xs text-red-500"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{t('admin.sync_error', { message: syncError })}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          productsCount={products.length}
          categoriesCount={categories.length}
        />

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

      <GuardModal
        isOpen={isGuardOpen}
        onClose={() => setIsGuardOpen(false)}
        onGoToCreateCategory={handleGoToCreateCategory}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onSaved={handleCategorySaved}
      />

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

function AuthGate() {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mehmon-bg">
        <Loader2 className="w-8 h-8 text-mehmon-gold animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <AdminContent /> : <LoginScreen />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
