import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { FlashOn, Thunderstorm, Water } from '@mui/icons-material';

import {
  MenuIcon,
  SearchIcon,
  XIcon,
  // FlashIcon,
  // DropIcon,
} from 'lucide-react'; // иконки shadcn обычно из lucide-react

export default function Main() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const loadAllContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:7000/con/contracts?limit=50&page=1');
      if (res.data.success && Array.isArray(res.data.data)) {
        const dataWithId = res.data.data.map((item, index) => ({
          id: item._id || index + 1,
          floor: item.floor,
          area: item.area + ' м²',
          officeNumber: item.officeNumber,
          company: item.company,
        }));
        setRows(dataWithId);
      }
    } catch (err) {
      console.error('Ошибка при загрузке контрактов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchContracts = useCallback(
    async (query) => {
      if (!query.trim()) {
        loadAllContracts();
        return;
      }
      setLoading(true);
      setIsSearching(true);
      try {
        const res = await axios.get('http://localhost:7000/con/search/contracts', {
          params: { query: query.trim() },
        });
        if (res.data.success && Array.isArray(res.data.data)) {
          const dataWithId = res.data.data.map((item, index) => ({
            id: item._id || index + 1,
            floor: item.floor,
            area: item.area + ' м²',
            officeNumber: item.officeNumber,
            company: item.company,
          }));
          setRows(dataWithId);
        }
      } catch (err) {
        console.error('Ошибка при поиске контрактов:', err);
        setRows([]);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [loadAllContracts]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchContracts(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchContracts]);

  useEffect(() => {
    loadAllContracts();
  }, [loadAllContracts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
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
                searchContracts(searchQuery);
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
                setDrawerOpen(false);
                // логика по нажатию, например, навигация
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <FlashOn className="w-5 h-5 mr-2" />
              Elektr
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false);
                // логика по нажатию
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary/10 transition"
            >
              <Water className="w-5 h-5 mr-2" />
              Suv
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 bg-background">
        {loading ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            {isSearching ? 'Поиск...' : 'Загрузка данных...'}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            {searchQuery ? 'Ничего не найдено' : 'Нет данных'}
          </div>
        ) : (
          <ScrollArea className="rounded-md border">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Компания</TableHead>
                  <TableHead className="w-[70px]">Этаж</TableHead>
                  <TableHead className="w-[100px]">Квадратура</TableHead>
                  <TableHead className="w-[100px]">Номер офиса</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-primary/10 transition"
                    onClick={() => navigate(`/con/${row.id}`)}
                  >
                    <TableCell>{row.company}</TableCell>
                    <TableCell>{row.floor}</TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell>{row.officeNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
