import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import api from '@/Utils/api';

const DocumentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    electricity: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatNumber = (value) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleElectricityChange = (e) => {
    const formatted = formatNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      electricity: formatted
    }));
  };

  const handleSubmit = async () => {
    // Валидация перед отправкой
    if (!formData.year || !formData.electricity) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const electricityValue = formData.electricity.replace(/\s/g, '');
      
      // Получаем название месяца для отправки
      const monthName = months.find(m => m.value === parseInt(formData.month))?.label;
      
      const requestData = {
        year: parseInt(formData.year),
        month: monthName,
        totalTax: parseInt(electricityValue)
      };

      console.log('Отправляем данные:', requestData);
      
      const response = await axios.post(`${api}/tax`, requestData);

      console.log('Ответ сервера:', response.data);

      if (onSubmit) {
        onSubmit(response.data);
      }
      
      // Сброс формы
      setFormData({
        year: new Date().getFullYear(),
        electricity: ''
      });
      
      onClose();
    } catch (err) {
      console.error('Ошибка при отправке:', err);
      
      let errorMessage = 'Произошла ошибка при отправке данных';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      year: new Date().getFullYear(),
      electricity: ''
    });
    setError('');
    onClose();
  };

  // Обработчик нажатия клавиши Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight">
            Добавить документ налогаа
          </h2>
          <button
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6" onKeyPress={handleKeyPress}>
          <div className="space-y-4">
            {/* Year field */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Год *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  year: e.target.value
                }))}
                min="2000"
                max="2100"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
                placeholder="Введите год"
              />
            </div>

            {/* Electricity field */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Общая сумма *
              </label>
              <input
                type="text"
                value={formData.electricity}
                onChange={handleElectricityChange}
                placeholder="Сумма"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mt-4">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
              disabled={loading || !formData.year || !formData.month || !formData.electricity}
            >
              {loading ? 'Отправка...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;