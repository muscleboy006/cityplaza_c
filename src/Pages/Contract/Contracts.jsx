import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontal,
} from 'lucide-react';
import api from '@/Utils/api';
import PaymentCell from './PaymentCell';
import ArchiveModal from './Modal/ArchiveModal';
import ErrorModal from './Modal/ErrorModal';
import DeleteContractModal from './Modal/DeleteContractModal';
import './Contracts.css';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MONTH_MAP = {
  'Январь': 1, 'Февраль': 2, 'Март': 3, 'Апрель': 4,
  'Май': 5, 'Июнь': 6, 'Июль': 7, 'Август': 8,
  'Сентябрь': 9, 'Октябрь': 10, 'Ноябрь': 11, 'Декабрь': 12
};

const SERVER_LIMIT = 60;
const DISPLAY_LIMIT = 20;
const CURRENT_YEAR = new Date().getFullYear();

const getMonthNumberFromName = (monthName) => MONTH_MAP[monthName] || null;
const createMonthKey = (year, month) => `${year}-${month.toString().padStart(2, '0')}`;

const EmptyRow = React.memo(() => (
  <TableRow className="empty-row">
    {Array.from({ length: 10 }, (_, i) => (
      <TableCell key={i} className="border border-dashed bg-gray-100" />
    ))}
    {MONTH_NAMES.map((_, monthIndex) => (
      <TableCell key={monthIndex} className="text-center p-0 w-24 min-w-24">
        <div className="w-full h-8 border border-dashed bg-gray-100" />
      </TableCell>
    ))}
  </TableRow>
));

