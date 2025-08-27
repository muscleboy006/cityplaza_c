import React, { useState } from "react";
import axios from "axios";
import api from "@/Utils/api";

const DelConfirmModal = ({
  isOpen,
  onClose,
  documentId,
  onSuccess,
  title = "Удалить документ?",
  confirmText = "Удалить"
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${api}/tax/${documentId}`);
      if (onSuccess) onSuccess(documentId); // коллбек для обновления списка
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при удалении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-lg border max-w-lg w-full mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 p-6">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h2>
        </div>
        
        {/* Content */}
        <div className="p-6 pt-0">
          <p className="text-sm text-muted-foreground">
            Это действие нельзя будет отменить. Документ будет удален навсегда.
          </p>
          
          {error && (
            <div className="mt-4 p-3 rounded-md bg-destructive/15 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2"
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
          >
            {loading ? "Удаление..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DelConfirmModal;