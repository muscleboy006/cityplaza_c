import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/Utils/api";

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
  const [error, setError] = useState("");
  const [moveInDate, setMoveInDate] = useState(null);

  // Загружаем дату въезда при открытии
  useEffect(() => {
    if (open && contractId) {
      axios.get(`${api}/con/contracts/${contractId}`)
        .then(res => {
          if (res.data?.data?.contract?.moveInDate) {
            setMoveInDate(new Date(res.data.data.contract.moveInDate));
          }
        })
        .catch(err => console.error("Ошибка загрузки даты въезда:", err));
    }
  }, [open, contractId]);

  const formatNumber = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/\D/g, "");
    return new Intl.NumberFormat("ru-RU").format(Number(numericValue));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setForm(prev => ({ ...prev, [name]: numericValue }))
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    const submitData = {
      year: Number(form.year),
      month: form.month,
      contractId,
      contractAmount: Number(contractAmount),
      accrualAmount: Number(form.accrualAmount),
    };

    try {
      const response = await axios.post(`${api}/acc/accruals`, submitData);
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
              {months.map((m, idx) => (
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}