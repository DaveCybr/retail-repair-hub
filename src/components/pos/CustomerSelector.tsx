import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { User, Search, Plus, Building2, ShoppingBag, Briefcase } from 'lucide-react';
import { Customer, CustomerCategory, customerCategoryLabels } from '@/types/database';
import { TransactionType } from '@/types/pos';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerCategoryBadge } from '@/components/customers/CustomerCategoryBadge';

interface CustomerSelectorProps {
  customer: Customer | null;
  transactionType: TransactionType;
  onCustomerChange: (customer: Customer | null) => void;
  onTransactionTypeChange: (type: TransactionType) => void;
}

export function CustomerSelector({
  customer,
  transactionType,
  onCustomerChange,
  onTransactionTypeChange
}: CustomerSelectorProps) {
  const { customers, loading, createCustomer } = useCustomers();
  const [isWalkIn, setIsWalkIn] = useState(!customer);
  const [showSearch, setShowSearch] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    category: 'retail' as CustomerCategory,
    member_number: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCustomer = (c: Customer) => {
    onCustomerChange(c);
    setIsWalkIn(false);
    setShowSearch(false);
    
    // Auto-set transaction type based on customer category
    if (c.category === 'institution' || c.category === 'project') {
      onTransactionTypeChange('project');
    } else {
      onTransactionTypeChange('retail');
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return;
    
    const created = await createCustomer(newCustomer);
    if (created) {
      handleSelectCustomer(created);
      setShowNewCustomer(false);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        address: '',
        category: 'retail',
        member_number: '',
        notes: ''
      });
    }
  };

  const handleWalkIn = () => {
    setIsWalkIn(true);
    onCustomerChange(null);
    onTransactionTypeChange('retail');
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" />
            Pelanggan & Tipe Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Selection */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isWalkIn ? 'default' : 'outline'}
              size="sm"
              onClick={handleWalkIn}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Walk-in
            </Button>
            <Button
              variant={!isWalkIn && customer ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              {customer ? customer.name : 'Pilih Pelanggan'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewCustomer(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Baru
            </Button>
          </div>

          {/* Selected Customer Info */}
          {customer && (
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{customer.name}</span>
                <CustomerCategoryBadge category={customer.category} />
              </div>
              {customer.phone && (
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              )}
              {customer.member_number && (
                <p className="text-xs text-muted-foreground">
                  Member: {customer.member_number}
                </p>
              )}
            </div>
          )}

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="text-sm">Tipe Transaksi</Label>
            <div className="flex gap-2">
              <Button
                variant={transactionType === 'retail' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onTransactionTypeChange('retail')}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Retail
              </Button>
              <Button
                variant={transactionType === 'project' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onTransactionTypeChange('project')}
                disabled={isWalkIn}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Project/Instansi
              </Button>
            </div>
            {transactionType === 'project' && (
              <p className="text-xs text-muted-foreground">
                Nota dapat dibagi per ruangan/lokasi
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cari Pelanggan</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, telepon, atau email..."
                className="pl-10"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {loading ? (
                <p className="text-center py-4 text-muted-foreground">Loading...</p>
              ) : filteredCustomers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Tidak ada pelanggan ditemukan
                </p>
              ) : (
                filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.phone}</p>
                      </div>
                      <CustomerCategoryBadge category={c.category} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pelanggan Baru</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nama *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Nama pelanggan"
              />
            </div>
            
            <div>
              <Label>Telepon</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <Label>Kategori</Label>
              <Select
                value={newCustomer.category}
                onValueChange={(v) => setNewCustomer({ ...newCustomer, category: v as CustomerCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="institution">Instansi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Alamat</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="Alamat lengkap"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCustomer(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateCustomer} disabled={!newCustomer.name}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
