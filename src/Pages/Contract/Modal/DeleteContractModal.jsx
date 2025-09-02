// Файл: src/components/Contracts/DeleteContractModal.jsx
import React from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/Utils/api';

const DeleteContractModal = ({ open, onOpenChange, contractId, onSuccess }) => {
  const handleConfirm = async () => {
    try {
      await axios.delete(`${api}/con/contracts/${contractId}`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Ошибка при удалении контракта:', err);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение удаления</DialogTitle>
        </DialogHeader>
        <p>Вы уверены, что хотите удалить этот контракт?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button variant="destructive" onClick={handleConfirm}>Удалить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteContractModal;