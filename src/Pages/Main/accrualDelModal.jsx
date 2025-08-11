import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/Utils/api";

export default function DeleteAccrualModal({ accrualId, open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Сбрасываем ошибку при открытии модалки
  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  const handleDelete = async () => {
    if (!accrualId) return;

    setLoading(true);
    setError("");

    try {
      await axios.delete(`${api}/acc/accruals/${accrualId}`);
      if (onSuccess) {
        await onSuccess();
      }
      
    //   onOpenChange(false);
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при удалении");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик закрытия, сбрасываем ошибки
  const handleClose = () => {
    setError("");
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить начисление?</DialogTitle>
        </DialogHeader>

        <p className="mb-4 text-sm text-gray-600">
          Это действие нельзя отменить. Вместе с начислением будут удалены все связанные данные.
        </p>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
