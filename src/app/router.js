import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import CategoryPage from '@/pages/CategoryPage';
import ProductListPage from '@/pages/ProductListPage';
import AboutPage from '@/pages/AboutPage';
import ContactsPage from '@/pages/ContactsPage';
import ProductPage from '@/pages/ProductPage';
import AdminLayout from '@/admin/AdminLayout';
import LoginPage from '@/admin/LoginPage';
import DashboardPage from '@/admin/DashboardPage';
import CategoriesPage from '@/admin/categories/CategoriesPage';
import ProductsPage from '@/admin/products/ProductsPage';
import ProductForm from '@/admin/products/ProductForm';
import ImportPage from '@/admin/products/ImportPage';
export const router = createBrowserRouter([
    {
        element: _jsx(App, {}),
        children: [
            { path: '/', element: _jsx(HomePage, {}) },
            { path: '/catalog', element: _jsx(CatalogPage, {}) },
            { path: '/catalog/:category', element: _jsx(CategoryPage, {}) },
            { path: '/catalog/:category/:sub', element: _jsx(ProductListPage, {}) },
            { path: '/about', element: _jsx(AboutPage, {}) },
            { path: '/contacts', element: _jsx(ContactsPage, {}) },
            { path: '/products/:slug', element: _jsx(ProductPage, {}) },
            { path: '/admin/login', element: _jsx(LoginPage, {}) },
            {
                path: '/admin',
                element: _jsx(AdminLayout, {}),
                children: [
                    { index: true, element: _jsx(DashboardPage, {}) },
                    { path: 'categories', element: _jsx(CategoriesPage, {}) },
                    { path: 'products', element: _jsx(ProductsPage, {}) },
                    { path: 'products/new', element: _jsx(ProductForm, {}) },
                    { path: 'products/:id', element: _jsx(ProductForm, {}) },
                    { path: 'import', element: _jsx(ImportPage, {}) }
                ]
            }
        ]
    }
]);
