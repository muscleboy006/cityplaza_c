import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Analytics, Description, FlashOn, Water } from '@mui/icons-material';
import {
  MenuIcon,
  SearchIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import api from '@/Utils/api';

export default function Contracts() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [allLoadedRows, setAllLoadedRows] = useState([]); // Все загруженные данные
  const [displayRows, setDisplayRows] = useState([]); // Данные для отображения
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [serverPage, setServerPage] = useState(1); // Страница для запроса на сервер
  const [hasMoreServerData, setHasMoreServerData] = useState(true);
  const navigate = useNavigate();

  const serverLimit = 45; // Количество записей загружаемых с сервера
  const displayLimit = 15; // Количество записей показываемых на одной странице

  // Функция для разбивки данных на страницы для отображения
  const paginateDisplayData = useCallback((data, currentPage) => {
    const startIndex = (currentPage - 1) * displayLimit;
    const endIndex = startIndex + displayLimit;
    return data.slice(startIndex, endIndex);
  }, []);

  // Проверяем нужно ли загружать новые данные с сервера
  const needMoreServerData = useCallback((currentPage, loadedDataLength) => {
    const requiredDataLength = currentPage * displayLimit;
    return requiredDataLength > loadedDataLength && hasMoreServerData;
  }, [hasMoreServerData]);

  const loadAllContracts = useCallback(async (currentServerPage = 1, appendToExisting = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/con/contracts?limit=${serverLimit}&page=${currentServerPage}`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const dataWithId = res.data.data.map((item, index) => ({
          id: item._id || `${currentServerPage}_${index + 1}`,
          floor: item.floor,
          area: item.area + ' м²',
          officeNumber: item.officeNumber,
          company: item.company,
          moveInDate: item.moveInDate 
          ? new Date(item.moveInDate).toLocaleDateString('ru-RU') 
          : '',
          contractAmount: item.contractAmount,
          contractAmountMinus12: item.contractAmountMinus12,
        }));
        
        // Определяем, есть ли еще данные на сервере
        setHasMoreServerData(dataWithId.length === serverLimit);
        
        if (appendToExisting) {
          setAllLoadedRows(prevRows => [...prevRows, ...dataWithId]);
        } else {
          setAllLoadedRows(dataWithId);
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке контрактов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchContracts = useCallback(
    async (query, currentServerPage = 1, appendToExisting = false) => {
      if (!query.trim()) {
        loadAllContracts(currentServerPage, appendToExisting);
        return;
      }
      setLoading(true);
      setIsSearching(true);
      try {
        const res = await axios.get(`${api}/con/search/contracts`, {
          params: { 
            query: query.trim(),
            limit: serverLimit,
            page: currentServerPage
          },
        });
        if (res.data.success && Array.isArray(res.data.data)) {
          const dataWithId = res.data.data.map((item, index) => ({
            id: item._id || `${currentServerPage}_${index + 1}`,
            floor: item.floor,
            area: item.area + ' м²',
            officeNumber: item.officeNumber,
            company: item.company,
            moveInDate: item.moveInDate 
            ? new Date(item.moveInDate).toLocaleDateString('ru-RU') 
            : '',
            contractAmount: item.contractAmount,
            contractAmountMinus12: item.contractAmountMinus12,
          }));
          
          // Определяем, есть ли еще данные на сервере
          setHasMoreServerData(dataWithId.length === serverLimit);
          
          if (appendToExisting) {
            setAllLoadedRows(prevRows => [...prevRows, ...dataWithId]);
          } else {
            setAllLoadedRows(dataWithId);
          }
        }
      } catch (err) {
        console.error('Ошибка при поиске контрактов:', err);
        if (!appendToExisting) {
          setAllLoadedRows([]);
        }
        setHasMoreServerData(false);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [loadAllContracts]
  );

  // Основная функция для загрузки данных с сервера
  const loadServerData = useCallback((currentServerPage, appendToExisting = false) => {
    if (searchQuery.trim()) {
      searchContracts(searchQuery, currentServerPage, appendToExisting);
    } else {
      loadAllContracts(currentServerPage, appendToExisting);
    }
  }, [searchQuery, searchContracts, loadAllContracts]);

  // Обновляем отображаемые данные при изменении страницы или загруженных данных
  useEffect(() => {
    const newDisplayRows = paginateDisplayData(allLoadedRows, page);
    setDisplayRows(newDisplayRows);
    
    // Проверяем нужно ли загрузить больше данных с сервера
    if (needMoreServerData(page, allLoadedRows.length)) {
      const nextServerPage = serverPage + 1;
      setServerPage(nextServerPage);
      loadServerData(nextServerPage, true);
    }
  }, [allLoadedRows, page, paginateDisplayData, needMoreServerData, serverPage, loadServerData]);

  // Обработчик изменения поискового запроса
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // При изменении поиска сбрасываем все состояния
      setPage(1);
      setServerPage(1);
      setHasMoreServerData(true);
      setAllLoadedRows([]);
      loadServerData(1, false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadServerData]);

  // Начальная загрузка данных
  useEffect(() => {
    loadAllContracts(1);
  }, [loadAllContracts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    // Проверяем есть ли данные для следующей страницы
    const nextPageStartIndex = page * displayLimit;
    const hasNextPageData = nextPageStartIndex < allLoadedRows.length || hasMoreServerData;
    
    if (hasNextPageData) {
      setPage(page + 1);
    }
  };

  // Определяем доступность кнопки "Следующая"
  const canGoNext = () => {
    const nextPageStartIndex = page * displayLimit;
    return nextPageStartIndex < allLoadedRows.length || hasMoreServerData;
  };

  // Вычисляем общее количество доступных страниц (примерно)
  const getTotalPagesInfo = () => {
    const loadedPages = Math.ceil(allLoadedRows.length / displayLimit);
    if (hasMoreServerData) {
      return `${page} из ${loadedPages}+`;
    }
    return `${page} из ${loadedPages}`;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <button
          className="p-2 rounded-md hover:bg-primary/30 transition"
          onClick={() => setDrawerOpen(true)}
          aria-label="Открыть меню"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-md mx-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/70" />
          <Input
            placeholder="Поиск по компании..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
            aria-label="Поиск по компании"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setPage(1);
                setServerPage(1);
                setHasMoreServerData(true);
                setAllLoadedRows([]);
                loadServerData(1, false);
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-foreground hover:text-destructive transition"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <Button onClick={() => navigate('/addcon')}>Добавить</Button>
      </header>

      {/* Drawer */}
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
    <SheetContent side="left" className="w-64">
        <SheetHeader>
        <SheetTitle>Меню</SheetTitle>
        </SheetHeader>
                <div className="space-y-1 px-2">
                <button
                    onClick={() => {
                        navigate('/dashboard')
                        // логика по нажатию, например, навигация
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
                >
                    <Analytics className="w-5 h-5 mr-2" />
                    Дашборд
                </button>
                <button
                onClick={() => {
                    navigate('/cons')
                    // логика по нажатию, например, навигация
                }}
                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
                >
                <Description className="w-5 h-5 mr-2" />
                Договоры
                </button>
                    <button
                        onClick={() => {
                            setDrawerOpen(false);
                            // логика по нажатию, например, навигация
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
                    >
                        <FlashOn className="w-5 h-5 mr-2" />
                        Электр
                    </button>
                    <button
                        onClick={() => {
                            setDrawerOpen(false);
                            // логика по нажатию
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
                    >
                        <Water className="w-5 h-5 mr-2" />
                        Вода
                    </button>
                </div>
            </SheetContent>
        </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 bg-background">
        {loading && allLoadedRows.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            {isSearching ? 'Поиск...' : 'Загрузка данных...'}
          </div>
        ) : displayRows.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            {searchQuery ? 'Ничего не найдено' : 'Нет данных'}
          </div>
        ) : (
          <>
            <ScrollArea className="rounded-md border">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20px]">Этаж</TableHead>
                    <TableHead className="w-[100px]">Компания</TableHead>
                    <TableHead className="w-[100px]">Дата заезда</TableHead>
                    <TableHead className="w-[100px]">Сумма по договору</TableHead>
                    <TableHead className="w-[100px]">Сумма 12%</TableHead>
                    <TableHead className="w-[100px]">Квадратура</TableHead>
                    <TableHead className="w-[100px]">Номер офиса</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-primary/10 transition"
                      onClick={() => navigate(`/con/${row.id}`)}
                    >
                      <TableCell>{row.floor}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>{row.moveInDate}</TableCell>
                      <TableCell>{row.contractAmount}</TableCell>
                      <TableCell>{row.contractAmountMinus12}</TableCell>
                      <TableCell>{row.area}</TableCell>
                      <TableCell>{row.officeNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 px-2">
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
          </>
        )}
      </main>
    </div>
  );
}
