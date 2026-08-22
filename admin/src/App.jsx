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

export default function App() {
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

  const fetchData = async () => {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#1F1915] text-[#F5EBE0] selection:bg-[#D4A359] selection:text-[#1F1915]">
      
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
              <Loader2 className="w-8 h-8 text-[#D4A359] animate-spin" />
            </div>
          ) : activeTab === 'products' ? (
            <ProductsTab
              products={products}
              categories={categories}
              onAddProductClick={handleAddProductClick}
              onEditProduct={handleOpenEditProduct}
              onRefresh={fetchData}
            />
          ) : (
            <CategoriesTab
              categories={categories}
              onAddCategory={handleOpenAddCategory}
              onEditCategory={handleOpenEditCategory}
              onRefresh={fetchData}
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
        onSaved={fetchData}
      />

      {/* Product Creation / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSaved={fetchData}
      />

    </div>
  );
}
