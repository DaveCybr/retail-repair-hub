import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Wrench } from 'lucide-react';
import { ServiceItemInput, CartItem } from '@/types/pos';
import { Product, Employee } from '@/types/database';
import { useEmployees } from '@/hooks/useEmployees';
import { ProductSearchDialog } from './ProductSearchDialog';
import { formatCurrency } from '@/lib/format';

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: ServiceItemInput) => void;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  onSave
}: ServiceFormDialogProps) {
  const { employees, loading } = useEmployees();
  const technicians = employees.filter(e => e.status === 'active');
  
  const [showPartSearch, setShowPartSearch] = useState(false);
  const [service, setService] = useState<ServiceItemInput>({
    id: '',
    device_name: '',
    device_serial: '',
    description: '',
    diagnosis: '',
    labor_cost: 0,
    parts: [],
    sla_category: 'standard'
  });

  const partsTotal = service.parts.reduce((sum, p) => sum + p.subtotal, 0);
  const serviceTotal = service.labor_cost + partsTotal;

  const handleAddPart = (product: Product, quantity: number) => {
    const newPart: CartItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      product_name: product.name,
      sell_price: product.sell_price,
      cost_price: product.cost_price,
      quantity,
      subtotal: product.sell_price * quantity
    };
    
    setService({
      ...service,
      parts: [...service.parts, newPart]
    });
  };

  const removePart = (partId: string) => {
    setService({
      ...service,
      parts: service.parts.filter(p => p.id !== partId)
    });
  };

  const handleSave = () => {
    if (!service.device_name.trim()) return;
    
    onSave({
      ...service,
      id: crypto.randomUUID()
    });
    
    // Reset form
    setService({
      id: '',
      device_name: '',
      device_serial: '',
      description: '',
      diagnosis: '',
      labor_cost: 0,
      parts: [],
      sla_category: 'standard'
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    setService({
      id: '',
      device_name: '',
      device_serial: '',
      description: '',
      diagnosis: '',
      labor_cost: 0,
      parts: [],
      sla_category: 'standard'
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Tambah Item Servis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Device Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Unit/Device *</Label>
                <Input
                  value={service.device_name}
                  onChange={(e) => setService({ ...service, device_name: e.target.value })}
                  placeholder="contoh: Laptop ASUS ROG"
                />
              </div>
              <div>
                <Label>Serial Number</Label>
                <Input
                  value={service.device_serial}
                  onChange={(e) => setService({ ...service, device_serial: e.target.value })}
                  placeholder="S/N unit"
                />
              </div>
            </div>

            {/* Technician & SLA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Teknisi</Label>
                <Select
                  value={service.technician_id?.toString()}
                  onValueChange={(v) => {
                    const tech = technicians.find(t => t.id.toString() === v);
                    setService({
                      ...service,
                      technician_id: tech?.id,
                      technician_name: tech?.name
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih teknisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategori SLA</Label>
                <Select
                  value={service.sla_category}
                  onValueChange={(v) => setService({ ...service, sla_category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="express">Express (2 jam)</SelectItem>
                    <SelectItem value="standard">Standard (1 hari)</SelectItem>
                    <SelectItem value="complex">Complex (3 hari)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Keluhan / Deskripsi Masalah</Label>
              <Textarea
                value={service.description}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                placeholder="Deskripsi keluhan pelanggan..."
                rows={2}
              />
            </div>

            {/* Diagnosis */}
            <div>
              <Label>Diagnosis Teknisi</Label>
              <Textarea
                value={service.diagnosis}
                onChange={(e) => setService({ ...service, diagnosis: e.target.value })}
                placeholder="Hasil diagnosis teknis..."
                rows={2}
              />
            </div>

            {/* Labor Cost */}
            <div>
              <Label>Biaya Jasa</Label>
              <Input
                type="number"
                value={service.labor_cost || ''}
                onChange={(e) => setService({ ...service, labor_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Spare Parts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Sparepart Digunakan</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPartSearch(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>
              
              {service.parts.length > 0 ? (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  {service.parts.map((part) => (
                    <div key={part.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span>{part.product_name}</span>
                        <span className="text-muted-foreground ml-2">
                          × {part.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(part.subtotal)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => removePart(part.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">
                  Belum ada sparepart
                </p>
              )}
            </div>

            {/* Service Total */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Biaya Jasa:</span>
                <span>{formatCurrency(service.labor_cost)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Sparepart:</span>
                <span>{formatCurrency(partsTotal)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Servis:</span>
                <span>{formatCurrency(serviceTotal)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!service.device_name.trim()}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductSearchDialog
        open={showPartSearch}
        onOpenChange={setShowPartSearch}
        onSelect={handleAddPart}
        title="Pilih Sparepart"
      />
    </>
  );
}
