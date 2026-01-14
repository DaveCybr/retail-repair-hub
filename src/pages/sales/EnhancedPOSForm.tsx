import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { CustomerSelector } from '@/components/pos/CustomerSelector';
import { LocationManager } from '@/components/pos/LocationManager';
import { PaymentPanel } from '@/components/pos/PaymentPanel';
import { ProductSearchDialog } from '@/components/pos/ProductSearchDialog';
import { ServiceFormDialog } from '@/components/pos/ServiceFormDialog';

import { 
  TransactionDraft, 
  LocationDetail,
  CartItem,
  ServiceItemInput,
  createEmptyDraft,
  createEmptyLocation,
  calculatePaymentSummary,
  calculateLocationSubtotal
} from '@/types/pos';
import { Customer, Product } from '@/types/database';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';

export default function EnhancedPOSForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTransaction } = useTransactions();
  
  const [draft, setDraft] = useState<TransactionDraft>(createEmptyDraft());
  const [saving, setSaving] = useState(false);
  
  // Dialog states
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [activeLocationId, setActiveLocationId] = useState<string>(draft.locations[0]?.id || '');

  const summary = calculatePaymentSummary(draft);

  // Customer handlers
  const handleCustomerChange = (customer: Customer | null) => {
    setDraft({ ...draft, customer, customer_id: customer?.id });
  };

  const handleTransactionTypeChange = (type: 'retail' | 'project') => {
    const newDraft = { ...draft, transaction_type: type };
    
    // Reset to single location for retail
    if (type === 'retail' && draft.locations.length > 1) {
      const mergedItems = draft.locations.flatMap(l => l.items);
      const mergedServices = draft.locations.flatMap(l => l.services);
      newDraft.locations = [{
        ...createEmptyLocation('Default'),
        items: mergedItems,
        services: mergedServices
      }];
    }
    
    setDraft(newDraft);
  };

  // Location handlers
  const handleLocationsChange = (locations: LocationDetail[]) => {
    setDraft({ ...draft, locations });
  };

  const handleAddProduct = (locationId: string) => {
    setActiveLocationId(locationId);
    setShowProductSearch(true);
  };

  const handleAddService = (locationId: string) => {
    setActiveLocationId(locationId);
    setShowServiceForm(true);
  };

  const handleProductSelect = (product: Product, quantity: number) => {
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      product_name: product.name,
      sell_price: product.sell_price,
      cost_price: product.cost_price,
      quantity,
      subtotal: product.sell_price * quantity,
      location_id: activeLocationId
    };

    const updatedLocations = draft.locations.map(loc => {
      if (loc.id !== activeLocationId) return loc;
      
      // Check if product already exists
      const existingIdx = loc.items.findIndex(i => i.product_id === product.id);
      let newItems: CartItem[];
      
      if (existingIdx >= 0) {
        newItems = loc.items.map((item, idx) => 
          idx === existingIdx 
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.sell_price }
            : item
        );
      } else {
        newItems = [...loc.items, newItem];
      }
      
      return { ...loc, items: newItems, subtotal: calculateLocationSubtotal({ ...loc, items: newItems }) };
    });

    setDraft({ ...draft, locations: updatedLocations });
  };

  const handleServiceSave = (service: ServiceItemInput) => {
    const updatedLocations = draft.locations.map(loc => {
      if (loc.id !== activeLocationId) return loc;
      const newServices = [...loc.services, { ...service, location_id: activeLocationId }];
      return { ...loc, services: newServices, subtotal: calculateLocationSubtotal({ ...loc, services: newServices }) };
    });

    setDraft({ ...draft, locations: updatedLocations });
  };

  // Payment handlers
  const handlePaymentMethodChange = (method: TransactionDraft['payment_method']) => {
    setDraft({ ...draft, payment_method: method });
  };

  const handlePaidAmountChange = (amount: number) => {
    setDraft({ ...draft, paid_amount: amount });
  };

  const handleTempoChange = (isTempo: boolean) => {
    setDraft({ ...draft, is_tempo: isTempo });
  };

  const handleTempoDueDateChange = (date: string) => {
    setDraft({ ...draft, tempo_due_date: date });
  };

  // Save transaction
  const handleSave = async () => {
    if (summary.grand_total <= 0) {
      toast.error('Transaksi kosong');
      return;
    }

    // Validate payment for non-tempo
    if (!draft.is_tempo && summary.status !== 'paid') {
      const confirm = window.confirm('Pembayaran belum lunas. Lanjutkan sebagai pembayaran sebagian?');
      if (!confirm) return;
    }

    setSaving(true);
    try {
      // Collect all sale items
      const allSaleItems = draft.locations.flatMap(loc => 
        loc.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          sell_price: item.sell_price,
          cost_price: item.cost_price,
          subtotal: item.subtotal
        }))
      );

      // Build transaction details for project type
      const details = draft.transaction_type === 'project' 
        ? draft.locations.map(loc => ({
            location_name: loc.name,
            description: loc.description,
            subtotal: calculateLocationSubtotal(loc),
            items: loc.items,
            services: loc.services
          }))
        : undefined;

      await createTransaction({
        customer_id: draft.customer_id || undefined,
        total_amount: summary.grand_total,
        paid_amount: draft.paid_amount,
        notes: draft.notes,
        is_tempo: draft.is_tempo,
        tempo_due_date: draft.tempo_due_date,
        location: draft.project_name,
        sale_items: allSaleItems,
        details
      });

      toast.success('Transaksi berhasil disimpan!');
      navigate('/sales/transactions');
    } catch (error) {
      console.error('Failed to save transaction:', error);
      toast.error('Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaksi Baru</h1>
          <p className="text-muted-foreground text-sm">
            {draft.transaction_type === 'project' ? 'Mode Project/Instansi' : 'Mode Retail'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Printer className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving || summary.grand_total <= 0}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerSelector
            customer={draft.customer || null}
            transactionType={draft.transaction_type}
            onCustomerChange={handleCustomerChange}
            onTransactionTypeChange={handleTransactionTypeChange}
          />

          {/* Project Name (for project type) */}
          {draft.transaction_type === 'project' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detail Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Nama Project</Label>
                  <Input
                    value={draft.project_name || ''}
                    onChange={(e) => setDraft({ ...draft, project_name: e.target.value })}
                    placeholder="contoh: Pengadaan Komputer Lab SDN 01"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <LocationManager
            locations={draft.locations}
            onChange={handleLocationsChange}
            isProject={draft.transaction_type === 'project'}
            onAddProduct={handleAddProduct}
            onAddService={handleAddService}
          />

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Catatan tambahan untuk transaksi ini..."
                rows={2}
              />
            </CardContent>
          </Card>
        </div>

        {/* Payment Sidebar */}
        <div>
          <PaymentPanel
            summary={summary}
            draft={draft}
            onPaymentMethodChange={handlePaymentMethodChange}
            onPaidAmountChange={handlePaidAmountChange}
            onTempoChange={handleTempoChange}
            onTempoDueDateChange={handleTempoDueDateChange}
            customerCategory={draft.customer?.category}
          />
        </div>
      </div>

      {/* Dialogs */}
      <ProductSearchDialog
        open={showProductSearch}
        onOpenChange={setShowProductSearch}
        onSelect={handleProductSelect}
      />

      <ServiceFormDialog
        open={showServiceForm}
        onOpenChange={setShowServiceForm}
        onSave={handleServiceSave}
      />
    </div>
  );
}