const ContractRow = React.memo(({ 
  row, 
  selectedYear, 
  onNavigate, 
  onArchive, 
  onDelete, 
  onRefresh 
}) => {
  const filteredPayments = useMemo(() => {
    const filtered = {};
    const yearStr = selectedYear.toString();
    Object.keys(row.monthlyPayments).forEach(key => {
      if (key.startsWith(yearStr)) {
        filtered[key] = row.monthlyPayments[key];
      }
    });
    return filtered;
  }, [row.monthlyPayments, selectedYear]);

  const handleCompanyClick = useCallback(() => {
    onNavigate(`/con/${row.id}`);
  }, [onNavigate, row.id]);

  const handleEdit = useCallback(() => {
    onNavigate(`/con/e/${row.id}`);
  }, [onNavigate, row.id]);

  const handleArchive = useCallback(() => {
    onArchive(row.id, !row.moveOutDate || row.moveOutDate === "Нет");
  }, [onArchive, row.id, row.moveOutDate]);

  const handleDelete = useCallback(() => {
    onDelete(row.id);
  }, [onDelete, row.id]);

  return (
    <TableRow className="cursor-pointer hover:bg-primary/10 transition">
      <TableCell>{row.floor}</TableCell>
      <TableCell>{row.area}</TableCell>
      <TableCell>{row.officeNumber}</TableCell>
      <TableCell>{row.contractAmount?.toLocaleString()}</TableCell>
      <TableCell>{row.contractAmountMinus12?.toLocaleString()}</TableCell>
      <TableCell>{row.moveInDate}</TableCell>
      <TableCell>{row.moveOutDate || "Нет"}</TableCell>
      <TableCell
        className="hover:underline cursor-pointer"
        onClick={handleCompanyClick}
      >
        {row.company}
      </TableCell>
      <TableCell>{row.totalAccruals}</TableCell>
      <TableCell>{row.totalPayments}</TableCell>
      <TableCell
        className={row.debt > 0 ? "text-red-600 font-medium" : "text-green-600"}
      >
        {row.debt?.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>Изменить</DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>Архивировать</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      {MONTH_NAMES.map((monthName, index) => {
        const monthKey = createMonthKey(selectedYear, index + 1);
        const payments = filteredPayments[monthKey] || [];
        
        return (
          <TableCell key={index} className="text-center p-0 w-24 min-w-24">
            <PaymentCell 
              payments={payments} 
              monthName={`${monthName} ${selectedYear}`}
              monthKey={monthKey}
              rowData={row}
              onRefresh={onRefresh}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
});

export default function Contracts() {
  const [allContracts, setAllContracts] = useState([]);
  const [displayContracts, setDisplayContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  
  const navigate = useNavigate();
  const abortControllerRef = useRef();

  const processContractData = useCallback((item, index) => {
    const contract = item.contract || item;
    
    const monthlyPayments = {};
    
    if (item.accruals?.length > 0) {
      item.accruals.forEach((accrual) => {
        if (accrual.date) {
          const date = new Date(accrual.date);
          const year = date.getFullYear();
          const monthNumber = date.getMonth() + 1;
          const monthName = MONTH_NAMES[monthNumber - 1];
          
          const monthKey = createMonthKey(year, monthNumber);
          
          if (!monthlyPayments[monthKey]) {
            monthlyPayments[monthKey] = [];
          }
          
          monthlyPayments[monthKey].push({
            id: accrual._id,
            amount: accrual.accrualAmount || accrual.amount || 0,
            date: accrual.date,
            description: accrual.description || '',
            year,
            month: monthNumber,
            monthName
          });
        }
      });
    }

    return {
      id: contract._id || `contract_${index}`,
      floor: contract.floor || '',
      area: contract.area ? `${contract.area} м²` : '',
      officeNumber: contract.officeNumber || '',
      contractAmount: contract.contractAmount || 0,
      contractAmountMinus12: contract.contractAmountMinus12 || 0,
      moveInDate: contract.moveInDate 
        ? new Date(contract.moveInDate).toLocaleDateString('ru-RU') 
        : '',
      moveOutDate: contract.moveOutDate 
        ? new Date(contract.moveOutDate).toLocaleDateString('ru-RU') 
        : '',
      company: contract.company || '',
      link: contract.link || '',
      totalAccruals: item.totalAccruals || 0,
      totalPayments: item.totalPayments || 0,
      debt: item.debt || 0,
      monthlyPayments,
    };
  }, []);

  const loadContracts = useCallback(async (year, pageNum = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    
    try {
      const [contractsRes, filtersRes] = await Promise.all([
        axios.get(`${api}/con/contracts`, {
          params: {
            limit: SERVER_LIMIT,
            page: pageNum,
            year: year
          },
          signal: abortControllerRef.current.signal
        }),
        availableYears.length === 0 ? axios.get(`${api}/con/contracts`, {
          params: { limit: 1, page: 1, year: CURRENT_YEAR },
          signal: abortControllerRef.current.signal
        }) : Promise.resolve(null)
      ]);

      if (filtersRes?.data?.success && filtersRes.data.filters?.availableYears) {
        const years = filtersRes.data.filters.availableYears;
        setAvailableYears(years);
        
        if (!years.includes(year) && years.length > 0) {
          const maxYear = Math.max(...years);
          setSelectedYear(maxYear);
          return;
        }
      }

      if (contractsRes.data.success && Array.isArray(contractsRes.data.data)) {
        const processedData = contractsRes.data.data.map(processContractData);
        setAllContracts(processedData);
        setTotalPages(Math.ceil(processedData.length / DISPLAY_LIMIT));
        setPage(1);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Ошибка при загрузке контрактов:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [availableYears.length, processContractData]);

  const paginatedContracts = useMemo(() => {
    const startIndex = (page - 1) * DISPLAY_LIMIT;
    const endIndex = startIndex + DISPLAY_LIMIT;
    const slicedData = allContracts.slice(startIndex, endIndex);

    const emptyRowsCount = DISPLAY_LIMIT - slicedData.length;
    const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => ({
      id: `empty-${i}`,
      isEmpty: true
    }));

    return [...slicedData, ...emptyRows];
  }, [allContracts, page]);

  useEffect(() => {
    setDisplayContracts(paginatedContracts);
  }, [paginatedContracts]);

  useEffect(() => {
    loadContracts(selectedYear);
  }, [selectedYear, loadContracts]);

  useEffect(() => {
    loadContracts(CURRENT_YEAR);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handleArchive = useCallback((contractId, hasError) => {
    setSelectedContractId(contractId);
    if (hasError) {
      setErrorModalOpen(true);
    } else {
      setArchiveModalOpen(true);
    }
  }, []);

  const handleDelete = useCallback((contractId) => {
    setSelectedContractId(contractId);
    setDeleteModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    loadContracts(selectedYear);
  }, [loadContracts, selectedYear]);

  const handleYearChange = useCallback((e) => {
    const newYear = parseInt(e.target.value);
    setSelectedYear(newYear);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const handleAddContract = useCallback(() => {
    navigate('/addcon');
  }, [navigate]);

  const canGoNext = useMemo(() => page < totalPages, [page, totalPages]);
  const canGoPrev = useMemo(() => page > 1, [page]);
  const pageInfo = useMemo(() => `${page} из ${totalPages}`, [page, totalPages]);

  if (loading && allContracts.length === 0) {
    return (
      <div className="flex flex-col h-screen main-container">
        <div className="flex justify-center items-center h-full text-muted-foreground text-lg">
          Загрузка страницы...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-80vh main-container">
      <style jsx>{`
        html, body {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
        
        #root, #__next, [data-reactroot] {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }

        .table-container {
          contain: layout style paint;
        }
        
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
        
        .table-container {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
        
        .sticky-header {
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 10;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .year-selector-header select {
          width: 100px;
          padding: 4px;
          font-size: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          background: #ffffff;
          text-align: center;
        }
        
        .empty-row {
          background: #f9fafb;
          pointer-events: none;
        }

        .table-row {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

      <main className="flex-1 overflow-hidden p-4 bg-background">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Договоры</h1>
          <div className="flex items-center gap-4">
            <select 
              value={selectedYear} 
              onChange={handleYearChange}
              className="year-selector-header"
              disabled={loading}
            >
              {availableYears
                .sort((a, b) => b - a)
                .map(year => (
                  <option key={year} value={year}>{year}</option>
                ))
              }
            </select>
            <Button
              onClick={handleAddContract}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              Добавить документ
            </Button>
          </div>
        </div>

        <div className="relative h-[calc(100vh-200px)] table-container" style={{
          overflowX: 'auto',
          overflowY: 'auto',
          contain: 'strict'
        }}>
          <div style={{ 
            minWidth: '2000px',
            width: 'max-content'
          }} className="border rounded-md">
            <Table className="border-collapse" style={{ width: '2000px' }}>
              <TableHeader className="sticky-header">
                <TableRow>
                  <TableHead className="w-[60px]">Этаж</TableHead>
                  <TableHead className="w-[80px]">Квадратура</TableHead>
                  <TableHead className="w-[80px]">Номер офиса</TableHead>
                  <TableHead className="w-[100px]">Сумма по договору</TableHead>
                  <TableHead className="w-[100px]">Сумма 12%</TableHead>
                  <TableHead className="w-[100px]">Дата заезда</TableHead>
                  <TableHead className="w-[100px]">Дата выезда</TableHead>
                  <TableHead className="w-[100px]">Компания</TableHead>
                  <TableHead className="w-[100px]">Начисления</TableHead>
                  <TableHead className="w-[100px]">Общая сумма</TableHead>
                  <TableHead className="w-[100px]">Долг</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                  {MONTH_NAMES.map((month, index) => (
                    <TableHead key={index} className="text-center w-24 min-w-24 p-0">
                      {month}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayContracts.map((row) => {
                  if (row.isEmpty) {
                    return <EmptyRow key={row.id} />;
                  }
                  
                  return (
                    <ContractRow
                      key={row.id}
                      row={row}
                      selectedYear={selectedYear}
                      onNavigate={handleNavigate}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onRefresh={handleRefresh}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              Страница {pageInfo}
              {loading && (
                <span className="ml-2 text-blue-600">Загрузка...</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!canGoPrev || loading}
                className="flex items-center gap-1"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Предыдущая
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!canGoNext || loading}
                className="flex items-center gap-1"
              >
                Следующая
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <ArchiveModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        contractId={selectedContractId}
        onSuccess={handleRefresh}
      />

      <ErrorModal
        open={errorModalOpen}
        onOpenChange={setErrorModalOpen}
      />

      <DeleteContractModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        contractId={selectedContractId}
        onSuccess={handleRefresh}
      />
    </div>
  );
}