import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export function AlertsPanel({ month, year }) {
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [dueDateAlerts, setDueDateAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, [month, year]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [budgetRes, dueDateRes] = await Promise.all([
        fetch(`${API_URL}/api/alerts/budget?month=${month}&year=${year}`, { headers }),
        fetch(`${API_URL}/api/alerts/due-dates`, { headers }),
      ]);
      
      if (budgetRes.ok) setBudgetAlerts(await budgetRes.json());
      if (dueDateRes.ok) setDueDateAlerts(await dueDateRes.json());
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId) => {
    setDismissed([...dismissed, alertId]);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const allAlerts = [
    ...budgetAlerts.map(a => ({ ...a, id: `budget-${a.category_id}`, source: 'budget' })),
    ...dueDateAlerts.map(a => ({ ...a, id: `due-${a.expense_id}`, source: 'due' })),
  ].filter(a => !dismissed.includes(a.id));

  const dangerAlerts = allAlerts.filter(a => a.level === 'danger');
  const warningAlerts = allAlerts.filter(a => a.level === 'warning');
  const infoAlerts = allAlerts.filter(a => a.level === 'info');

  if (loading) {
    return null;
  }

  if (allAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Alertas ({allAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Danger Alerts */}
        {dangerAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {alert.message}
              </p>
              {alert.source === 'budget' && (
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Meta: {formatCurrency(alert.planned)} | Gasto: {formatCurrency(alert.spent)}
                </p>
              )}
              {alert.source === 'due' && alert.type === 'overdue' && (
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Valor: {formatCurrency(alert.value)} | Vencido há {alert.days} dia(s)
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Warning Alerts */}
        {warningAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
          >
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {alert.message}
              </p>
              {alert.source === 'budget' && (
                <div className="mt-2">
                  <div className="h-2 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                    {formatCurrency(alert.spent)} de {formatCurrency(alert.planned)}
                  </p>
                </div>
              )}
              {alert.source === 'due' && (
                <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                  Valor: {formatCurrency(alert.value)} | Vence em {alert.days} dia(s)
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Info Alerts */}
        {infoAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          >
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {alert.message}
              </p>
              {alert.value && (
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Valor: {formatCurrency(alert.value)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TrendsPanel({ month, year }) {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [month, year]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/analysis/trends?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        setTrends(await response.json());
      }
    } catch (error) {
      console.error('Erro ao carregar tendências:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  if (loading || !trends) {
    return null;
  }

  const { variations, category_trends } = trends;
  const topIncreases = category_trends
    .filter(c => c.variation > 10)
    .sort((a, b) => b.variation - a.variation)
    .slice(0, 3);
  
  const topDecreases = category_trends
    .filter(c => c.variation < -10)
    .sort((a, b) => a.variation - b.variation)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Análise de Tendências
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Variações Gerais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Receitas vs Média</p>
            <div className="flex items-center gap-2 mt-1">
              {variations.income_trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : variations.income_trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
              <span className={`text-sm font-medium ${
                variations.income_percentage > 0 ? 'text-green-500' : 
                variations.income_percentage < 0 ? 'text-red-500' : ''
              }`}>
                {variations.income_percentage > 0 ? '+' : ''}{variations.income_percentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Despesas vs Média</p>
            <div className="flex items-center gap-2 mt-1">
              {variations.expense_trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : variations.expense_trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
              <span className={`text-sm font-medium ${
                variations.expense_percentage > 0 ? 'text-red-500' : 
                variations.expense_percentage < 0 ? 'text-green-500' : ''
              }`}>
                {variations.expense_percentage > 0 ? '+' : ''}{variations.expense_percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Categorias com Maior Aumento */}
        {topIncreases.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-red-500" />
              Maior aumento de gastos
            </p>
            <div className="space-y-1">
              {topIncreases.map((cat) => (
                <div key={cat.category_id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{cat.category_name}</span>
                  <span className="text-red-500 font-medium">+{cat.variation.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorias com Maior Redução */}
        {topDecreases.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              Maior redução de gastos
            </p>
            <div className="space-y-1">
              {topDecreases.map((cat) => (
                <div key={cat.category_id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{cat.category_name}</span>
                  <span className="text-green-500 font-medium">{cat.variation.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topIncreases.length === 0 && topDecreases.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Seus gastos estão estáveis comparado aos meses anteriores
          </p>
        )}
      </CardContent>
    </Card>
  );
}
