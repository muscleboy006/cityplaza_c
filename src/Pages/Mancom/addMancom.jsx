import React, { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import api from "@/Utils/api";

const ModalAddMancom = ({ api, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: "",
    mancom: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.mancom || !form.amount) {
      alert("Заполните все поля!");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${api}/man/`, {
        date: form.date,
        mancom: form.mancom,
        amount: Number(form.amount),
      });
      setOpen(false);
      setForm({ date: "", mancom: "", amount: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Ошибка при добавлении:", err);
      alert("Ошибка при добавлении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">Добавить</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить начисление</DialogTitle>
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
            />
          </div>

          {/* Кнопка */}
          <Button
            type="submit"
            className="w-full bg-green-600 text-white hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Сохраняем..." : "Сохранить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalAddMancom;