import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedProducts from './components/FeaturedProducts'
import ProductManagement from './components/ProductManagement'
import UserManagement from './components/UserManagement'
import FeatureManagement from './components/FeatureManagement'
import Footer from './components/Footer'
import AddCategory from './components/AddCategory'
import FavoriteProducts from './components/FavoriteProducts'
import Login from './components/Login'
import Register from './components/Register'

// Define types
type Product = {
  id: number
  name: string
  price: number
  category_name: string
  subcategory_name: string
  sku: string
  description: string
  image: string
  disabled: boolean
}

type Category = {
  id: number
  name: string
}

type Subcategory = {
  id: number
  name: string
  category_id: number
}

type User = {
  id: number
  username: string
  email: string
  role: 'admin' | 'manager' | 'user'
}

type Feature = {
  id: number
  name: string
  description: string
  permissions: {
    admin: boolean
    manager: boolean
    user: boolean
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }

    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        
        // Fetch subcategories for each category
        const subcategoriesPromises = data.map((category: Category) =>
          fetch(`http://localhost:3001/api/categories/${category.id}/subcategories`).then(res => res.json())
        );
        const subcategoriesResults = await Promise.all(subcategoriesPromises);
        setSubcategories(subcategoriesResults.flat());
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleToggleFavorite = (productId: number) => {
    setFavorites(prevFavorites => 
      prevFavorites.includes(productId)
        ? prevFavorites.filter(id => id !== productId)
        : [...prevFavorites, productId]
    );
  };

  const handleAddProduct = async (product: Omit<Product, 'id' | 'disabled' | 'category_name' | 'subcategory_name'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
      } else {
        console.error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        const editedProduct = await response.json();
        setProducts(products.map(p => p.id === editedProduct.id ? editedProduct : p));
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleToggleProductStatus = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/toggle`, {
        method: 'PATCH',
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      } else {
        console.error('Failed to toggle product status');
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleAddCategory = async (categoryName: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
      } else {
        console.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleAddSubcategory = async (categoryId: number, subcategoryName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/categories/${categoryId}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: subcategoryName }),
      });

      if (response.ok) {
        const newSubcategory = await response.json();
        setSubcategories([...subcategories, newSubcategory]);
      } else {
        console.error('Failed to add subcategory');
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
    }
  };

  // Dummy functions for user and feature management (to be implemented later)
  const handleAddUser = (user: Omit<User, 'id'>) => {
    const newUser = {
      ...user,
      id: users.length + 1
    };
    setUsers([...users, newUser]);
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleUpdateFeature = (updatedFeature: Feature) => {
    setFeatures(features.map(f => f.id === updatedFeature.id ? updatedFeature : f));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <FeaturedProducts
                  products={products.filter(p => !p.disabled)}
                  categories={categories}
                  subcategories={subcategories}
                  favorites={favorites}
                  toggleFavorite={handleToggleFavorite}
                />
              </>
            } />
            <Route path="/product-management" element={
              isAuthenticated ? (
                <ProductManagement
                  products={products}
                  categories={categories}
                  subcategories={subcategories}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onToggleProductStatus={handleToggleProductStatus}
                  onAddSubcategory={handleAddSubcategory}
                />
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/add-category" element={
              isAuthenticated ? (
                <AddCategory
                  categories={categories}
                  onAddCategory={handleAddCategory}
                />
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/favorites" element={
              isAuthenticated ? (
                <FavoriteProducts
                  products={products.filter(p => !p.disabled)}
                  favorites={favorites}
                  toggleFavorite={handleToggleFavorite}
                />
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/user-management" element={
              isAuthenticated ? (
                <UserManagement
                  users={users}
                  onAddUser={handleAddUser}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                />
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/feature-management" element={
              isAuthenticated ? (
                <FeatureManagement
                  features={features}
                  onUpdateFeature={handleUpdateFeature}
                />
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App