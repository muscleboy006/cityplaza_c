import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EditAccrualModal from "../Accrual/accrualEditModal";
import DeleteAccrualModal from "../Accrual/accrualDelModal";
import AccrualModal from "../Accrual/accrualModal";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontal,
} from 'lucide-react';
import api from '@/Utils/api';
import './Contracts.css'

export default function Contracts() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [allLoadedRows, setAllLoadedRows] = useState([]);
  const [displayRows, setDisplayRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [serverPage, setServerPage] = useState(1);
  const [hasMoreServerData, setHasMoreServerData] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const navigate = useNavigate();

  const serverLimit = 60;
  const displayLimit = 20;

  // Функция для получения названий месяцев
  const getMonthNames = () => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябр', 'Октябр', 'Ноябрь', 'Декабрь'
    ];
    return months;
  };

  // Функция для конвертации названия месяца в номер
  const getMonthNumberFromName = (monthName) => {
    const monthMap = {
      'Январь': 1, 'Февраль': 2, 'Март': 3, 'Апрель': 4,
      'Май': 5, 'Июнь': 6, 'Июль': 7, 'Август': 8,
      'Сентябрь': 9, 'Октябрь': 10, 'Ноябрь': 11, 'Декабрь': 12
    };
    return monthMap[monthName] || null;
  };

  // Функция для создания нормализованного ключа месяца
  const createMonthKey = (year, month) => {
    const normalizedMonth = month.toString().padStart(2, '0');
    return `${year}-${normalizedMonth}`;
  };

  // Функция для разбивки данных на страницы для отображения
  const paginateDisplayData = useCallback((data, currentPage) => {
    const startIndex = (currentPage - 1) * displayLimit;
    const endIndex = startIndex + displayLimit;
    const slicedData = data.slice(startIndex, endIndex);

    // Дополняем пустыми строками до 20, если данных меньше
    const emptyRow = {
      id: null,
      floor: '',
      company: '',
      moveInDate: '',
      moveOutDate: '',
      contractAmount: '',
      contractAmountMinus12: '',
      area: '',
      officeNumber: '',
      debt: '',
      monthlyPayments: {},
    };
    const paddedData = [...slicedData];
    while (paddedData.length < displayLimit) {
      paddedData.push({ ...emptyRow, id: `empty-${paddedData.length}` });
    }
    return paddedData;
  }, []);

  // Проверяем нужно ли загружать новые данные с сервера
  const needMoreServerData = useCallback((currentPage, loadedDataLength) => {
    const requiredDataLength = currentPage * displayLimit;
    return requiredDataLength > loadedDataLength && hasMoreServerData;
  }, [hasMoreServerData]);

  const loadFilters = useCallback(async () => {
    try {
      const currentYear = new Date().getFullYear();
      const res = await axios.get(`${api}/con/conarch?limit=1&page=1&year=${currentYear}`);
            
      if (res.data.success && res.data.filters && res.data.filters.availableYears) {
        const years = res.data.filters.availableYears;
        setAvailableYears(years);
        
        if (years.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else if (years.length > 0) {
          setSelectedYear(Math.max(...years));
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке фильтров:', err);
    } finally {
      setFiltersLoaded(true);
    }
  }, []);

  const loadAllContracts = useCallback(async (currentServerPage = 1, appendToExisting = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/con/conarch?limit=${serverLimit}&page=${currentServerPage}&year=${selectedYear}`);
            
      if (res.data.success && Array.isArray(res.data.data)) {
        const dataWithId = res.data.data.map((item, index) => {
          const contract = item.contract || item;
          
          // Обработка начислений по месяцам с учетом строковых названий
          const monthlyPayments = {};
                    
          if (item.accruals && Array.isArray(item.accruals)) {
            item.accruals.forEach((accrual, accrualIndex) => {
              const year = accrual.year;
              const monthName = accrual.month; // "Август", "Июль" и т.д.
              const amount = accrual.accrualAmount;
                            
              // Конвертируем название месяца в номер
              const monthNumber = getMonthNumberFromName(monthName);
              
              if (year && monthNumber && amount) {
                const monthKey = createMonthKey(year, monthNumber);
                
                if (!monthlyPayments[monthKey]) {
                  monthlyPayments[monthKey] = [];
                }
                monthlyPayments[monthKey].push({
                  id: accrual._id,
                  amount: amount,
                  date: accrual.createdAt,
                  description: accrual.description || '',
                  year: year,
                  month: monthNumber,
                  monthName: monthName
                });
              } 
            });
          } 

          return {
            id: contract._id || `${currentServerPage}_${index + 1}`,
            floor: contract.floor,
            area: contract.area + ' м²',
            officeNumber: contract.officeNumber,
            company: contract.company,
            link: contract.link,
            moveInDate: contract.moveInDate 
              ? new Date(contract.moveInDate).toLocaleDateString('ru-RU') 
              : '',
            moveOutDate: contract.moveOutDate 
              ? new Date(contract.moveOutDate).toLocaleDateString('ru-RU') 
              : '',
            contractAmount: contract.contractAmount,
            contractAmountMinus12: contract.contractAmountMinus12,
            totalAccruals: item.totalAccruals || 0,
            totalPayments: item.totalPayments || 0,
            debt: item.debt || 0,
            monthlyPayments: monthlyPayments,
          };
        });
        
        setHasMoreServerData(dataWithId.length === serverLimit);
        
        if (appendToExisting) {
          setAllLoadedRows(prevRows => {
            const existingIds = new Set(prevRows.map(row => row.id));
            const newUniqueRows = dataWithId.filter(row => !existingIds.has(row.id));
            return [...prevRows, ...newUniqueRows];
          });
        } else {
          setAllLoadedRows(dataWithId);
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке контрактов:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  // Основная функция для загрузки данных с сервера
  const loadServerData = useCallback((currentServerPage, appendToExisting = false) => {
      loadAllContracts(currentServerPage, appendToExisting);
  }, [loadAllContracts]);

  // Обновляем отображаемые данные при изменении страницы или загруженных данных
  useEffect(() => {
    const newDisplayRows = paginateDisplayData(allLoadedRows, page);
    setDisplayRows(newDisplayRows);
    
    if (needMoreServerData(page, allLoadedRows.length)) {
      const nextServerPage = serverPage + 1;
      setServerPage(nextServerPage);
      loadServerData(nextServerPage, true);
    }
  }, [allLoadedRows, page, paginateDisplayData, needMoreServerData, serverPage, loadServerData]);

  // Обработчик изменения поискового запроса
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setServerPage(1);
      setHasMoreServerData(true);
      setAllLoadedRows([]);
      loadServerData(1, false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [loadServerData]);

  // Обработчик изменения года и загрузки фильтров
  useEffect(() => {
    if (filtersLoaded) {
      setPage(1);
      setServerPage(1);
      setHasMoreServerData(true);
      setAllLoadedRows([]);
      loadServerData(1, false);
    }
  }, [filtersLoaded, selectedYear, loadServerData]);

  // Начальная загрузка фильтров
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    const nextPageStartIndex = page * displayLimit;
    const hasNextPageData = nextPageStartIndex < allLoadedRows.length || hasMoreServerData;
    
    if (hasNextPageData) {
      setPage(page + 1);
    }
  };

  const canGoNext = () => {
    const nextPageStartIndex = page * displayLimit;
    return nextPageStartIndex < allLoadedRows.length || hasMoreServerData;
  };

  const getTotalPagesInfo = () => {
    const loadedPages = Math.ceil(allLoadedRows.length / displayLimit);
    if (hasMoreServerData) {
      return `${page} из ${loadedPages}+`;
    }
    return `${page} из ${loadedPages}`;
  };
  
  const refreshData = useCallback(() => {
    setPage(1);
    setServerPage(1);
    setHasMoreServerData(true);
    setAllLoadedRows([]);
    loadServerData(1, false);
  }, [loadServerData]);

  const handleToggleArchive = async (contractId) => {
    try {
      await axios.patch(`${api}/con/${contractId}/toggle`, { id: contractId });
      refreshData();
    } catch (err) {
      console.error('Ошибка при архивировании контракта:', err);
    }
  };

  // Компонент для отображения ячейки с платежами
  const PaymentCell = ({ payments, monthName, monthKey, rowData, onRefresh }) => {
    // Добавляем состояния для модалов
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedAccrualId, setSelectedAccrualId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false); // Состояние для модала добавления

    // Функция открытия модалки редактирования
    const openEditModal = (accrualId) => {
      setSelectedAccrualId(accrualId);
      setIsEditOpen(true);
    };

    // Функция открытия модалки удаления
    const openDeleteModal = (id) => {
      setDeleteId(id);
      setDeleteOpen(true);
    };

    // Функция открытия модалки добавления
    const openAddModal = () => {
      setIsAddOpen(true);
    };

    // Функция обновления данных
    const updateData = () => {
      if (onRefresh) {
        onRefresh();
      }
    };
    
    // Подсчитываем общую сумму для ячейки
    const totalAmount = payments?.length > 0 ? payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;

    // Извлекаем год и месяц из monthName для модала добавления
    const [monthDisplayName, yearStr] = monthName.split(' ');
    const year = parseInt(yearStr);
    
    // Пустые строки не должны быть кликабельными
    if (!rowData.id || rowData.id.startsWith('empty')) {
      return <div className="w-full h-8 border border-dashed bg-gray-100"></div>;
    }

    // Все ячейки теперь кликабельны
    return (
      <>
        <Dialog>
          <DialogTrigger asChild>
            <div 
              className={`w-full h-8 border rounded flex items-center justify-center text-xs font-medium cursor-pointer relative ${
                !payments || payments.length === 0
                  ? 'bg-gray-50 hover:bg-gray-100 border-dashed' // Пустые ячейки
                  : payments.length === 1 
                  ? 'bg-green-100 hover:bg-green-200' 
                  : 'bg-blue-100 hover:bg-blue-200'
              }`}
              title={
                !payments || payments.length === 0
                  ? `Нет платежей за ${monthName}. Нажмите для добавления`
                  : payments.length === 1 
                  ? `${totalAmount.toLocaleString()} сум за ${monthName}`
                  : `${payments.length} платежей на сумму ${totalAmount.toLocaleString()} сум за ${monthName}`
              }
            >
              {!payments || payments.length === 0 ? (
                <span className="text-white"></span>
              ) : payments.length === 1 ? (
                // Показываем полную сумму без сокращения
                <span>{totalAmount.toLocaleString()}</span>
              ) : (
                <div className="text-center">
                  <div>{payments.length}</div>
                  <div className="text-[8px]">{totalAmount.toLocaleString()}</div>
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>Платежи за {monthName}</DialogTitle>
              {/* Кнопка добавления в верхний правый угол */}
              <Button
                onClick={openAddModal}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Добавить
              </Button>
            </DialogHeader>
            <div className="space-y-2"> 
              {payments && payments.length > 0 ? (
                <>
                  {payments.map((payment, index) => (
                    <div key={payment.id || index} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{payment.amount.toLocaleString()} сум</div>
                        <div className="text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString('ru-RU')}
                        </div>
                        {payment.description && (
                          <div className="text-sm text-gray-600">{payment.description}</div>
                        )}
                        {payment.monthName && (
                          <div className="text-xs text-gray-400">({payment.monthName})</div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(payment.id)}
                        >
                          Редактировать
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteModal(payment.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-medium">
                    Итого: {totalAmount.toLocaleString()} сум
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Нет платежей за этот месяц
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Модал добавления начисления */}
        <AccrualModal
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          contractId={rowData.id}
          contractAmount={rowData.contractAmount}
          onSuccess={() => {
            setIsAddOpen(false);
            updateData();
          }}
          initialYear={year}
          initialMonth={monthDisplayName}
        />

        {/* Модал редактирования */}
        {rowData && (
          <EditAccrualModal
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            accrualId={selectedAccrualId}
            contractId={rowData.id}
            onSuccess={() => {
              setIsEditOpen(false);
              updateData();
            }}
          />
        )}

        {/* Модал удаления */}
        <DeleteAccrualModal
          open={deleteOpen}
          accrualId={deleteId}
          onOpenChange={setDeleteOpen}
          onSuccess={() => {
            setDeleteOpen(false);
            updateData();
          }}
        />
      </>
    );
  };

  return (
    <div className="flex flex-col h-screen main-container">
      <style jsx global>{`
  /* ГЛОБАЛЬНЫЕ СТИЛИ ДЛЯ УСТРАНЕНИЯ ДВОЙНОГО СКРОЛЛБАРА */
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  #root, #__next, [data-reactroot] {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
`}</style>
      <style jsx>{`
        /* Custom Scrollbar Styling */
        .table-container::-webkit-scrollbar {
          height: 12px;
        }
        .table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        .table-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 6px;
        }
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        /* Firefox Scrollbar */
        .table-container {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
        /* Fixed Table Header */
        .sticky-header {
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 10;
          border-bottom: 1px solid #e5e7eb;
        }
        /* Year Selector Styling */
        .year-selector-header select {
          width: 100px;
          padding: 4px;
          font-size: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          background: #ffffff;
          text-align: center;
        }
        /* Empty Row Styling */
        .empty-row {
          background: #f9fafb;
          pointer-events: none;
        }
      `}</style>
      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 bg-background">
            {/* Table Container with Fixed Scrollbar */}
            <div className="relative h-[calc(100vh-150px)] table-container" style={{
              overflowX: 'auto',
              overflowY: 'auto',
              contain: 'strict' // Это ключевое свойство!
            }}>
              <div style={{ 
                minWidth: '2000px',
                width: 'max-content'
              }} className="border rounded-md">
                <Table className="border-collapse" style={{ width: '2000px' }}>
                  <TableHeader className="sticky-header">
                    <TableRow>
                      <TableHead className="w-[60px]">Этаж</TableHead>
                      <TableHead className="w-[100px]">Компания</TableHead>
                      <TableHead className="w-[100px]">Дата заезда</TableHead>
                      <TableHead className="w-[100px]">Дата выезда</TableHead>
                      <TableHead className="w-[100px]">Сумма по договору</TableHead>
                      <TableHead className="w-[100px]">Сумма 12%</TableHead>
                      <TableHead className="w-[80px]">Квадратура</TableHead>
                      <TableHead className="w-[80px]">Номер офиса</TableHead>
                      <TableHead className="w-[100px]">Долг</TableHead>
                      <TableHead className="w-[100px] year-selector-header">
                        <select 
                          value={selectedYear} 
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          className="year-selector-header"
                        >
                          {availableYears
                            .sort((a, b) => b - a) // Сортируем годы по убыванию
                            .map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))
                          }
                        </select>
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                      {getMonthNames().map((month, index) => (
                        <TableHead key={index} className="text-center w-24 min-w-24 p-0">
                          {month}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="">
                    {displayRows.map((row) => {
                      // Фильтруем платежи по выбранному году
                      const filteredPayments = {};
                      Object.keys(row.monthlyPayments).forEach(key => {
                        if (key.startsWith(selectedYear.toString())) {
                          filteredPayments[key] = row.monthlyPayments[key];
                        }
                      });

                      // Пустые строки
                      if (!row.id || row.id.startsWith('empty')) {
                        return (
                          <TableRow key={`row-${row.id}`} className="empty-row">
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            <TableCell className="border border-dashed bg-gray-100"></TableCell>
                            {getMonthNames().map((monthName, monthIndex) => (
                              <TableCell key={monthIndex} className="text-center p-0 w-24 min-w-24">
                                <div className="w-full h-8 border border-dashed bg-gray-100"></div>
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow
                          key={`row-${row.id}`}
                          className="cursor-pointer hover:bg-primary/10 transition"
                        >
                          <TableCell>{row.floor}</TableCell>
                          <TableCell
                            className="hover:underline cursor-pointer"
                            onClick={() => navigate(`/con/${row.id}`)}
                          >
                            {row.company}
                          </TableCell>
                          <TableCell>{row.moveInDate}</TableCell>
                          <TableCell>{row.moveOutDate || "Нет"}</TableCell>
                          <TableCell>{row.contractAmount?.toLocaleString()}</TableCell>
                          <TableCell>{row.contractAmountMinus12?.toLocaleString()}</TableCell>
                          <TableCell>{row.area}</TableCell>
                          <TableCell>{row.officeNumber}</TableCell>
                          <TableCell
                            className={row.debt > 0 ? "text-red-600 font-medium" : "text-green-600"}
                          >
                            {row.debt?.toLocaleString()}
                          </TableCell>
                          <TableCell></TableCell> {/* Empty cell for year selector alignment */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Открыть меню</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedContractId(row.id);
                                  setTimeout(() => setArchiveModalOpen(true), 0);
                                }}>Разархивировать</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedContractId(row.id);
                                  setTimeout(() => setDeleteModalOpen(true), 0);
                                }}>Удалить</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          {getMonthNames().map((monthName, monthIndex) => {
                            const monthKey = createMonthKey(selectedYear, monthIndex + 1);
                            const payments = filteredPayments[monthKey] || [];
                                                        
                            return (
                              <TableCell key={monthIndex} className="text-center p-0 w-24 min-w-24">
                                <PaymentCell 
                                  payments={payments} 
                                  monthName={`${monthName} ${selectedYear}`}
                                  monthKey={monthKey}
                                  rowData={row}
                                  onRefresh={refreshData}
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Fixed Pagination Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  Страница {getTotalPagesInfo()}
                  {loading && (
                    <span className="ml-2 text-blue-600">Загрузка...</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Предыдущая
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!canGoNext()}
                    className="flex items-center gap-1"
                  >
                    Следующая
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
      </main>

      {/* Модал подтверждения архивации */}
      <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение разархивации</DialogTitle>
          </DialogHeader>
          <p>Вы уверены, что хотите разархивировать этот контракт?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setArchiveModalOpen(false)}>Отмена</Button>
            <Button onClick={async () => {
              await handleToggleArchive(selectedContractId);
              setArchiveModalOpen(false);
            }}>Разархивировать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модал подтверждения удаления */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
          </DialogHeader>
          <p>Вы уверены, что хотите удалить этот контракт?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={async () => {
              try {
                await axios.delete(`${api}/con/contracts/${selectedContractId}`);
                refreshData();
              } catch (err) {
                console.error('Ошибка при удалении контракта:', err);
              }
              setDeleteModalOpen(false);
            }}>Удалить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}