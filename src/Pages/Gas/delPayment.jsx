import React, { useState } from "react";
import axios from "axios";
import api from "@/Utils/api";

const DelPaymentModal = ({ isOpen, onClose, gasId, paymentId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${api}/gas/${gasId}/payment/${paymentId}`);
      if (onSuccess) onSuccess(paymentId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при удалении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border border-border rounded-lg shadow-lg w-full max-w-md p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Удалить платеж?
          </h2>
          <p className="text-sm text-muted-foreground">
            Это действие нельзя отменить. Платеж будет удален навсегда.
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
            disabled={loading}
          >
            {loading ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DelPaymentModal;