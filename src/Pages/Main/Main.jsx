import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Analytics, Description, FlashOn, Water } from '@mui/icons-material';
import { MenuIcon, CreditCard, Building, TrendingUp } from 'lucide-react';
import api from '@/Utils/api';

export default function StatsDashboard() {
  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth()); // getMonth() возвращает 0–11

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const years = ['all', '2024', '2025', '2026'];
  const months = [
    { value: 'all', label: 'Все месяцы' },
    { value: '1', label: 'Январь' },
    { value: '2', label: 'Февраль' },
    { value: '3', label: 'Март' },
    { value: '4', label: 'Апрель' },
    { value: '5', label: 'Май' },
    { value: '6', label: 'Июнь' },
    { value: '7', label: 'Июль' },
    { value: '8', label: 'Август' },
    { value: '9', label: 'Сентябрь' },
    { value: '10', label: 'Октябрь' },
    { value: '11', label: 'Ноябрь' },
    { value: '12', label: 'Декабрь' }
  ];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      
      // Реальный API вызов - раскомментируйте для использования
      const response = await fetch(`${api}/con/stats?${params}`);
      
      const data = await response.json();
      console.log(data);
      
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        {/* Loading Content */}
        <div className="flex-1 p-6 space-y-6">
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Меню</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  if (!stats?.success) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Ошибка загрузки данных</p>
        </div>
      </div>
    );
  }

  const { data } = stats;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' сум';
  };


  const formatNumber = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const StatCard = ({ title, value, icon: Icon, pieData, colors, subtitle }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{value}</div>
        {subtitle && <div className="text-sm text-muted-foreground mb-4">{subtitle}</div>}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [formatNumber(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <div className="flex-1 p-2 space-y-2">
        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Выберите год" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year === 'all' ? 'Все годы' : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Выберите месяц" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Задолженность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{formatCurrency(data.totalDebt)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Платежи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(data.totalPaymentsThisPeriod)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building className="h-4 w-4" />
                Занятость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{data.occupancy.occupancyPercent}%</div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatNumber(data.occupancy.occupiedArea)} из {formatNumber(data.occupancy.totalBuildingArea)} м²
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Финансовый обзор</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Задолженность', value: data.totalDebt, color: '#ef4444' },
                        { name: 'Платежи', value: data.totalPayments, color: '#22c55e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Долг: {formatCurrency(data.totalDebt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Платежи: {formatCurrency(data.totalPayments)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Space Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Использование площадей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Занято', value: data.occupancy.occupiedArea, color: '#3b82f6' },
                        { name: 'Свободно', value: data.occupancy.totalBuildingArea - data.occupancy.occupiedArea, color: '#e5e7eb' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Занято: {formatNumber(data.occupancy.occupiedArea)} м²</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Свободно: {formatNumber(data.occupancy.totalBuildingArea - data.occupancy.occupiedArea)} м²</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {formatCurrency((data.totalDebt - data.totalPayments) / data.occupancy.occupiedArea)}
              </div>
              <div className="text-sm text-orange-700">Чистый долг за м²</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {Math.round((data.occupancy.totalBuildingArea - data.occupancy.occupiedArea) / 50)}
              </div>
              <div className="text-sm text-blue-700">Потенциальных арендаторов</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {formatCurrency(data.totalPayments / 6)}
              </div>
              <div className="text-sm text-green-700">Средний платеж в месяц</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {(((data.totalDebt - data.totalPayments) / data.totalDebt) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-purple-700">Процент невыплат</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>Меню</SheetTitle>
          </SheetHeader>
          <div className="space-y-1 px-2 mt-4">
            <button
              onClick={() => {
                navigate('/dashboard')
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Analytics className="w-5 h-5 mr-2" />
              Дашборд
            </button>
            <button
              onClick={() => {
                navigate('/cons')
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Description className="w-5 h-5 mr-2" />
              Договоры
            </button>
            <button
              onClick={() => {
                navigate('/archcons')
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Description className="w-5 h-5 mr-2" />
              Архивные договоры
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <FlashOn className="w-5 h-5 mr-2" />
              Электр
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Water className="w-5 h-5 mr-2" />
              Вода
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}