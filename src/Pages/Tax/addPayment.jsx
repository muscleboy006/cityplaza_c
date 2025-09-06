// import React, { useState, useEffect } from "react";
// import { X, Upload, DollarSign, Calendar } from "lucide-react";
// import axios from "axios";
// import api from "@/Utils/api";

// const AddPaymentModal = ({ isOpen, onClose, taxId, onSuccess }) => {
//   const [amount, setAmount] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!isOpen) {
//       resetForm();
//     }
//   }, [isOpen]);

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImages((prev) => [...prev, ...files]);
//   };

//   const removeImage = (index) => {
//     setImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!amount) {
//       setError("Заполните сумму!");
//       return;
//     }

//     if (!paymentDate) {
//       setError("Укажите дату платежа!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("amount", amount);
//     formData.append("date", paymentDate);
//     images.forEach((img) => {
//       formData.append("images", img);
//     });

//     try {
//       setLoading(true);
//       setError("");

//       await axios.put(`${api}/tax/${taxId}/add-payment`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (onSuccess) onSuccess();
//       onClose();
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || error.message || "Неизвестная ошибка";
//       setError(`Ошибка при добавлении платежа: ${errorMessage}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setAmount("");
//     setPaymentDate("");
//     setImages([]);
//     setLoading(false);
//     setError("");
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
//         {/* Заголовок */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
//             Добавить платеж
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//             disabled={loading}
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Сумма */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Сумма <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   placeholder="Введите сумму"
//                   required
//                 />
//                 <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               </div>
//             </div>

//             {/* Дата */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Дата платежа <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type="date"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   value={paymentDate}
//                   onChange={(e) => setPaymentDate(e.target.value)}
//                   required
//                 />
//                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               </div>
//             </div>

//             {/* Загрузка изображений */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Изображения
//               </label>
//               <div className="flex items-center justify-center w-full">
//                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                     <Upload className="w-8 h-8 mb-4 text-gray-400" />
//                     <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
//                       <span className="font-semibold">Нажмите для загрузки</span>
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       PNG, JPG или JPEG
//                     </p>
//                   </div>
//                   <input
//                     type="file"
//                     className="hidden"
//                     multiple
//                     accept="image/*"
//                     onChange={handleImageChange}
//                   />
//                 </label>
//               </div>

//               {images.length > 0 && (
//                 <div className="mt-4">
//                   <div className="flex flex-wrap gap-3">
//                     {images.map((img, index) => (
//                       <div key={index} className="relative group">
//                         <img
//                           src={URL.createObjectURL(img)}
//                           alt="preview"
//                           className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
//                         />
//                         <button
//                           type="button"
//                           className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
//                           onClick={() => removeImage(index)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Ошибки */}
//             {error && (
//               <div className="rounded-md bg-red-100 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
//                 {error}
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="flex gap-3 pt-4">
//               <button
//                 type="button"
//                 className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                 onClick={onClose}
//                 disabled={loading}
//               >
//                 Отмена
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm"
//               >
//                 {loading ? "Сохраняю..." : "Добавить"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddPaymentModal;
import React, { useState, useEffect } from "react";
import { X, Upload, DollarSign, Calendar } from "lucide-react";
import axios from "axios";
import api from "@/Utils/api";

const AddPaymentModal = ({ isOpen, onClose, taxId, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Функция для форматирования числа
  const formatNumber = (number) => {
    return Math.round(number).toLocaleString('ru-RU');
  };

  // Обработка изменения суммы
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Удаляем нечисловые символы
    setAmount(value);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
    formData.append("amount", Math.round(parseFloat(amount) || 0));
    formData.append("date", paymentDate);
    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      setLoading(true);
      setError("");

      await axios.put(`${api}/tax/${taxId}/add-payment`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Неизвестная ошибка";
      setError(`Ошибка при добавлении платежа: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPaymentDate("");
    setImages([]);
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
            {/* Сумма */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сумма <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={amount ? formatNumber(parseFloat(amount)) : ""}
                  onChange={handleAmountChange}
                  placeholder="Введите сумму"
                  required
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Дата */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Дата платежа <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG или JPEG
                    </p>
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

            {/* Ошибки */}
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