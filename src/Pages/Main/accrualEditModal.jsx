import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [error, setError] = useState("");

  // Форматирование числа
  const formatNumber = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/\D/g, "");
    return new Intl.NumberFormat("ru-RU").format(Number(numericValue));
  };

  // Проверка доступной суммы
  const checkAvailableAmount = async (year, month) => {
    if (!contractId || !year || !month) return;

    try {
      const response = await axios.get(
        `http://localhost:7000/acc/accruals/check/${contractId}?year=${year}&month=${month}&excludeId=${accrualId}`
      );
      setAvailabilityInfo(response.data.data);
      setError("");
    } catch (err) {
      console.error("Ошибка при проверке доступной суммы:", err);
      setAvailabilityInfo(null);
    }
  };

  // Загрузка данных начисления
  useEffect(() => {
    if (open && accrualId) {
      setLoading(true);
      setError("");

      axios.get(`http://localhost:7000/acc/accruals/${accrualId}`)
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

  // Проверка доступной суммы при изменении даты или открытии
  useEffect(() => {
    if (open && contractId && accrualId) {
      checkAvailableAmount(form.year, form.month);
    }
  }, [open, contractId, accrualId, form.year, form.month]);

  // Обработка изменения числового поля
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setForm(prev => ({ ...prev, [name]: numericValue }));

    if (name === "accrualAmount" && availabilityInfo) {
      const requestedAmount = Number(numericValue) || 0;
      if (requestedAmount > availabilityInfo.availableAmount) {
        setError(`Начисление не может превышать доступную сумму (${formatNumber(availabilityInfo.availableAmount)})`);
      } else {
        setError("");
      }
    }
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

    const accrualNum = Number(form.accrualAmount) || 0;

    if (availabilityInfo && accrualNum > availabilityInfo.availableAmount) {
      setError(`Начисление не может превышать доступную сумму (${formatNumber(availabilityInfo.availableAmount)})`);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:7000/acc/accruals/${accrualId}`, {
        year: form.year,
        month: form.month,
        accrualAmount: accrualNum,
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

        {availabilityInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-1">
              <strong>Сумма по договору:</strong> {formatNumber(availabilityInfo.contractAmount)}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Уже начислено ({form.month} {form.year}):</strong> {formatNumber(availabilityInfo.totalAccruedAmount)}
            </p>
            <p className="text-sm font-medium text-green-600">
              <strong>Доступно для начисления:</strong> {formatNumber(availabilityInfo.availableAmount)}
            </p>
            {availabilityInfo.existingAccruals > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Найдено начислений за этот период: {availabilityInfo.existingAccruals}
              </p>
            )}
          </div>
        )}

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
              placeholder={availabilityInfo ? `Максимум: ${formatNumber(availabilityInfo.availableAmount)}` : ""}
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
              disabled={loading || (availabilityInfo && Number(form.accrualAmount) > availabilityInfo.availableAmount)}
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
