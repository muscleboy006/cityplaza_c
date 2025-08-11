import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import AccrualModal from "./accrualModal";
import AccrualDetailsModal from "./accuralDetModal";

export default function ConDetails() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [accruals, setAccruals] = useState([])
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  const loadedPages = useRef(new Set()); // Отслеживаем загруженные страницы
  const [open, setOpen] = useState(false);
  const [selectedAccrualId, setSelectedAccrualId] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Функция открытия модалки по строке
  const openDetailsModal = (id) => {
    setSelectedAccrualId(id);
    setDetailsModalOpen(true);
  };

  // пагинация
  const [currentPage, setCurrentPage] = useState(1); // текущая страница внутри 50
  const [serverPage, setServerPage] = useState(1); // страница на бэке
  const [hasMore, setHasMore] = useState(true); // есть ли ещё данные

  const rowsPerPage = 10;

  const fetchAccruals = async (pageFromServer, forceReload = false) => {
    // Если forceReload = true, игнорируем кэш
    if (!forceReload && loadedPages.current.has(pageFromServer)) {
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:7000/con/contracts/${id}?page=${pageFromServer}&limit=50`
      );
      if (res.data.success) {
        setContract(res.data.data);
        console.log(res.data.data);

        // Добавляем страницу в список загруженных
        loadedPages.current.add(pageFromServer);

        // Если это первая страница или принудительная перезагрузка, заменяем массив полностью
        if (pageFromServer === 1 || forceReload) {
          setAccruals(res.data.data.accruals);
        } else {
          // Для последующих страниц добавляем к существующим данным
          setAccruals((prev) => {
            // Фильтруем дубликаты по уникальному идентификатору
            const newAccruals = res.data.data.accruals.filter(
              newItem => !prev.some(existingItem =>
                existingItem.year === newItem.year &&
                existingItem.month === newItem.month
              )
            );
            return [...prev, ...newAccruals];
          });
        }

        if (res.data.data.accruals.length < 50) {
          setHasMore(false); // больше с сервера не придёт
        }
      }
    } catch (err) {
      console.error("Ошибка при загрузке контракта:", err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления одной записи начисления
  const updateSingleAccrual = async (accrualId) => {
    try {
      // Загружаем обновленные данные конкретного начисления
      const response = await axios.get(`http://localhost:7000/acc/accruals/${accrualId}`);
      const updatedAccrual = response.data.data;

      // Обновляем только эту запись в существующем массиве
      setAccruals(prev =>
        prev.map(accrual =>
          accrual._id === accrualId ? updatedAccrual : accrual
        )
      );

      console.log("Начисление успешно обновлено в списке");
    } catch (error) {
      console.error("Ошибка при обновлении записи:", error);
      // В случае ошибки делаем полную перезагрузку первой страницы
      await fetchAccruals(1, true);
    }
  };

  useEffect(() => {
    // Сбрасываем состояние при изменении ID
    setAccruals([]);
    setCurrentPage(1);
    setServerPage(1);
    setHasMore(true);
    loadedPages.current.clear();
    setLoading(true);

    fetchAccruals(1);
  }, [id]);

  const handleNextPage = () => {
    const maxPage = Math.ceil(accruals.length / rowsPerPage);
    if (currentPage < maxPage) {
      setCurrentPage((p) => p + 1);
    } else if (hasMore) {
      const nextServerPage = serverPage + 1;
      setServerPage(nextServerPage);
      fetchAccruals(nextServerPage);
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = accruals.slice(startIndex, startIndex + rowsPerPage);

  if (loading) return <div className="p-4">Загрузка...</div>;
  if (!contract) return <div className="p-4">Контракт не найден</div>;

  const formatDate = (date) => {
    if (!date) return "-";
    return format(new Date(date), "d MMMM yyyy", { locale: ru });
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "-";
    return new Intl.NumberFormat("ru-RU").format(num) + " сум";
  };

  const details = [
    { label: "Этаж", value: contract.contract.floor },
    { label: "Площадь", value: `${contract.contract.area} м²` },
    { label: "Кабинет", value: contract.contract.officeNumber },
    { label: "Компания", value: contract.contract.company },
    { label: "Дата заезда", value: formatDate(contract.contract.moveInDate) },
    { label: "Дата выезда", value: formatDate(contract.contract.moveOutDate) },
    { label: "Сумма по договору", value: formatNumber(contract.contract.contractAmount) },
    { label: "Сумма 12%", value: formatNumber(contract.contract.contractAmountMinus12) },
    { label: "Начисления", value: formatNumber(contract.totalAccruals) },
    { label: "Платежи", value: formatNumber(contract.totalPayments) },
    { label: "Долги", value: formatNumber(contract.debt) },
  ];

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:7000/con/contracts/${contract.contract._id}`);
      navigate("/contracts");
    } catch (err) {
      console.error("Ошибка при удалении контракта:", err);
      alert("Не удалось удалить договор");
    }
  };

  return (
    <div className="w-full flex justify-center p-2 md:px-0">
      <Card className="w-full md:w-[90%] border-none shadow-none">
        {/* Навигация + заголовок */}
        <div className="mb-1">
          {/* ПК — breadcrumbs + заголовок */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate('/contracts')}
                >
                  Договоры
                </span>
                <span className="mx-1">/</span>
                <span className="text-gray-700 font-medium">{contract.contract.company}</span>
              </div>
              <h2 className="text-xl font-semibold">{contract.contract.company}</h2>
            </div>

            {/* Контейнер для кнопок справа */}
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => navigate(`/con/e/${contract.contract._id}`)}
              >
                Изменить
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Удалить</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить договор?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Вместе с договором будут удалены все связанные начисления и платежи.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Телефон — стрелка + заголовок + кнопки справа */}
          <div className="flex items-center justify-between md:hidden px-1">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/contracts')}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold truncate">{contract.contract.company}</h2>
            </div>

            {/* Контейнер кнопок справа, плотно */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => navigate(`/con/e/${contract.contract._id}`)}
              >
                Изменить
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">Удалить</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить договор?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Вместе с договором будут удалены все связанные начисления и платежи.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>


        {/* Контент */}
        <CardContent className="p-0 md:px-0 px-2 mt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-0 md:gap-y-3 gap-x-6">
            {details.map((item, index) => (
              <div
                key={index}
                className={`flex flex-row justify-between items-center md:flex-col md:items-start 
              py-2 border-b border-gray-200 md:border-0`}
              >
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className="text-base font-medium md:text-left">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto mt-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Платежи</h2>
              <Button
                onClick={() => setOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-sm"
              >
                Добавить
              </Button>
            </div>
            <Table>
              <TableCaption>История начислений</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Год</TableHead>
                  <TableHead>Месяц</TableHead>
                  <TableHead>Начисление</TableHead>
                  <TableHead>Долг</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRows.length > 0 ? (
                  currentRows.map((acc, idx) => (
                    <TableRow
                      key={`${acc.year}-${acc.month}-${startIndex + idx}`}
                      onClick={() => openDetailsModal(acc._id)} // по клику открываем модал
                      className="cursor-pointer hover:bg-gray-100" // для UX
                    >
                      <TableCell>{acc.year}</TableCell>
                      <TableCell>{acc.month}</TableCell>
                      <TableCell>{formatNumber(acc.accrualAmount)}</TableCell>
                      <TableCell>{formatNumber(acc.monthlyDebt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Нет начислений
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Пагинация */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Пред.
              </Button>

              <span className="text-sm">
                Страница {currentPage} из{" "}
                {Math.max(1, Math.ceil(accruals.length / rowsPerPage))}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore && currentPage === Math.ceil(accruals.length / rowsPerPage)}
              >
                След. <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Модалки */}
      <AccrualModal
        open={open}
        onClose={() => setOpen(false)}
        contractId={contract.contract._id}
        contractAmount={contract.contract.contractAmount}
        onSuccess={() => {
          // Для новых записей просто перезагружаем первую страницу
          fetchAccruals(1, true);
          setOpen(false);
        }}
      />

      <AccrualDetailsModal
        accrualId={selectedAccrualId}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onSuccess={(accrualId) => {
          // Обновляем конкретное начисление в списке
          if (accrualId) {
            updateSingleAccrual(accrualId);
          } else {
            // Или полная перезагрузка при удалении
            fetchAccruals(1, true);
          }
        }}
      />

    </div>
  );
}