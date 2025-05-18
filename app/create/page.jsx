'use client';
import { useState } from 'react';
import { useCreateProductMutation } from '../redux/services/productsApi';
import { useRouter } from 'next/navigation';

export default function CreateProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading, isError, error }] = useCreateProductMutation();
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    general: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, image: 'Please upload an image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setValidationErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setValidationErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
      isValid = false;
    }

    if (!formData.price) {
      errors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.price = 'Please enter a valid price';
      isValid = false;
    }

    if (!formData.category) {
      errors.category = 'Category is required';
      isValid = false;
    }

    if (!imageFile) {
      errors.image = 'Product image is required';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await createProduct(data).unwrap();
      router.push('/products');
    } catch (err) {
      console.error('Failed to create product:', err);
      
      // Reset all validation errors first
      setValidationErrors({
        name: '',
        price: '',
        category: '',
        image: '',
        general: ''
      });

      // Handle API validation errors
      if (err?.data?.errors) {
        const apiErrors = {};
        Object.keys(err.data.errors).forEach(key => {
          apiErrors[key] = err.data.errors[key].join(' ');
        });
        setValidationErrors(prev => ({ ...prev, ...apiErrors }));
      } else {
        // Handle other types of errors
        setValidationErrors(prev => ({
          ...prev,
          general: err?.data?.message || 'Failed to create product. Please try again.'
        }));
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Product</h1>
      
      {validationErrors.general && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
          <p>{validationErrors.general}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              validationErrors.name 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              validationErrors.price 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {validationErrors.price && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              validationErrors.category 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          >
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="books">Books</option>
          </select>
          {validationErrors.category && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              ${
                validationErrors.image
                  ? 'file:bg-red-50 file:text-red-700 hover:file:bg-red-100'
                  : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              }`}
          />
          {validationErrors.image && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
          )}
          {imageFile && (
            <div className="mt-2">
              <img 
                src={URL.createObjectURL(imageFile)} 
                alt="Preview" 
                className="h-32 object-contain border rounded-md"
              />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Product'}
          </button>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p>Error: {error?.data?.message || 'Failed to create product'}</p>
          </div>
        )}
      </form>
    </div>
  );
}