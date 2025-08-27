import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import api from "@/Utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ModalAddMancom from "./addMancom";
import ModalEditMancom from "./editMancom";
import DeleteMancomModal from "./delMancom";

const COMPANY_1 = "Компания 1";
const COMPANY_2 = "Компания 2";

const fmtMoney = (n) =>
  (Number(n) || 0).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) +
  " UZS";
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("ru-RU");
  } catch {
    return "—";
  }
};

export default function MancomDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Состояние для модалки редактирования
  const [editItem, setEditItem] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${api}/man`, {
        params: { year, page, limit },
      });
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, page, limit]);

  const c1 = useMemo(
    () => data?.companies?.find((c) => c.company === COMPANY_1),
    [data]
  );
  const c2 = useMemo(
    () => data?.companies?.find((c) => c.company === COMPANY_2),
    [data]
  );

  const company1Payments = useMemo(
    () => (data?.payments?.data || []).filter((p) => p.mancom === COMPANY_1),
    [data]
  );
  const company2Payments = useMemo(
    () => (data?.payments?.data || []).filter((p) => p.mancom === COMPANY_2),
    [data]
  );

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // ✅ Функция для открытия модалки редактирования
  const handleEdit = (item) => {
    console.log("Opening edit modal for:", item); // Для отладки
    setEditItem(item);
  };

  // ✅ Функция для закрытия модалки редактирования
  const handleCloseEdit = () => {
    setEditItem(null);
  };

  // ✅ Функция для успешного сохранения
  const handleEditSuccess = () => {
    setEditItem(null);
    fetchData(); // Обновляем данные
  };

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (id) => {
    // ✅ Здесь обнови список
    console.log("Удалено:", id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Управляющие компании</h1>

        <div className="flex items-center gap-3">
          <Select
            value={String(year)}
            onValueChange={(val) => {
              setPage(1);
              setYear(Number(val));
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Выберите год" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Обновить
          </Button>

          <ModalAddMancom api={api} onSuccess={fetchData} />
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      )}
      {err && !loading && (
        <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm">
          {err}
        </div>
      )}

      {/* Summary Cards */}
      {!loading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[c1, c2].map((c, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  {c?.company} ({i === 0 ? "7%" : "2%"})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">База начислений</span>
                  <span>{fmtMoney(c?.accrualBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">К оплате</span>
                  <span className="font-semibold">{fmtMoney(c?.needToPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Оплачено ({year})</span>
                  <span>{fmtMoney(c?.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Долг / Переплата</span>
                  <Badge variant={Number(c?.debt) >= 0 ? "destructive" : "default"}>
                    {fmtMoney(c?.debt)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payments Tables */}
      {!loading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{ title: COMPANY_1, rows: company1Payments }, { title: COMPANY_2, rows: company2Payments }].map((table) => (
            <Card key={table.title}>
              <CardHeader>
                <CardTitle>Платежи — {table.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-36">Дата</TableHead>
                        <TableHead className="text-right">Сумма</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Нет платежей
                          </TableCell>
                        </TableRow>
                      ) : (
                        table.rows.map((p) => (
                          <TableRow key={p._id}>
                            <TableCell>{fmtDate(p.date)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {fmtMoney(p.amount)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleEdit(p)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Редактировать
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(p)}
                                    className="cursor-pointer text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && data?.payments && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница <b>{data.payments.page}</b> из <b>{data.payments.totalPages}</b> • Всего:{" "}
            <b>{data.payments.total}</b>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.payments.totalPages || p, p + 1))}
              disabled={page >= (data.payments.totalPages || 1) || loading}
            >
              Далее
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ✅ Модалка редактирования */}
      <ModalEditMancom
        api={api}
        item={editItem}
        isOpen={!!editItem}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />
      <DeleteMancomModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        mancomId={selectedId}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}