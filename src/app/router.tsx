import { createBrowserRouter } from 'react-router-dom'
import App from './App'

import HomePage from '@/pages/HomePage'
import CatalogPage from '@/pages/CatalogPage'
import CategoryPage from '@/pages/CategoryPage'
import AboutPage from '@/pages/AboutPage'
import WorksPage from '@/pages/WorksPage'
import ContactsPage from '@/pages/ContactsPage'
import ProductPage from '@/pages/ProductPage'
import AuthPage from '@/pages/AuthPage'
import AccountPage from '@/pages/AccountPage'
import CartPage from '@/pages/CartPage'

import AdminLayout from '@/admin/AdminLayout'
import LoginPage from '@/admin/LoginPage'
import DashboardPage from '@/admin/DashboardPage'
import CategoriesPage from '@/admin/categories/CategoriesPage'
import ProductsPage from '@/admin/products/ProductsPage'
import ProductForm from '@/admin/products/ProductForm'
import ImportPage from '@/admin/products/ImportPage'
import OrdersPage from '@/admin/orders/OrdersPage'
import ContactRequestsPage from '@/admin/contact-requests/ContactRequestsPage'
import ReviewsPage from '@/admin/reviews/ReviewsPage'
import ReviewForm from '@/admin/reviews/ReviewForm'
import WorksAdminPage from '@/admin/works/WorksPage'

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/catalog/*', element: <CategoryPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/works', element: <WorksPage /> },
      { path: '/contacts', element: <ContactsPage /> },
      { path: '/products/:slug', element: <ProductPage /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/cart', element: <CartPage /> },
    ],
  },
  { path: '/admin/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'requests', element: <ContactRequestsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/new', element: <ProductForm /> },
      { path: 'products/:id', element: <ProductForm /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'reviews/new', element: <ReviewForm /> },
      { path: 'reviews/:id', element: <ReviewForm /> },
      { path: 'works', element: <WorksAdminPage /> },
      { path: 'import', element: <ImportPage /> },
    ],
  },
])
