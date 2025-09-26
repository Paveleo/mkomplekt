import { createBrowserRouter } from 'react-router-dom'
import App from './App'

import HomePage from '@/pages/HomePage'
import CatalogPage from '@/pages/CatalogPage'
import CategoryPage from '@/pages/CategoryPage'
import ProductListPage from '@/pages/ProductListPage'
import AboutPage from '@/pages/AboutPage'
import ContactsPage from '@/pages/ContactsPage'
import ProductPage from '@/pages/ProductPage';

import AdminLayout from '@/admin/AdminLayout'
import LoginPage from '@/admin/LoginPage'
import DashboardPage from '@/admin/DashboardPage'
import CategoriesPage from '@/admin/categories/CategoriesPage'
import ProductsPage from '@/admin/products/ProductsPage'
import ProductForm from '@/admin/products/ProductForm'
import ImportPage from '@/admin/products/ImportPage'


export const router = createBrowserRouter([
  {
    element: <App/>,
    children: [
      { path: '/', element: <HomePage/> },
      { path: '/catalog', element: <CatalogPage/> },
      { path: '/catalog/:category', element: <CategoryPage/> },
      { path: '/catalog/:category/:sub', element: <ProductListPage/> },
      { path: '/about', element: <AboutPage/> },
      { path: '/contacts', element: <ContactsPage/> },
      { path: '/products/:slug', element: <ProductPage/> },

      { path: '/admin/login', element: <LoginPage/> },
      {
        path: '/admin',
        element: <AdminLayout/>,
        children: [
          { index: true, element: <DashboardPage/> },
          { path: 'categories', element: <CategoriesPage/> },
          { path: 'products', element: <ProductsPage/> },
          { path: 'products/new', element: <ProductForm/> },
          { path: 'products/:id', element: <ProductForm/> },
          { path: 'import', element: <ImportPage/> }
        ]
      }
    ]
  }
])
