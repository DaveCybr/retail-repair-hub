import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { Product } from '@/types/database';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/format';

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product, quantity: number) => void;
  title?: string;
}

export function ProductSearchDialog({
  open,
  onOpenChange,
  onSelect,
  title = 'Pilih Produk'
}: ProductSearchDialogProps) {
  const { products, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = products.filter(p =>
    p.is_active &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = () => {
    if (!selectedProduct || quantity <= 0) return;
    onSelect(selectedProduct, quantity);
    setSelectedProduct(null);
    setQuantity(1);
    setSearchTerm('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setSearchTerm('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk atau serial number..."
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">Loading...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada produk ditemukan</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.serial_number || 'No S/N'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.sell_price)}</p>
                      <div className="flex items-center gap-1">
                        {product.stock <= (product.min_stock || 5) && (
                          <AlertTriangle className="w-3 h-3 text-warning" />
                        )}
                        <span className={`text-sm ${
                          product.stock <= 0 ? 'text-destructive' :
                          product.stock <= (product.min_stock || 5) ? 'text-warning' :
                          'text-muted-foreground'
                        }`}>
                          Stok: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedProduct && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-medium">{selectedProduct.name}</p>
                {selectedProduct.stock <= 0 && (
                  <Badge variant="destructive">Stok Habis</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jumlah</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <p className="text-sm text-muted-foreground">Subtotal:</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(selectedProduct.sell_price * quantity)}
                  </p>
                </div>
              </div>
              
              {quantity > selectedProduct.stock && (
                <p className="text-sm text-destructive">
                  Jumlah melebihi stok tersedia ({selectedProduct.stock})
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={!selectedProduct || quantity <= 0 || quantity > (selectedProduct?.stock || 0)}
          >
            Tambahkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
