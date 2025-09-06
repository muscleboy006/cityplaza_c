import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/Utils/api";

export default function AccrualModal({ 
  open, 
  onClose, 
  contractId, 
  contractAmount, 
  onSuccess,
  monthKey // Новый пропс для получения месяца и года
}) {
  const [form, setForm] = useState({
    date: "",
    contractAmount: contractAmount,
    accrualAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [moveInDate, setMoveInDate] = useState(null);

  // Форматирование даты из monthKey в формат YYYY-MM-DD
  const getDefaultDateFromMonthKey = () => {
    if (!monthKey) return new Date().toISOString().split('T')[0];
    
    const [year, month] = monthKey.split('-');
    return `${year}-${month}-01`; // Первое число месяца
  };

  // Загружаем дату въезда при открытии
  useEffect(() => {
    if (open && contractId) {
      // Устанавливаем дату по умолчанию на основе monthKey
      const defaultDate = getDefaultDateFromMonthKey();
      setForm(prev => ({ ...prev, date: defaultDate }));
      
      axios.get(`${api}/con/contracts/${contractId}`)
        .then(res => {
          if (res.data?.data?.contract?.moveInDate) {
            setMoveInDate(new Date(res.data.data.contract.moveInDate));
          }
        })
        .catch(err => console.error("Ошибка загрузки даты въезда:", err));
    }
  }, [open, contractId, monthKey]);

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
      date: form.date,
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

  // Получаем минимальную дату на основе даты въезда
  // const getMinDate = () => {
  //   if (moveInDate) {
  //     return moveInDate.toISOString().split('T')[0];
  //   }
  //   return "2000-01-01";
  // };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить начисление</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Дата</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              max="2100-12-31"
              required
            />
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