import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { PaymentSummary, TransactionDraft } from '@/types/pos';
import { formatCurrency, formatDate } from '@/lib/format';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PaymentPanelProps {
  summary: PaymentSummary;
  draft: TransactionDraft;
  onPaymentMethodChange: (method: TransactionDraft['payment_method']) => void;
  onPaidAmountChange: (amount: number) => void;
  onTempoChange: (isTempo: boolean) => void;
  onTempoDueDateChange: (date: string) => void;
  customerCategory?: string;
}

export function PaymentPanel({
  summary,
  draft,
  onPaymentMethodChange,
  onPaidAmountChange,
  onTempoChange,
  onTempoDueDateChange,
  customerCategory
}: PaymentPanelProps) {
  const [tempoDueDate, setTempoDueDate] = useState<Date | undefined>(
    draft.tempo_due_date ? new Date(draft.tempo_due_date) : undefined
  );

  const canUseTempo = customerCategory === 'institution' || customerCategory === 'project';

  const handleTempoDateChange = (date: Date | undefined) => {
    setTempoDueDate(date);
    if (date) {
      onTempoDueDateChange(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleQuickPay = (amount: number) => {
    onPaidAmountChange(amount);
  };

  const getStatusBadgeVariant = () => {
    switch (summary.status) {
      case 'paid': return 'default';
      case 'partial': return 'secondary';
      case 'unpaid': return 'destructive';
    }
  };

  const getStatusLabel = () => {
    if (draft.is_tempo) return 'Tempo';
    switch (summary.status) {
      case 'paid': return 'Lunas';
      case 'partial': return 'Sebagian';
      case 'unpaid': return 'Belum Bayar';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="w-4 h-4" />
          Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Produk:</span>
            <span>{formatCurrency(summary.products_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Servis:</span>
            <span>{formatCurrency(summary.services_total)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(summary.grand_total)}</span>
          </div>
        </div>

        {/* Tempo Option (for institutions) */}
        {canUseTempo && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="tempo-switch" className="text-sm font-medium">
                  Pembayaran Tempo
                </Label>
              </div>
              <Switch
                id="tempo-switch"
                checked={draft.is_tempo}
                onCheckedChange={(checked) => {
                  onTempoChange(checked);
                  if (checked) {
                    onPaymentMethodChange('tempo');
                    onPaidAmountChange(0);
                  } else {
                    onPaymentMethodChange('cash');
                  }
                }}
              />
            </div>
            
            {draft.is_tempo && (
              <div>
                <Label className="text-xs">Jatuh Tempo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempoDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempoDueDate ? format(tempoDueDate, 'PPP', { locale: id }) : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempoDueDate}
                      onSelect={handleTempoDateChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        )}

        {/* Payment Method */}
        {!draft.is_tempo && (
          <>
            <div>
              <Label className="text-sm">Metode Pembayaran</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={draft.payment_method === 'cash' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-col h-auto py-3"
                  onClick={() => onPaymentMethodChange('cash')}
                >
                  <Banknote className="w-5 h-5 mb-1" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  variant={draft.payment_method === 'qris' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-col h-auto py-3"
                  onClick={() => onPaymentMethodChange('qris')}
                >
                  <QrCode className="w-5 h-5 mb-1" />
                  <span className="text-xs">QRIS</span>
                </Button>
                <Button
                  variant={draft.payment_method === 'transfer' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-col h-auto py-3"
                  onClick={() => onPaymentMethodChange('transfer')}
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span className="text-xs">Transfer</span>
                </Button>
              </div>
            </div>

            {/* Amount Paid */}
            <div>
              <Label className="text-sm">Jumlah Dibayar</Label>
              <Input
                type="number"
                value={draft.paid_amount || ''}
                onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
              />
            </div>

            {/* Quick Pay Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleQuickPay(summary.grand_total)}
              >
                Pas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleQuickPay(Math.ceil(summary.grand_total / 50000) * 50000)}
              >
                {formatCurrency(Math.ceil(summary.grand_total / 50000) * 50000)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleQuickPay(Math.ceil(summary.grand_total / 100000) * 100000)}
              >
                {formatCurrency(Math.ceil(summary.grand_total / 100000) * 100000)}
              </Button>
            </div>

            {/* Change / Remaining */}
            {summary.remaining !== 0 && (
              <div className={cn(
                "p-3 rounded-lg",
                summary.remaining > 0 
                  ? "bg-destructive/10 border border-destructive/20" 
                  : "bg-green-100 border border-green-200"
              )}>
                <p className="text-xs font-medium text-muted-foreground">
                  {summary.remaining > 0 ? 'Kurang:' : 'Kembalian:'}
                </p>
                <p className={cn(
                  "text-xl font-bold",
                  summary.remaining > 0 ? "text-destructive" : "text-green-700"
                )}>
                  {formatCurrency(Math.abs(summary.remaining))}
                </p>
              </div>
            )}
          </>
        )}

        {/* Status Badge */}
        <Badge 
          variant={draft.is_tempo ? 'secondary' : getStatusBadgeVariant()}
          className="w-full justify-center py-2"
        >
          {getStatusLabel()}
        </Badge>
      </CardContent>
    </Card>
  );
}
