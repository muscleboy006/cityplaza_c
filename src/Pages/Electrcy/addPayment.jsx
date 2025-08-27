import React, { useState, useEffect, useRef } from "react";
import { X, Search, Upload, DollarSign } from "lucide-react";
import axios from "axios";
import api from "@/Utils/api";

const AddPaymentModal = ({ isOpen, onClose, electrcyId, onSuccess }) => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [amount, setAmount] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && electrcyId) {
      fetchContracts();
    }
  }, [isOpen, electrcyId]);

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

  const removeImage = (index) => {
    console.log("Удаляем новое изображение с индексом:", index);
    setImages((prev) => prev.filter((_, i) => i !== index));
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

    try {
      setLoading(true);
      setError("");
      
      console.log("Отправляем данные:", {
        electrcyId,
        contractId: selectedContract?._id,
        amount,
        name: !selectedContract ? searchTerm.trim() : undefined,
        newImagesCount: images.length
      });

      const response = await axios.put(`${api}/elc/${electrcyId}/add-payment`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Ответ сервера при добавлении:", response.data);
      console.log("Платеж успешно добавлен");
      
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error("Ошибка при добавлении платежа:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Неизвестная ошибка";
      setError(`Ошибка при добавлении платежа: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedContract(null);
    setAmount("");
    setImages([]);
    setShowDropdown(false);
    setLoading(false);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Добавить платеж
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Поиск и выбор договора */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Договор
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Введите название договора"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              {showDropdown && filteredContracts.length > 0 && (
                <div className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg z-10">
                  {filteredContracts.map((contract) => (
                    <div
                      key={contract._id}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 transition-colors"
                      onClick={() => handleSelectContract(contract)}
                    >
                      {contract.company || contract.name || `Договор #${contract._id}`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Сумма */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сумма <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Введите сумму"
                  required
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Загрузка изображений */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Изображения
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Нажмите для загрузки</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG или JPEG</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              
              {/* Превью изображений */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-red-100 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Сохраняю..." : "Добавить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;