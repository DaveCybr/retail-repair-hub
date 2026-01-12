import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Wrench,
  User,
  DollarSign,
  Search,
  Printer,
  Save,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Mock data - replace with actual API calls
const mockProducts = [
  {
    id: 1,
    name: "Laptop Charger 65W",
    sell_price: 150000,
    stock: 25,
    category: "Accessories",
  },
  {
    id: 2,
    name: "RAM DDR4 8GB",
    sell_price: 450000,
    stock: 15,
    category: "Spare Parts",
  },
  {
    id: 3,
    name: "SSD 256GB",
    sell_price: 550000,
    stock: 10,
    category: "Spare Parts",
  },
  {
    id: 4,
    name: "Keyboard Wireless",
    sell_price: 200000,
    stock: 20,
    category: "Accessories",
  },
];

const mockCustomers = [
  { id: "1", name: "John Doe", phone: "081234567890" },
  { id: "2", name: "Jane Smith", phone: "081234567891" },
];

const mockTechnicians = [
  { id: 1, name: "Tech A" },
  { id: 2, name: "Tech B" },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function NewTransactionForm() {
  // Customer & Basic Info
  const [customer, setCustomer] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [notes, setNotes] = useState("");

  // Sale Items
  const [saleItems, setSaleItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Service Items
  const [serviceItems, setServiceItems] = useState([]);
  const [currentService, setCurrentService] = useState({
    device: "",
    technician: null,
    description: "",
    diagnosis: "",
    labor_cost: 0,
    parts: [],
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);

  // UI States
  const [activeTab, setActiveTab] = useState("sales");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate totals
  const saleTotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const serviceTotal = serviceItems.reduce((sum, service) => {
    const partsTotal = service.parts.reduce(
      (pSum, part) => pSum + part.subtotal,
      0
    );
    return sum + service.labor_cost + partsTotal;
  }, 0);
  const grandTotal = saleTotal + serviceTotal;
  const remaining = grandTotal - paidAmount;
  const paymentStatus =
    paidAmount === 0 ? "unpaid" : paidAmount >= grandTotal ? "paid" : "partial";

  // Add product to cart
  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) return;

    const existing = saleItems.find(
      (item) => item.product_id === selectedProduct.id
    );
    if (existing) {
      setSaleItems(
        saleItems.map((item) =>
          item.product_id === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.sell_price,
              }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          sell_price: selectedProduct.sell_price,
          quantity,
          subtotal: selectedProduct.sell_price * quantity,
        },
      ]);
    }

    setSelectedProduct(null);
    setQuantity(1);
    setShowProductSearch(false);
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setSaleItems(saleItems.filter((item) => item.product_id !== productId));
  };

  // Add service item
  const addServiceItem = () => {
    if (!currentService.device || !currentService.technician) {
      alert("Please fill device name and select technician");
      return;
    }

    setServiceItems([...serviceItems, { ...currentService, id: Date.now() }]);
    setCurrentService({
      device: "",
      technician: null,
      description: "",
      diagnosis: "",
      labor_cost: 0,
      parts: [],
    });
  };

  // Add part to current service
  const addPartToService = () => {
    if (!selectedProduct) return;

    const newPart = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity,
      price: selectedProduct.sell_price,
      subtotal: selectedProduct.sell_price * quantity,
    };

    setCurrentService({
      ...currentService,
      parts: [...currentService.parts, newPart],
    });

    setSelectedProduct(null);
    setQuantity(1);
    setShowProductSearch(false);
  };

  // Save transaction
  const saveTransaction = async () => {
    const transaction = {
      customer_id: isWalkIn ? null : customer?.id,
      date: new Date().toISOString().split("T")[0],
      total_amount: grandTotal,
      paid_amount: paidAmount,
      payment_status: paymentStatus,
      notes,
      sale_items: saleItems,
      service_items: serviceItems,
    };

    console.log("Saving transaction:", transaction);
    // TODO: API call to save transaction
    alert("Transaction saved! (This will be integrated with backend)");
  };

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Transaction</h1>
          <p className="text-muted-foreground">
            Create a new sale or service order
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInvoicePreview(true)}>
            <Printer className="w-4 h-4 mr-2" />
            Preview Invoice
          </Button>
          <Button onClick={saveTransaction}>
            <Save className="w-4 h-4 mr-2" />
            Save Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant={isWalkIn ? "default" : "outline"}
                  onClick={() => setIsWalkIn(true)}
                >
                  Walk-in Customer
                </Button>
                <Button
                  variant={!isWalkIn ? "default" : "outline"}
                  onClick={() => setIsWalkIn(false)}
                >
                  Select Customer
                </Button>
              </div>

              {!isWalkIn && (
                <div>
                  <Label>Customer</Label>
                  <Select
                    onValueChange={(id) =>
                      setCustomer(mockCustomers.find((c) => c.id === id))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Items */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sales">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Products ({saleItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="services">
                    <Wrench className="w-4 h-4 mr-2" />
                    Services ({serviceItems.length})
                  </TabsTrigger>
                </TabsList>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-4">
                  <Button
                    onClick={() => setShowProductSearch(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>

                  {saleItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No products added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {saleItems.map((item) => (
                        <div
                          key={item.product_id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.sell_price)} ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-semibold">
                              {formatCurrency(item.subtotal)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-4">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold">Add Service</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Device Name *</Label>
                        <Input
                          value={currentService.device}
                          onChange={(e) =>
                            setCurrentService({
                              ...currentService,
                              device: e.target.value,
                            })
                          }
                          placeholder="e.g., iPhone 12 Pro"
                        />
                      </div>
                      <div>
                        <Label>Technician *</Label>
                        <Select
                          onValueChange={(id) =>
                            setCurrentService({
                              ...currentService,
                              technician: parseInt(id),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select technician" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockTechnicians.map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Problem Description</Label>
                      <Textarea
                        value={currentService.description}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            description: e.target.value,
                          })
                        }
                        placeholder="Customer complaint..."
                      />
                    </div>

                    <div>
                      <Label>Diagnosis</Label>
                      <Textarea
                        value={currentService.diagnosis}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            diagnosis: e.target.value,
                          })
                        }
                        placeholder="Technical diagnosis..."
                      />
                    </div>

                    <div>
                      <Label>Labor Cost</Label>
                      <Input
                        type="number"
                        value={currentService.labor_cost}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            labor_cost: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Spare Parts Used</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowProductSearch(true)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Part
                        </Button>
                      </div>
                      {currentService.parts.length > 0 && (
                        <div className="space-y-2">
                          {currentService.parts.map((part, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 border rounded text-sm"
                            >
                              <span>
                                {part.product_name} × {part.quantity}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(part.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button onClick={addServiceItem} className="w-full">
                      Add Service Item
                    </Button>
                  </div>

                  {serviceItems.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Service Items</h3>
                      {serviceItems.map((service) => (
                        <div key={service.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{service.device}</p>
                              <p className="text-sm text-muted-foreground">
                                Technician:{" "}
                                {
                                  mockTechnicians.find(
                                    (t) => t.id === service.technician
                                  )?.name
                                }
                              </p>
                            </div>
                            <Badge>Pending</Badge>
                          </div>
                          {service.description && (
                            <p className="text-sm mb-2">
                              {service.description}
                            </p>
                          )}
                          <Separator className="my-2" />
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Labor:</span>
                              <span className="font-medium">
                                {formatCurrency(service.labor_cost)}
                              </span>
                            </div>
                            {service.parts.map((part, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-muted-foreground"
                              >
                                <span>
                                  {part.product_name} × {part.quantity}:
                                </span>
                                <span>{formatCurrency(part.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for this transaction..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Products Total:</span>
                  <span className="font-medium">
                    {formatCurrency(saleTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Services Total:</span>
                  <span className="font-medium">
                    {formatCurrency(serviceTotal)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit">Credit/Tempo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount Paid</Label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>

              {remaining > 0 && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm font-medium">Remaining:</p>
                  <p className="text-xl font-bold text-warning-foreground">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              )}

              <Badge
                variant={paymentStatus === "paid" ? "default" : "secondary"}
                className="w-full justify-center py-2"
              >
                {paymentStatus === "unpaid" && "Unpaid"}
                {paymentStatus === "partial" && "Partial Payment"}
                {paymentStatus === "paid" && "Fully Paid"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Search Dialog */}
      <Dialog open={showProductSearch} onOpenChange={setShowProductSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(product.sell_price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedProduct && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <p className="font-medium">Selected: {selectedProduct.name}</p>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-bold">
                    {formatCurrency(selectedProduct.sell_price * quantity)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProductSearch(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={activeTab === "sales" ? addToCart : addPartToService}
            >
              Add to {activeTab === "sales" ? "Cart" : "Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
