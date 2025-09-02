// Файл: src/components/Contracts/PaymentCell.jsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EditAccrualModal from "../Accrual/accrualEditModal";
import DeleteAccrualModal from "../Accrual/accrualDelModal";
import AccrualModal from "../Accrual/accrualModal";

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

export default PaymentCell;