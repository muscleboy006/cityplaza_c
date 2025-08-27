import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import axios from "axios";
import api from "@/Utils/api";

const EditPaymentModal = ({ isOpen, onClose, taxId, paymentId, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(""); // ✅ добавлено
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && paymentId && taxId) {
      fetchPaymentData();
    }
  }, [isOpen, paymentId, taxId]);

  const processImageUrl = (imgPath) => {
    if (!imgPath) return null;

    if (imgPath.startsWith("http")) {
      return imgPath;
    }

    const cleanPath = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
    const fullUrl = `${api}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    return fullUrl;
  };

  const fetchPaymentData = async () => {
    try {
      setLoadingPayment(true);
      setError("");

      const res = await axios.get(`${api}/tax/${taxId}/payment/${paymentId}`);
      const payment = res.data.data || res.data;

      if (!payment) {
        setError("Платеж не найден");
        return;
      }

      setAmount(payment.amount?.toString() || "");
      setPaymentDate(payment.date || ""); // ✅ загружаем дату

      const processedImages = (payment.images || [])
        .map(processImageUrl)
        .filter(Boolean);

      setExistingImages(processedImages);
      setOriginalImages([...processedImages]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Неизвестная ошибка";
      setError(`Ошибка загрузки данных платежа: ${errorMessage}`);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount) {
      setError("Заполните сумму!");
      return;
    }

    if (!paymentDate) {
      setError("Укажите дату платежа!");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("date", paymentDate); // ✅ отправляем дату

    images.forEach((img) => {
      formData.append("images", img);
    });

    const imagesToKeep = existingImages.map((imgUrl) => {
      if (imgUrl.startsWith(api)) {
        return imgUrl.replace(api, "");
      }
      return imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;
    });

    formData.append("existingImages", JSON.stringify(imagesToKeep));

    const removedImages = originalImages.filter(
      (img) => !existingImages.includes(img)
    );
    if (removedImages.length > 0) {
      formData.append(
        "removedImages",
        JSON.stringify(
          removedImages.map((img) => {
            if (img.startsWith(api)) {
              return img.replace(api, "");
            }
            return img.startsWith("/") ? img : `/${img}`;
          })
        )
      );
    }

    try {
      setLoading(true);
      setError("");

      await axios.put(`${api}/tax/${taxId}/payment/${paymentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Неизвестная ошибка";
      setError(`Ошибка при обновлении платежа: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPaymentDate("");
    setImages([]);
    setExistingImages([]);
    setOriginalImages([]);
    setLoadingPayment(false);
    setLoading(false);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight">
            Редактировать платеж
          </h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loadingPayment ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Загрузка данных...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Сумма *</label>
                <input
                  type="number"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Введите сумму"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Дата платежа <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Изображения</label>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div>
                    <div className="text-xs mb-2">Существующие изображения:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {existingImages.map((imgUrl, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={imgUrl}
                            alt="existing"
                            className="w-full h-16 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(index)}
                            title="Удалить изображение"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new images */}
                <div>
                  <label className="inline-flex items-center justify-center rounded-md border px-4 py-2 cursor-pointer hover:bg-gray-100">
                    <Upload className="h-4 w-4 mr-2" />
                    Добавить изображения
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* New images */}
                {images.length > 0 && (
                  <div>
                    <div className="text-xs mb-2">Новые изображения:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((img, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt="new preview"
                            className="w-full h-16 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImage(index)}
                            title="Удалить изображение"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 border rounded-md px-4 py-2 hover:bg-gray-100"
                  onClick={onClose}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
                >
                  {loading ? "Сохраняю..." : "Сохранить"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPaymentModal;
