// Файл: src/components/Contracts/ArchiveModal.jsx
import React from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/Utils/api';

const ArchiveModal = ({ open, onOpenChange, contractId, onSuccess }) => {
  const handleConfirm = async () => {
    try {
      await axios.patch(`${api}/con/${contractId}/toggle`, { id: contractId });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Ошибка при архивировании контракта:', err);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение архивации</DialogTitle>
        </DialogHeader>
        <p>Вы уверены, что хотите архивировать этот контракт?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleConfirm}>Архивировать</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveModal;