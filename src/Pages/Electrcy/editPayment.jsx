import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import axios from "axios";
import api from "@/Utils/api";

const EditPaymentModal = ({ isOpen, onClose, electrcyId, paymentId, onSuccess }) => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [amount, setAmount] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && paymentId && electrcyId) {
      console.log("Модалка открыта, загружаем данные:", { electrcyId, paymentId });
      fetchContracts();
      fetchPaymentData();
    }
  }, [isOpen, paymentId, electrcyId]);

  const processImageUrl = (imgPath) => {
    if (!imgPath) return null;
    
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    
    const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    const fullUrl = `${api}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    
    console.log("Обработка изображения:", { original: imgPath, processed: fullUrl });
    return fullUrl;
  };

  const fetchPaymentData = async () => {
    if (!electrcyId || !paymentId) {
      console.error("Отсутствуют обязательные параметры:", { electrcyId, paymentId });
      return;
    }

    try {
      setLoadingPayment(true);
      setError("");
      
      console.log("Загружаем платеж:", electrcyId, paymentId);
      
      const res = await axios.get(`${api}/elc/${electrcyId}/payment/${paymentId}`);
      console.log("Ответ сервера:", res.data);
      
      const payment = res.data.data || res.data;
      console.log("Данные платежа:", payment);
      
      if (!payment) {
        setError("Платеж не найден");
        return;
      }

      setAmount(payment.amount?.toString() || "");
      
      const processedImages = (payment.images || [])
        .map(processImageUrl)
        .filter(Boolean);
      
      console.log("Обработанные изображения:", processedImages);
      setExistingImages(processedImages);
      setOriginalImages([...processedImages]);
      
      if (payment.contractId) {
        console.log("Ищем договор с ID:", payment.contractId);
        const contractsData = contracts.length > 0 ? contracts : await fetchContracts();
        const contract = contractsData.find(c => c._id === payment.contractId);
        
        if (contract) {
          console.log("Найден договор:", contract);
          setSelectedContract(contract);
          setSearchTerm(contract.company || contract.name || `Договор #${contract._id}`);
        } else {
          console.log("Договор не найден в списке, contractId:", payment.contractId);
        }
      } else if (payment.contract) {
        console.log("Используем встроенный договор:", payment.contract);
        setSelectedContract(payment.contract);
        setSearchTerm(payment.contract.company || payment.contract.name || `Договор #${payment.contract._id}`);
      } else if (payment.name) {
        setSearchTerm(payment.name);
      }
      
    } catch (error) {
      console.error("Ошибка загрузки данных платежа:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Неизвестная ошибка";
      setError(`Ошибка загрузки данных платежа: ${errorMessage}`);
    } finally {
      setLoadingPayment(false);
    }
  };

  const fetchContracts = async () => {
    try {
      console.log("Загружаем список договоров...");
      const res = await axios.get(`${api}/elc/cons`);
      console.log("Договоры загружены:", res.data);
      
      const contractsData = res.data.data || res.data || [];
      setContracts(contractsData);
      setFilteredContracts(contractsData);
      return contractsData;
    } catch (error) {
      console.error("Ошибка загрузки договоров:", error);
      return [];
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContracts(contracts);
    } else {
      setFilteredContracts(
        contracts.filter((contract) =>
          (contract.company || contract.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, contracts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("Добавляем новые изображения:", files.length);
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    console.log("Удаляем новое изображение с индексом:", index);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    console.log("Удаляем существующее изображение с индексом:", index);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectContract = (contract) => {
    setSelectedContract(contract);
    setSearchTerm(contract.company || contract.name || `Договор #${contract._id}`);
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedContract(null);
    setShowDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount) {
      setError("Заполните сумму!");
      return;
    }

    const formData = new FormData();
    
    if (selectedContract) {
      formData.append("contractId", selectedContract._id);
    }
    
    formData.append("amount", amount);
    
    if (!selectedContract && searchTerm.trim()) {
      formData.append("name", searchTerm.trim());
    }
    
    images.forEach((img, index) => {
      console.log(`Добавляем новое изображение ${index}:`, img.name);
      formData.append("images", img);
    });
    
    const imagesToKeep = existingImages.map(imgUrl => {
      if (imgUrl.startsWith(api)) {
        return imgUrl.replace(api, '');
      }
      return imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
    });
    
    console.log("Изображения для сохранения:", imagesToKeep);
    formData.append("existingImages", JSON.stringify(imagesToKeep));

    const removedImages = originalImages.filter(img => !existingImages.includes(img));
    if (removedImages.length > 0) {
      console.log("Удаленные изображения:", removedImages);
      formData.append("removedImages", JSON.stringify(removedImages.map(img => {
        if (img.startsWith(api)) {
          return img.replace(api, '');
        }
        return img.startsWith('/') ? img : `/${img}`;
      })));
    }

    try {
      setLoading(true);
      setError("");
      
      console.log("Отправляем данные:", {
        electrcyId,
        paymentId,
        contractId: selectedContract?._id,
        amount,
        name: !selectedContract ? searchTerm.trim() : undefined,
        newImagesCount: images.length,
        existingImagesCount: existingImages.length,
        removedImagesCount: removedImages.length
      });

      const response = await axios.put(`${api}/elc/${electrcyId}/payment/${paymentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Ответ сервера при обновлении:", response.data);
      console.log("Платеж успешно обновлен");
      
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error("Ошибка при обновлении платежа:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Неизвестная ошибка";
      setError(`Ошибка при обновлении платежа: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedContract(null);
    setAmount("");
    setImages([]);
    setExistingImages([]);
    setOriginalImages([]);
    setShowDropdown(false);
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
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
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
              {/* Contract search */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Договор
                </label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Введите название договора"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
                {showDropdown && filteredContracts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg z-50">
                    {filteredContracts.map((contract) => (
                      <div
                        key={contract._id}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSelectContract(contract)}
                      >
                        {contract.company || contract.name || `Договор #${contract._id}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Сумма *
                </label>
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Введите сумму"
                  required
                />
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Изображения
                </label>
                
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Существующие изображения:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {existingImages.map((imgUrl, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={imgUrl}
                            alt="existing"
                            className="w-full h-16 object-cover rounded-md border border-border"
                            onError={(e) => {
                              console.error("Ошибка загрузки изображения:", imgUrl);
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='0.3em' font-size='10' fill='%23999'%3EОшибка%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <label className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
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
                    <div className="text-xs text-muted-foreground mb-2">Новые изображения:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((img, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt="new preview"
                            className="w-full h-16 object-cover rounded-md border border-border"
                          />
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
                  onClick={onClose}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
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