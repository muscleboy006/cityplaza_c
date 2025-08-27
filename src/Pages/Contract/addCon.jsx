import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import api from "@/Utils/api";

export default function AddContractPage() {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    floor: "",
    area: "",
    officeNumber: "",
    company: "",
    link: "",
    moveInDate: today,
    moveOutDate: "",
    contractAmount: "",
    contractAmountMinus12: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === "contractAmount") {
      const amount = parseFloat(value) || 0;
      updatedData.contractAmountMinus12 = (amount * 0.88).toFixed(2);
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${api}/con/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);

      navigate("/cons");
    } catch (err) {
      console.error("Ошибка при добавлении договора:", err);
      alert("Не удалось добавить договор");
    }
  };

  return (
    <div className="flex justify-center p-1">
      <Card className="w-full max-w-md border-none shadow-none">
        {/* Шапка */}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="p-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <CardTitle className="text-lg font-medium text-center flex-1">
            Новый договор
          </CardTitle>
          <div className="w-5" /> {/* Заглушка для выравнивания */}
        </CardHeader>

        {/* Контент */}
        <CardContent>
  <form onSubmit={handleSubmit} className="space-y-2">
    <div>
      <Label htmlFor="floor" className="text-base font-semibold">
        Этаж
      </Label>
      <Input
        id="floor"
        name="floor"
        type="number"
        value={formData.floor}
        onChange={handleChange}
        required
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="officeNumber" className="text-base font-semibold">
        Кабинет
      </Label>
      <Input
        id="officeNumber"
        name="officeNumber"
        value={formData.officeNumber}
        onChange={handleChange}
        required
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="area" className="text-base font-semibold">
        Площадь (м²)
      </Label>
      <Input
        id="area"
        name="area"
        type="number"
        value={formData.area}
        onChange={handleChange}
        required
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="company" className="text-base font-semibold">
        Компания
      </Label>
      <Input
        id="company"
        name="company"
        value={formData.company}
        onChange={handleChange}
        required
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="link" className="text-base font-semibold">
        Ссылка
      </Label>
      <Input
        id="link"
        name="link"
        value={formData.link}
        onChange={handleChange}
        required
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="moveInDate" className="text-base font-semibold">
        Въезд
      </Label>
      <Input
        id="moveInDate"
        name="moveInDate"
        type="date"
        value={formData.moveInDate}
        onChange={handleChange}
        required
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="moveOutDate" className="text-base font-semibold">
        Выезд
      </Label>
      <Input
        id="moveOutDate"
        name="moveOutDate"
        type="date"
        value={formData.moveOutDate}
        onChange={handleChange}
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="contractAmount" className="text-base font-semibold">
        Сумма договора
      </Label>
      <Input
        id="contractAmount"
        name="contractAmount"
        type="number"
        value={formData.contractAmount}
        onChange={handleChange}
        required
        className="h-9"
      />
    </div>

    <div>
      <Label htmlFor="contractAmountMinus12" className="text-base font-semibold">
        К получению (-12%)
      </Label>
      <Input
        id="contractAmountMinus12"
        name="contractAmountMinus12"
        type="number"
        value={formData.contractAmountMinus12}
        disabled
        className="h-9"
      />
    </div>

    <Button type="submit" className="w-full h-9 text-sm">
      Сохранить договор
    </Button>
  </form>
</CardContent>

      </Card>
    </div>
  );
}

