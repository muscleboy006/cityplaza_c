import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import api from "@/Utils/api";

// Utility function to format numbers with thousand separators and no trailing zeros
const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  // Format with up to 2 decimal places
  let formatted = num.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  // Remove trailing zeros and decimal point if unnecessary
  formatted = formatted.replace(/,0+$/, "").replace(/,0+/, ",");
  return formatted;
};

// Utility function to parse formatted numbers back to raw float
const parseNumber = (value) => {
  if (!value) return "";
  // Remove thousand separators (spaces in ru-RU locale) and convert to number
  const cleanedValue = value.replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(cleanedValue);
  return isNaN(num) ? "" : num;
};

export default function EditContractPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    floor: "",
    area: "",
    officeNumber: "",
    company: "",
    link: "",
    moveInDate: "",
    moveOutDate: "",
    contractAmount: "",
    contractAmountMinus12: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для форматирования даты в формат YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch (err) {
      console.error("Ошибка форматирования даты:", err);
      return "";
    }
  };

  // Загружаем контракт
  useEffect(() => {
    const fetchContract = async () => {
      try {
        console.log(`Загружаем контракт с ID: ${id}`);

        const res = await fetch(`${api}/con/contracts/${id}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const responseData = await res.json();
        console.log("Полученные данные с сервера:", responseData);

        // Определяем структуру данных - данные находятся в responseData.data.contract
        let contract;
        if (responseData.data && responseData.data.contract) {
          contract = responseData.data.contract;
        } else if (responseData.data) {
          contract = responseData.data;
        } else {
          contract = responseData;
        }

        console.log("Обрабатываемый контракт:", contract);

        // Проверяем наличие данных
        if (!contract) {
          throw new Error("Данные контракта не найдены");
        }

        // Заполняем форму данными
        const newFormData = {
          floor: String(contract.floor || ""),
          area: String(contract.area || ""),
          officeNumber: String(contract.officeNumber || ""),
          company: String(contract.company || ""),
          link: String(contract.link || ""),
          moveInDate: formatDate(contract.moveInDate),
          moveOutDate: formatDate(contract.moveOutDate),
          contractAmount: formatNumber(contract.contractAmount || ""),
          contractAmountMinus12: formatNumber(contract.contractAmountMinus12 || ""),
        };

        console.log("Данные для формы:", newFormData);
        setFormData(newFormData);
      } catch (err) {
        console.error("Ошибка при загрузке договора:", err);
        setError(`Ошибка при загрузке договора: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContract();
    } else {
      setError("ID договора не указан");
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // Handle number fields with formatting
    if (name === "contractAmount") {
      const rawValue = parseNumber(value); // Parse the input to a number
      if (rawValue !== "") {
        const amount = parseFloat(rawValue) || 0;
        updatedData.contractAmount = formatNumber(amount); // Format for display
        updatedData.contractAmountMinus12 = formatNumber(amount * 0.88); // Format calculated value
      } else {
        updatedData.contractAmount = "";
        updatedData.contractAmountMinus12 = "";
      }
    }

    console.log(`Изменение поля ${name}: ${value}`);
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data for submission by parsing formatted numbers
      const submitData = {
        ...formData,
        contractAmount: parseNumber(formData.contractAmount),
        contractAmountMinus12: parseNumber(formData.contractAmountMinus12),
      };

      console.log("Отправляем данные:", submitData);

      const res = await fetch(`${api}/con/contracts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка ${res.status}: ${errorText}`);
      }

      console.log("Договор успешно обновлен");
      navigate(-1);
    } catch (err) {
      console.error("Ошибка при изменении договора:", err);
      alert(`Не удалось изменить договор: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Загрузка данных договора...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="mb-4">{error}</p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Изменить договор
          </CardTitle>
          <div className="w-5" /> {/* Заглушка для выравнивания */}
        </CardHeader>

        {/* Контент */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2">
            {[
              { name: "floor", label: "Этаж", type: "number" },
              { name: "officeNumber", label: "Кабинет" },
              { name: "area", label: "Площадь (м²)", type: "number", step: "0.01" },
              { name: "company", label: "Компания" },
              { name: "link", label: "Ссылка" },
              { name: "moveInDate", label: "Въезд", type: "date" },
              { name: "moveOutDate", label: "Выезд", type: "date" },
              {
                name: "contractAmount",
                label: "Сумма договора",
                type: "text", // Use text for formatted input
              },
              {
                name: "contractAmountMinus12",
                label: "К получению (-12%)",
                type: "text", // Use text for formatted input
                disabled: true,
              },
            ].map(({ name, label, type = "text", step, disabled }) => (
              <div key={name}>
                <Label htmlFor={name} className="text-base font-semibold">
                  {label}
                </Label>
                <Input
                  id={name}
                  name={name}
                  type={type}
                  step={step}
                  value={formData[name]}
                  onChange={handleChange}
                  required={!disabled && name !== "moveOutDate"} // moveOutDate не обязательное
                  disabled={disabled}
                  className="h-9"
                  placeholder={disabled ? "Рассчитывается автоматически" : ""}
                />
              </div>
            ))}

            <Button type="submit" className="w-full h-9 text-sm mt-4">
              Сохранить изменения
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}