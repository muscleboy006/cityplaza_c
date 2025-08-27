import React, { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const DeleteMancomModal = ({ isOpen, onClose, mancomId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const api = import.meta.env.VITE_API_URL; // ✅ Подставляем твой API

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${api}/man/${mancomId}`);
      if (onSuccess) onSuccess(mancomId);
      onClose();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить запись?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Вы уверены, что хотите удалить эту запись? Это действие необратимо.
        </p>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMancomModal;