import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/Utils/api";

export default function EditAccrualModal({ open, onClose, accrualId, contractId, onSuccess }) {
  const months = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: months[new Date().getMonth()],
    accrualAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Форматирование числа
  const formatNumber = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/\D/g, "");
    return new Intl.NumberFormat("ru-RU").format(Number(numericValue));
  };

  // Загрузка данных начисления
  useEffect(() => {
    if (open && accrualId) {
      setLoading(true);
      setError("");

      axios.get(`${api}/acc/accruals/${accrualId}`)
        .then(res => {
          const data = res.data.data;
          setForm({
            year: data.year,
            month: data.month,
            accrualAmount: data.accrualAmount.toString(),
          });
        })
        .catch(err => {
          console.error("Ошибка загрузки начисления:", err);
          setError("Ошибка загрузки данных начисления");
        })
        .finally(() => setLoading(false));
    }
  }, [open, accrualId]);


  // Обработка изменения числового поля
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setForm(prev => ({ ...prev, [name]: numericValue }));
  };

  // Обработка изменения любых полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["accrualAmount"].includes(name)) {
      handleNumberChange(e);
    } else {
      setForm({ ...form, [name]: value });
      setError("");
    }
  };

  // Сабмит формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.put(`${api}/acc/accruals/${accrualId}`, {
        year: form.year,
        month: form.month,
        accrualAmount: formatNumber(accrualAmount),
        contractId
      });

      console.log("Начисление успешно обновлено:", response.data);

      if (onSuccess) {
        await onSuccess();
      }

      onClose?.();
    } catch (error) {
      console.error("Ошибка при обновлении начисления:", error);
      setError(error.response?.data?.message || "Ошибка при сохранении данных");
    } finally {
      setLoading(false);
    }
  };

  // Сброс формы
  const handleClose = () => {
    setForm({
      year: new Date().getFullYear(),
      month: months[new Date().getMonth()],
      accrualAmount: "",
    });
    setError("");
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать начисление</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Год</label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              min="2000"
              max="2100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Месяц</label>
            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Начисление</label>
            <input
              type="text"
              name="accrualAmount"
              value={formatNumber(form.accrualAmount)}
              onChange={handleChange}
              className={`w-full border rounded px-2 py-1 ${error ? "border-red-500" : ""}`}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

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
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Обновить"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}