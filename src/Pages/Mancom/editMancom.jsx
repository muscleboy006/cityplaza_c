import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const ModalEditMancom = ({ api, item, isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    date: "",
    mancom: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);

  // Заполняем форму при получении нового item
  useEffect(() => {
    if (item && isOpen) {
      setForm({
        date: item.date ? item.date.split("T")[0] : "",
        mancom: item.mancom || "",
        amount: item.amount?.toString() || "",
      });
    }
  }, [item, isOpen]);

  // Сброс формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setForm({
        date: "",
        mancom: "",
        amount: "",
      });
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.mancom || !form.amount) {
      alert("Заполните все поля!");
      return;
    }
    
    if (!item?._id) {
      alert("Ошибка: ID записи не найден!");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${api}/man/${item._id}`, {
        date: form.date,
        mancom: form.mancom,
        amount: Number(form.amount),
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      alert("Ошибка при обновлении");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать запись</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Дата */}
          <div>
            <Label>Дата</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          {/* Компания */}
          <div>
            <Label>Компания</Label>
            <Select
              onValueChange={(val) => handleChange("mancom", val)}
              value={form.mancom}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите компанию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Компания 1">Компания 1</SelectItem>
                <SelectItem value="Компания 2">Компания 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Сумма */}
          <div>
            <Label>Сумма</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="Введите сумму"
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Сохраняем..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditMancom;