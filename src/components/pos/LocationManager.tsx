import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Wrench, 
  Edit2,
  Package
} from 'lucide-react';
import { 
  LocationDetail, 
  CartItem, 
  ServiceItemInput,
  calculateLocationSubtotal,
  createEmptyLocation
} from '@/types/pos';
import { formatCurrency } from '@/lib/format';

interface LocationManagerProps {
  locations: LocationDetail[];
  onChange: (locations: LocationDetail[]) => void;
  isProject: boolean;
  onAddProduct: (locationId: string) => void;
  onAddService: (locationId: string) => void;
}

export function LocationManager({
  locations,
  onChange,
  isProject,
  onAddProduct,
  onAddService
}: LocationManagerProps) {
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState<string | null>(null);

  const addLocation = () => {
    if (!newLocationName.trim()) return;
    
    const newLocation = createEmptyLocation(newLocationName.trim());
    onChange([...locations, newLocation]);
    setNewLocationName('');
    setShowAddLocation(false);
  };

  const removeLocation = (locationId: string) => {
    if (locations.length <= 1) return;
    onChange(locations.filter(l => l.id !== locationId));
  };

  const updateLocationName = (locationId: string, name: string) => {
    onChange(locations.map(l => 
      l.id === locationId ? { ...l, name } : l
    ));
    setEditingLocation(null);
  };

  const removeItem = (locationId: string, itemId: string) => {
    onChange(locations.map(l => {
      if (l.id !== locationId) return l;
      return {
        ...l,
        items: l.items.filter(item => item.id !== itemId),
        subtotal: calculateLocationSubtotal({
          ...l,
          items: l.items.filter(item => item.id !== itemId)
        })
      };
    }));
  };

  const removeService = (locationId: string, serviceId: string) => {
    onChange(locations.map(l => {
      if (l.id !== locationId) return l;
      return {
        ...l,
        services: l.services.filter(s => s.id !== serviceId),
        subtotal: calculateLocationSubtotal({
          ...l,
          services: l.services.filter(s => s.id !== serviceId)
        })
      };
    }));
  };

  // For retail mode, just show one location without the location header
  if (!isProject && locations.length === 1) {
    const location = locations[0];
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Item Transaksi</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAddProduct(location.id)}>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Produk
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAddService(location.id)}>
                <Wrench className="w-4 h-4 mr-1" />
                Servis
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LocationItems 
            location={location} 
            onRemoveItem={(id) => removeItem(location.id, id)}
            onRemoveService={(id) => removeService(location.id, id)}
          />
        </CardContent>
      </Card>
    );
  }

  // Project mode with multiple locations
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4" />
            Lokasi / Ruangan
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAddLocation(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Lokasi
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={locations.map(l => l.id)} className="space-y-2">
          {locations.map((location, index) => (
            <AccordionItem 
              key={location.id} 
              value={location.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="outline" className="font-mono">
                    {index + 1}
                  </Badge>
                  {editingLocation === location.id ? (
                    <Input
                      value={location.name}
                      onChange={(e) => updateLocationName(location.id, e.target.value)}
                      onBlur={() => setEditingLocation(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingLocation(null)}
                      className="h-7 w-40"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="font-medium cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingLocation(location.id);
                      }}
                    >
                      {location.name}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    ({location.items.length} produk, {location.services.length} servis)
                  </span>
                </div>
                <div className="flex items-center gap-2 mr-2">
                  <span className="font-semibold">
                    {formatCurrency(calculateLocationSubtotal(location))}
                  </span>
                  {locations.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLocation(location.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onAddProduct(location.id)}>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Produk
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onAddService(location.id)}>
                      <Wrench className="w-4 h-4 mr-1" />
                      Servis
                    </Button>
                  </div>
                  
                  <LocationItems 
                    location={location}
                    onRemoveItem={(id) => removeItem(location.id, id)}
                    onRemoveService={(id) => removeService(location.id, id)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>

      {/* Add Location Dialog */}
      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Lokasi Baru</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nama Lokasi/Ruangan</Label>
            <Input
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="contoh: Ruang Lab Komputer"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLocation(false)}>
              Batal
            </Button>
            <Button onClick={addLocation} disabled={!newLocationName.trim()}>
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Sub-component for location items
function LocationItems({
  location,
  onRemoveItem,
  onRemoveService
}: {
  location: LocationDetail;
  onRemoveItem: (id: string) => void;
  onRemoveService: (id: string) => void;
}) {
  const hasItems = location.items.length > 0 || location.services.length > 0;

  if (!hasItems) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Belum ada item</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Products */}
      {location.items.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Produk
          </p>
          {location.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.sell_price)} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {formatCurrency(item.subtotal)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services */}
      {location.services.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Servis
          </p>
          {location.services.map((service) => {
            const partsTotal = service.parts.reduce((sum, p) => sum + p.subtotal, 0);
            const serviceTotal = service.labor_cost + partsTotal;
            
            return (
              <div
                key={service.id}
                className="p-3 border rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{service.device_name}</p>
                    {service.description && (
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => onRemoveService(service.id)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jasa:</span>
                    <span>{formatCurrency(service.labor_cost)}</span>
                  </div>
                  {service.parts.map((part, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>{part.product_name} × {part.quantity}</span>
                      <span>{formatCurrency(part.subtotal)}</span>
                    </div>
                  ))}
                  <Separator className="my-1" />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(serviceTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
