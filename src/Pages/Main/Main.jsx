import React, { useEffect, useState } from "react";
import axios from "axios";

// shadcn/ui components (adjust imports to your project structure)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// utils
import api from "@/Utils/api"; // ваш базовый url, как в оригинале

const formatSum = (v) => (typeof v === "number" ? v.toLocaleString() + " сум" : "—");

export default function StatisticsComponent() {
  const [statistics, setStatistics] = useState({
    totalDebt: 0,
    totalIncomeMonth: 0,
    totalIncomeYear: 0,
    occupiedArea: 0,
    totalArea: 0,
    occupancyPercentage: 0,
  });

  const [debts, setDebts] = useState({
    electricity: null,
    water: null,
    gas: null,
    tax: null,
    management: null,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // основной стейт
        const statsRes = await axios.get(`${api}/con/stats`);
        if (!cancelled && statsRes.data?.success) {
          const { totalDebt, payments, occupancy } = statsRes.data.data;
          setStatistics({
            totalDebt: totalDebt || 0,
            totalIncomeMonth: payments?.prevMonth || 0,
            totalIncomeYear: payments?.thisYear || 0,
            occupiedArea: occupancy?.occupiedArea || 0,
            totalArea: occupancy?.totalBuildingArea || 0,
            occupancyPercentage: occupancy?.occupancyPercentage || 0,
          });
        }

        // по-очереди долги (если API недоступно — используется демо)
        const [el, su, ga, ta, man] = await Promise.allSettled([
          axios.get(`${api}/elc/debt`),
          axios.get(`${api}/suv/debt`),
          axios.get(`${api}/gas/debt`),
          axios.get(`${api}/tax/debt`),
          axios.get(`${api}/man/debt`),
        ]);

        if (!cancelled) {
          setDebts((prev) => ({
            ...prev,
            electricity: el.status === "fulfilled" && el.value.data ? el.value.data : null,
            water: su.status === "fulfilled" && su.value.data ? su.value.data : null,
            gas: ga.status === "fulfilled" && ga.value.data ? ga.value.data : null,
            tax: ta.status === "fulfilled" && ta.value.data ? ta.value.data : null,
            management: man.status === "fulfilled" && man.value.data ? man.value.data : null,
          }));
        }

        setError(null);
      } catch (err) {
        console.error(err);
        setError("API unavailable — показываю демо-данные.");

        // демо-данные как fallback
        setStatistics({
          totalDebt: 31339354.84,
          totalIncomeMonth: 24000000,
          totalIncomeYear: 44000000,
          occupiedArea: 20,
          totalArea: 1000,
          occupancyPercentage: 2,
        });

        setDebts({
          electricity: { totalElectrcy: 100000000, totalPayments: 1000000, totalDebt: 99000000 },
          water: { totalSuv: 100000000, totalPayments: 1000000, totalDebt: 99000000 },
          gas: { totalGas: 100000000, totalPayments: 1000000, totalDebt: 99000000 },
          tax: { totalTax: 100000000, totalPayments: 1000000, totalDebt: 99000000 },
          management: {
            totalAccrualAmount: 44000000,
            totalDebt: 1760000,
            companies: [
              { company: "Компания 1", accrualBase: 44000000, needToPay: 3080000, paid: 1100000, debt: 1980000 },
              { company: "Компания 2", accrualBase: 44000000, needToPay: 880000, paid: 1100000, debt: -220000 },
            ],
          },
        });
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Статистика здания</h1>
          <p className="text-sm text-muted-foreground">Актуальные показатели по долгам и занятости</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.reload()} size="sm">Обновить</Button>
          {error && <Badge variant="destructive">Проблема с API</Badge>}
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">Общий долг <span className="text-sm text-muted-foreground">(всего)</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSum(statistics.totalDebt)}</div>
            <div className="mt-2 text-sm text-muted-foreground">Актуальная сумма просроченных платежей</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">Доходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">За месяц</div>
                <div className="font-medium">{formatSum(statistics.totalIncomeMonth)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">За год</div>
                <div className="font-medium">{formatSum(statistics.totalIncomeYear)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Занятость здания</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{statistics.occupiedArea} м²</div>
                <div className="text-sm text-muted-foreground">из {statistics.totalArea} м²</div>
              </div>
              <div className="w-32">
                <div className="text-sm font-medium mb-2">{statistics.occupancyPercentage}%</div>
                <Progress value={Math.min(Math.max(statistics.occupancyPercentage, 0), 100)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Debts grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Электроэнергия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Общая сумма</span>
                <span>{formatSum(debts.electricity?.totalElectrcy ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Платежи</span>
                <span>{formatSum(debts.electricity?.totalPayments ?? 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Долг</span>
                <span>{formatSum(debts.electricity?.totalDebt ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Водоснабжение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Общая сумма</span>
                <span>{formatSum(debts.water?.totalSuv ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Платежи</span>
                <span>{formatSum(debts.water?.totalPayments ?? 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Долг</span>
                <span>{formatSum(debts.water?.totalDebt ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Газ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Общая сумма</span>
                <span>{formatSum(debts.gas?.totalGas ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Платежи</span>
                <span>{formatSum(debts.gas?.totalPayments ?? 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Долг</span>
                <span>{formatSum(debts.gas?.totalDebt ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Налоги</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Общая сумма</span>
                <span>{formatSum(debts.tax?.totalTax ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Платежи</span>
                <span>{formatSum(debts.tax?.totalPayments ?? 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Долг</span>
                <span>{formatSum(debts.tax?.totalDebt ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Management companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(debts.management?.companies ?? []).map((c, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{c.company}</span>
                <Badge>{Math.round((c.needToPay / (c.accrualBase || 1)) * 100) || 0}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">База начислений</div>
                  <div className="font-medium">{formatSum(c.accrualBase)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Нужно оплатить</div>
                  <div className="font-medium">{formatSum(c.needToPay)}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Оплачено</div>
                  <div className="font-medium">{formatSum(c.paid)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Долг</div>
                  <div className="font-medium">{formatSum(c.debt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-sm text-muted-foreground">Загрузка данных...</div>
      )}
    </div>
  );
}
