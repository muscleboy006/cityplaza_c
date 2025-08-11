import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AccrualModal({ open, onClose, contractId, contractAmount, onSuccess }) {
  const months = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = months[new Date().getMonth()];

  const [form, setForm] = useState({
    year: currentYear,
    month: currentMonth,
    contractAmount: contractAmount,
    accrualAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [error, setError] = useState("");
  const [moveInDate, setMoveInDate] = useState(null);

  // Загружаем дату въезда при открытии
  useEffect(() => {
    if (open && contractId) {
      axios.get(`http://localhost:7000/con/contracts/${contractId}`)
        .then(res => {
          if (res.data?.data?.contract?.moveInDate) {
            setMoveInDate(new Date(res.data.data.contract.moveInDate));
          }
        })
        .catch(err => console.error("Ошибка загрузки даты въезда:", err));
    }
  }, [open, contractId]);

  // Функция для проверки доступной суммы
  const checkAvailableAmount = async (year, month) => {
    if (!contractId || !year || !month) return;
    try {
      const response = await axios.get(
        `http://localhost:7000/acc/accruals/check/${contractId}?year=${year}&month=${month}`
      );
      setAvailabilityInfo(response.data.data);
      setError("");
    } catch (err) {
      console.error("Ошибка при проверке доступной суммы:", err);
      setAvailabilityInfo(null);
    }
  };

  // Проверка при изменении даты
  useEffect(() => {
    if (open && contractId) {
      checkAvailableAmount(form.year, form.month);
    }
  }, [open, contractId, form.year, form.month]);

  const formatNumber = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/\D/g, "");
    return new Intl.NumberFormat("ru-RU").format(Number(numericValue));
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Проверка, чтобы нельзя было выбрать месяц раньше въезда
    if (name === "year" && moveInDate) {
      const yearNum = Number(value);
      if (yearNum < moveInDate.getFullYear()) return; // запрещаем выбор
    }
    if (name === "month" && moveInDate && Number(form.year) === moveInDate.getFullYear()) {
      const monthIndex = months.indexOf(value);
      if (monthIndex < moveInDate.getMonth()) return; // запрещаем выбор
    }

    if (["accrualAmount"].includes(name)) {
      handleNumberChange(e);
    } else {
      setForm({ ...form, [name]: value });
      setError("");
    }
  };

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

    const submitData = {
      year: Number(form.year),
      month: form.month,
      contractId,
      contractAmount: Number(contractAmount),
      accrualAmount: accrualNum,
    };

    try {
      const response = await axios.post("http://localhost:7000/acc/accruals", submitData);
      console.log("Успешный ответ:", response.data);
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Ошибка при добавлении:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(`Ошибка сервера: ${error.response.data.error}`);
      } else {
        setError("Произошла ошибка при создании начисления");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить начисление</DialogTitle>
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
              min={moveInDate ? moveInDate.getFullYear() : 2000}
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
              {months.map((m, idx) => {
                if (moveInDate && Number(form.year) === moveInDate.getFullYear() && idx < moveInDate.getMonth()) {
                  return null; // пропускаем месяцы до въезда
                }
                return <option key={m} value={m}>{m}</option>;
              })}
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

          <button
            type="submit"
            disabled={loading || (availabilityInfo && Number(form.accrualAmount) > availabilityInfo.availableAmount)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
