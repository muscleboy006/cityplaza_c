import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // ✅
import api from "@/Utils/api"; // твой базовый url

// --- Кастомные UI-компоненты ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg hover:border-blue-500 transition-colors ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 pb-2 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-slate-100 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 pt-2 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, size = "default", className = "" }) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2"
  };

  return (
    <button
      onClick={onClick}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-slate-700 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }}
    ></div>
  </div>
);

const Separator = ({ className = "" }) => (
  <hr className={`border-slate-700 ${className}`} />
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantClasses = {
    default: "bg-slate-700 text-slate-200",
    destructive: "bg-red-600 text-white"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const formatSum = (v) =>
  typeof v === "number" ? v.toLocaleString() + " сум" : "—";

export default function StatisticsComponent() {
  const [statistics, setStatistics] = useState({
    totalDebt: 0,
    totalIncomeMonth: 0,
    totalIncomeYear: 0,
    occupiedArea: 0,
    totalArea: 0,
    occupancyPercentage: 0
  });

  const [debts, setDebts] = useState({
    electricity: null,
    water: null,
    gas: null,
    tax: null,
    management: null
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const statsRes = await axios.get(`${api}/con/stats`);
        if (!cancelled && statsRes.data?.success) {
          const { totalDebt, payments, occupancy } = statsRes.data.data;
          setStatistics({
            totalDebt: totalDebt || 0,
            totalIncomeMonth: payments?.prevMonth || 0,
            totalIncomeYear: payments?.thisYear || 0,
            occupiedArea: occupancy?.occupiedArea || 0,
            totalArea: occupancy?.totalBuildingArea || 0,
            occupancyPercentage: occupancy?.occupancyPercentage || 0
          });
        }

        const [el, su, ga, ta, man] = await Promise.allSettled([
          axios.get(`${api}/elc/debt`),
          axios.get(`${api}/suv/debt`),
          axios.get(`${api}/gas/debt`),
          axios.get(`${api}/tax/debt`),
          axios.get(`${api}/man/debt`)
        ]);

        if (!cancelled) {
          setDebts({
            electricity: el.status === "fulfilled" && el.value.data ? el.value.data : null,
            water: su.status === "fulfilled" && su.value.data ? su.value.data : null,
            gas: ga.status === "fulfilled" && ga.value.data ? ga.value.data : null,
            tax: ta.status === "fulfilled" && ta.value.data ? ta.value.data : null,
            management: man.status === "fulfilled" && man.value.data ? man.value.data : null
          });
        }

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Ошибка при получении данных с API");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Статистика здания</h1>
            <p className="text-slate-400 mt-1">Актуальные показатели по долгам и занятости</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle>
                Общий долг <span className="text-sm text-slate-400 font-normal">(всего)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{formatSum(statistics.totalDebt)}</div>
              <div className="mt-2 text-sm text-slate-400">Актуальная сумма просроченных платежей</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader><CardTitle>Доходы</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">За месяц</span>
                  <span className="font-semibold text-green-400">{formatSum(statistics.totalIncomeMonth)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">За год</span>
                  <span className="font-semibold text-green-400">{formatSum(statistics.totalIncomeYear)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader><CardTitle>Занятость здания</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{statistics.occupiedArea} м²</div>
                  <div className="text-sm text-slate-400">из {statistics.totalArea} м²</div>
                </div>
                <div className="w-32">
                  <div className="text-sm font-medium mb-2 text-right text-blue-400">{statistics.occupancyPercentage}%</div>
                  <Progress value={statistics.occupancyPercentage} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Debts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Детализация долгов</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Электроэнергия */}
            <Link to="/elec">
              <Card>
                <CardHeader><CardTitle className="text-yellow-400">Электроэнергия</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Общая сумма</span><span>{formatSum(debts.electricity?.totalElectrcy ?? 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Платежи</span><span>{formatSum(debts.electricity?.totalPayments ?? 0)}</span></div>
                    <Separator />
                    <div className="flex justify-between font-semibold"><span>Долг</span><span className="text-red-400">{formatSum(debts.electricity?.totalDebt ?? 0)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Водоснабжение */}
            <Link to="/suv">
              <Card>
                <CardHeader><CardTitle className="text-cyan-400">Водоснабжение</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Общая сумма</span><span>{formatSum(debts.water?.totalSuv ?? 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Платежи</span><span>{formatSum(debts.water?.totalPayments ?? 0)}</span></div>
                    <Separator />
                    <div className="flex justify-between font-semibold"><span>Долг</span><span className="text-red-400">{formatSum(debts.water?.totalDebt ?? 0)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Газ */}
            <Link to="/gas">
              <Card>
                <CardHeader><CardTitle className="text-orange-400">Газ</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Общая сумма</span><span>{formatSum(debts.gas?.totalGas ?? 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Платежи</span><span>{formatSum(debts.gas?.totalPayments ?? 0)}</span></div>
                    <Separator />
                    <div className="flex justify-between font-semibold"><span>Долг</span><span className="text-red-400">{formatSum(debts.gas?.totalDebt ?? 0)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Налоги */}
            <Link to="/tax">
              <Card>
                <CardHeader><CardTitle className="text-purple-400">Налоги</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Общая сумма</span><span>{formatSum(debts.tax?.totalTax ?? 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Платежи</span><span>{formatSum(debts.tax?.totalPayments ?? 0)}</span></div>
                    <Separator />
                    <div className="flex justify-between font-semibold"><span>Долг</span><span className="text-red-400">{formatSum(debts.tax?.totalDebt ?? 0)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Separator />

        {/* Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Управляющие компании</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(debts.management?.companies ?? []).map((c, i) => (
              <Link to="/man" key={i}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{c.company}</span>
                      <Badge className="bg-blue-600 text-white">
                        {Math.round((c.needToPay / (c.accrualBase || 1)) * 100) || 0}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div><div className="text-sm text-slate-400">База начислений</div><div>{formatSum(c.accrualBase)}</div></div>
                      <div><div className="text-sm text-slate-400">Нужно оплатить</div><div className="text-orange-400">{formatSum(c.needToPay)}</div></div>
                      <div><div className="text-sm text-slate-400">Оплачено</div><div className="text-green-400">{formatSum(c.paid)}</div></div>
                      <div><div className="text-sm text-slate-400">Долг</div><div className={c.debt >= 0 ? "text-red-400" : "text-green-400"}>{formatSum(c.debt)}</div></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Загрузка данных...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
