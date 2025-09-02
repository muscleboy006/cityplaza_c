// Файл: src/components/Contracts/ErrorModal.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ErrorModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ошибка архивации</DialogTitle>
        </DialogHeader>
        <p>Дата выезда не может быть пустым для архивирования.</p>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal;