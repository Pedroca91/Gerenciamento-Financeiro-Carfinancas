import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { MonthSelector } from '../components/layout/MonthSelector';
import { formatCurrency, getMonthName } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { toast } from '../components/ui/toast-provider';
import { Plus, Pencil, Trash2, TrendingUp, Wallet, PiggyBank } from 'lucide-react';

export function Investimentos() {
  const {
    investments,
    investmentCategories,
    selectedMonth,
    selectedYear,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  } = useFinance();

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    description: '',
    initial_balance: '',
    contribution: '',
    dividends: '',
    withdrawal: ''
  });

  const resetForm = () => {
    setFormData({
      category_id: '',
      description: '',
      initial_balance: '',
      contribution: '',
      dividends: '',
      withdrawal: ''
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      description: item.description || '',
      initial_balance: String(item.initial_balance || 0),
      contribution: String(item.contribution || 0),
      dividends: String(item.dividends || 0),
      withdrawal: String(item.withdrawal || 0)
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        initial_balance: parseFloat(formData.initial_balance || 0),
        contribution: parseFloat(formData.contribution || 0),
        dividends: parseFloat(formData.dividends || 0),
        withdrawal: parseFloat(formData.withdrawal || 0),
        month: selectedMonth,
        year: selectedYear
      };

      if (editingItem) {
        await updateInvestment(editingItem.id, data);
        toast.success('Investimento atualizado com sucesso!');
      } else {
        await createInvestment(data);
        toast.success('Investimento criado com sucesso!');
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar investimento');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteInvestment(id);
        toast.success('Registro excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir registro');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = investmentCategories.find(c => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const calculateFinalBalance = (inv) => {
    return (inv.initial_balance || 0) + (inv.contribution || 0) + (inv.dividends || 0) - (inv.withdrawal || 0);
  };

  const totalContributions = investments.reduce((sum, inv) => sum + (inv.contribution || 0), 0);
  const totalDividends = investments.reduce((sum, inv) => sum + (inv.dividends || 0), 0);
  const totalWithdrawals = investments.reduce((sum, inv) => sum + (inv.withdrawal || 0), 0);
  const totalBalance = investments.reduce((sum, inv) => sum + calculateFinalBalance(inv), 0);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="investimentos-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-foreground flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Investimentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle de investimentos de {getMonthName(selectedMonth)} de {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector />
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="rounded-sm" data-testid="add-investment-btn">
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Investimento</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  >
                    <SelectTrigger data-testid="investment-category-select">
                      <SelectValue placeholder="Selecione um investimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição opcional"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Saldo Inicial</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.initial_balance}
                      onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                      placeholder="0,00"
                      data-testid="investment-initial-balance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Aportes</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.contribution}
                      onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                      placeholder="0,00"
                      data-testid="investment-contribution"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dividendos</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.dividends}
                      onChange={(e) => setFormData({ ...formData, dividends: e.target.value })}
                      placeholder="0,00"
                      data-testid="investment-dividends"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retiradas</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.withdrawal}
                      onChange={(e) => setFormData({ ...formData, withdrawal: e.target.value })}
                      placeholder="0,00"
                      data-testid="investment-withdrawal"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" data-testid="investment-submit-btn">
                    {editingItem ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-primary">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aportes</CardTitle>
            <PiggyBank className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-emerald-500">
              {formatCurrency(totalContributions)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dividendos</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-blue-500">
              {formatCurrency(totalDividends)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retiradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-orange-500">
              {formatCurrency(totalWithdrawals)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investimento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead className="text-right">Aportes</TableHead>
                <TableHead className="text-right">Dividendos</TableHead>
                <TableHead className="text-right">Retiradas</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum investimento registrado para este período
                  </TableCell>
                </TableRow>
              ) : (
                investments.map((inv) => (
                  <TableRow key={inv.id} data-testid={`investment-row-${inv.id}`}>
                    <TableCell className="font-medium">{getCategoryName(inv.category_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.description || '-'}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(inv.initial_balance)}</TableCell>
                    <TableCell className="text-right font-mono text-emerald-500">{formatCurrency(inv.contribution)}</TableCell>
                    <TableCell className="text-right font-mono text-blue-500">{formatCurrency(inv.dividends)}</TableCell>
                    <TableCell className="text-right font-mono text-orange-500">{formatCurrency(inv.withdrawal)}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {formatCurrency(calculateFinalBalance(inv))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(inv)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inv.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
