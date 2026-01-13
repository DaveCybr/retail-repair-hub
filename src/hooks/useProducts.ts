import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/database';
import { toast } from 'sonner';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data as ProductCategory[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          category_id: product.category_id,
          unit: product.unit,
          cost_price: product.cost_price,
          sell_price: product.sell_price,
          stock: product.stock,
          min_stock: product.min_stock,
          serial_number: product.serial_number,
          photo_url: product.photo_url,
          description: product.description,
          is_active: product.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Produk berhasil ditambahkan');
      await fetchProducts();
      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Gagal menambahkan produk');
      throw error;
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          category_id: updates.category_id,
          unit: updates.unit,
          cost_price: updates.cost_price,
          sell_price: updates.sell_price,
          stock: updates.stock,
          min_stock: updates.min_stock,
          serial_number: updates.serial_number,
          photo_url: updates.photo_url,
          description: updates.description,
          is_active: updates.is_active,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Produk berhasil diperbarui');
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Gagal memperbarui produk');
      throw error;
    }
  };

  const adjustStock = async (id: number, adjustment: number, reason: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');

      const newStock = product.stock + adjustment;
      if (newStock < 0) throw new Error('Stock cannot be negative');

      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Stok berhasil diperbarui: ${adjustment > 0 ? '+' : ''}${adjustment}`);
      await fetchProducts();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Gagal memperbarui stok');
      throw error;
    }
  };

  const getLowStockProducts = () => {
    return products.filter(p => p.stock <= p.min_stock);
  };

  const searchProducts = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,serial_number.ilike.%${query}%`)
        .order('name')
        .limit(20);

      if (error) throw error;
      return data as Product[];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return {
    products,
    categories,
    loading,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    adjustStock,
    getLowStockProducts,
    searchProducts,
  };
}
