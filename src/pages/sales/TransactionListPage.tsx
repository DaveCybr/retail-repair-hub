import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  Calendar,
  DollarSign,
  User,
  ShoppingCart,
  Wrench,
  Receipt,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock data - replace with API calls
const mockTransactions = [
  {
    id: "TRX-001",
    date: "2026-01-12",
    customer: { id: "1", name: "John Doe", phone: "081234567890" },
    total_amount: 1500000,
    paid_amount: 1500000,
    payment_status: "paid",
    sale_items: [
      {
        product_name: "Laptop Charger 65W",
        quantity: 2,
        sell_price: 150000,
        subtotal: 300000,
      },
      {
        product_name: "RAM DDR4 8GB",
        quantity: 1,
        sell_price: 450000,
        subtotal: 450000,
      },
    ],
    service_items: [
      {
        device: "iPhone 12 Pro",
        technician: "Tech A",
        status: "completed",
        labor_cost: 500000,
        parts: [
          {
            product_name: "LCD Screen",
            quantity: 1,
            price: 250000,
            subtotal: 250000,
          },
        ],
      },
    ],
    notes: "Customer requested fast service",
    created_at: "2026-01-12T10:30:00",
  },
  {
    id: "TRX-002",
    date: "2026-01-12",
    customer: null,
    total_amount: 350000,
    paid_amount: 200000,
    payment_status: "partial",
    sale_items: [
      {
        product_name: "Keyboard Wireless",
        quantity: 1,
        sell_price: 200000,
        subtotal: 200000,
      },
    ],
    service_items: [
      {
        device: "Samsung Galaxy S21",
        technician: "Tech B",
        status: "in_progress",
        labor_cost: 150000,
        parts: [],
      },
    ],
    notes: "",
    created_at: "2026-01-12T14:15:00",
  },
  {
    id: "TRX-003",
    date: "2026-01-11",
    customer: { id: "2", name: "Jane Smith", phone: "081234567891" },
    total_amount: 550000,
    paid_amount: 0,
    payment_status: "unpaid",
    sale_items: [
      {
        product_name: "SSD 256GB",
        quantity: 1,
        sell_price: 550000,
        subtotal: 550000,
      },
    ],
    service_items: [],
    notes: "Payment scheduled for next week",
    created_at: "2026-01-11T16:45:00",
  },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(dateStr) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

const StatusBadge = ({ status }) => {
  const styles = {
    paid: "bg-green-100 text-green-800 border border-green-200",
    partial: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    unpaid: "bg-red-100 text-red-800 border border-red-200",
  };

  const labels = { paid: "Paid", partial: "Partial", unpaid: "Unpaid" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const ServiceStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border border-amber-200",
    in_progress: "bg-blue-100 text-blue-800 border border-blue-200",
    completed: "bg-green-100 text-green-800 border border-green-200",
    cancelled: "bg-red-100 text-red-800 border border-red-200",
  };

  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default function TransactionListPage() {
  const navigate = useNavigate();
  const [transactions] = useState(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] =
    useState(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("summary");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Statistics
  const todayTotal = filteredTransactions
    .filter((t) => t.date === new Date().toISOString().split("T")[0])
    .reduce((sum, t) => sum + t.total_amount, 0);

  const unpaidTotal = filteredTransactions
    .filter((t) => t.payment_status !== "paid")
    .reduce((sum, t) => sum + (t.total_amount - t.paid_amount), 0);

  const pendingServices = filteredTransactions.reduce((count, t) => {
    return (
      count +
      t.service_items.filter(
        (s) => s.status !== "completed" && s.status !== "cancelled"
      ).length
    );
  }, 0);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.customer?.phone.includes(searchTerm)
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === "today") {
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === today.getTime();
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((t) => new Date(t.date) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((t) => new Date(t.date) >= monthAgo);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.payment_status === statusFilter);
    }

    if (typeFilter === "sales") {
      filtered = filtered.filter(
        (t) => t.sale_items.length > 0 && t.service_items.length === 0
      );
    } else if (typeFilter === "services") {
      filtered = filtered.filter(
        (t) => t.service_items.length > 0 && t.sale_items.length === 0
      );
    } else if (typeFilter === "mixed") {
      filtered = filtered.filter(
        (t) => t.sale_items.length > 0 && t.service_items.length > 0
      );
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, dateFilter, statusFilter, typeFilter, transactions]);

  const viewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetail(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-600">
            Manage all sales and service transactions
          </p>
        </div>
        <Button
          onClick={() => {
            navigate("/sales/new");
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Today's Revenue
              </p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(todayTotal)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(unpaidTotal)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Services
              </p>
              <p className="text-2xl font-bold mt-2">{pendingServices}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, customer..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="sales">Sales Only</option>
            <option value="services">Services Only</option>
            <option value="mixed">Sales + Services</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-lg">
            Transactions ({filteredTransactions.length})
          </h2>
        </div>
        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {transaction.id}
                        </h3>
                        <StatusBadge status={transaction.payment_status} />
                        {transaction.sale_items.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            {transaction.sale_items.length} items
                          </span>
                        )}
                        {transaction.service_items.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            <Wrench className="w-3 h-3 mr-1" />
                            {transaction.service_items.length} services
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {transaction.customer?.name || "Walk-in Customer"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDateTime(transaction.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(transaction.total_amount)}
                      </p>
                      {transaction.payment_status !== "paid" && (
                        <p className="text-sm text-gray-600">
                          Paid: {formatCurrency(transaction.paid_amount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {transaction.service_items.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {transaction.service_items.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-gray-600">
                            {service.device}:
                          </span>
                          <ServiceStatusBadge status={service.status} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewDetail(transaction)}
                      className="inline-flex items-center px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Detail
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm">
                      <Printer className="w-4 h-4 mr-1" />
                      Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showDetail && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">
                    Transaction Detail - {selectedTransaction.id}
                  </h2>
                  <StatusBadge status={selectedTransaction.payment_status} />
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm">
                    <Printer className="w-4 h-4 inline mr-1" />
                    Print
                  </button>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Date Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Customer
                  </p>
                  <p className="font-medium">
                    {selectedTransaction.customer?.name || "Walk-in Customer"}
                  </p>
                  {selectedTransaction.customer?.phone && (
                    <p className="text-sm text-gray-600">
                      {selectedTransaction.customer.phone}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Date & Time
                  </p>
                  <p className="font-medium">
                    {formatDateTime(selectedTransaction.created_at)}
                  </p>
                </div>
              </div>

              <hr />

              {/* Tabs */}
              <div>
                <div className="flex gap-2 border-b mb-4">
                  <button
                    onClick={() => setActiveDetailTab("summary")}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      activeDetailTab === "summary"
                        ? "border-blue-600 text-blue-600 font-medium"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Summary
                  </button>
                  {selectedTransaction.sale_items.length > 0 && (
                    <button
                      onClick={() => setActiveDetailTab("sales")}
                      className={`px-4 py-2 border-b-2 transition-colors ${
                        activeDetailTab === "sales"
                          ? "border-blue-600 text-blue-600 font-medium"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Products ({selectedTransaction.sale_items.length})
                    </button>
                  )}
                  {selectedTransaction.service_items.length > 0 && (
                    <button
                      onClick={() => setActiveDetailTab("services")}
                      className={`px-4 py-2 border-b-2 transition-colors ${
                        activeDetailTab === "services"
                          ? "border-blue-600 text-blue-600 font-medium"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Services ({selectedTransaction.service_items.length})
                    </button>
                  )}
                </div>

                {/* Tab Contents */}
                {activeDetailTab === "summary" && (
                  <div className="space-y-4">
                    {selectedTransaction.sale_items.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Products</p>
                        {selectedTransaction.sale_items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm py-1"
                          >
                            <span>
                              {item.product_name} × {item.quantity}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedTransaction.service_items.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Services</p>
                        {selectedTransaction.service_items.map(
                          (service, idx) => (
                            <div key={idx} className="space-y-1 mb-3">
                              <div className="flex justify-between items-start text-sm">
                                <div>
                                  <p className="font-medium">
                                    {service.device}
                                  </p>
                                  <p className="text-gray-600">
                                    Tech: {service.technician}
                                  </p>
                                </div>
                                <ServiceStatusBadge status={service.status} />
                              </div>
                              <div className="ml-4 space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Labor:</span>
                                  <span>
                                    {formatCurrency(service.labor_cost)}
                                  </span>
                                </div>
                                {service.parts.map((part, pidx) => (
                                  <div
                                    key={pidx}
                                    className="flex justify-between text-sm text-gray-600"
                                  >
                                    <span>
                                      {part.product_name} × {part.quantity}:
                                    </span>
                                    <span>{formatCurrency(part.subtotal)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <hr />

                    <div className="space-y-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>
                          {formatCurrency(selectedTransaction.total_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid:</span>
                        <span>
                          {formatCurrency(selectedTransaction.paid_amount)}
                        </span>
                      </div>
                      {selectedTransaction.total_amount >
                        selectedTransaction.paid_amount && (
                        <div className="flex justify-between text-sm text-red-600 font-medium">
                          <span>Remaining:</span>
                          <span>
                            {formatCurrency(
                              selectedTransaction.total_amount -
                                selectedTransaction.paid_amount
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeDetailTab === "sales" && (
                  <div className="space-y-2">
                    {selectedTransaction.sale_items.map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.sell_price)} ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDetailTab === "services" && (
                  <div className="space-y-4">
                    {selectedTransaction.service_items.map((service, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">
                              {service.device}
                            </p>
                            <p className="text-sm text-gray-600">
                              Technician: {service.technician}
                            </p>
                          </div>
                          <ServiceStatusBadge status={service.status} />
                        </div>

                        <hr className="my-3" />

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Labor Cost:</span>
                            <span className="font-medium">
                              {formatCurrency(service.labor_cost)}
                            </span>
                          </div>

                          {service.parts.length > 0 && (
                            <>
                              <p className="text-sm font-medium mt-3 mb-2">
                                Spare Parts Used:
                              </p>
                              {service.parts.map((part, pidx) => (
                                <div
                                  key={pidx}
                                  className="flex justify-between text-sm ml-4"
                                >
                                  <span className="text-gray-600">
                                    {part.product_name} × {part.quantity}
                                  </span>
                                  <span>{formatCurrency(part.subtotal)}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedTransaction.notes && (
                <>
                  <hr />
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Notes
                    </p>
                    <p className="text-sm">{selectedTransaction.notes}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
