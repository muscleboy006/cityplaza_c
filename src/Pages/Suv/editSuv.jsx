import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import api from '@/Utils/api';

const EditDocumentModal = ({ isOpen, onClose, onSubmit, documentId }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    electricity: ''
  });
  
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const months = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' }
  ];

  const fetchDocumentData = async (id) => {
    if (!id) return;
    
    setLoadingData(true);
    setError('');
    
    try {
      console.log('Загружаем данные документа ID:', id);
      
      const response = await axios.get(`${api}/suv/${id}`);
      
      const data = response.data.data || response.data;
      
      console.log('Полная структура ответа:', response.data);
      console.log('Данные документа:', data);
      
      setDocumentData(data);
      
      const monthValue = months.find(m => m.label === data.month)?.value || 1;
      
      setFormData({
        year: data.year || new Date().getFullYear(),
        month: monthValue,
        electricity: data.totalSuv ? formatNumber(data.totalSuv.toString()) : ''
      });
      
    } catch (err) {
      console.error('Ошибка при загрузке данных документа:', err);
      
      let errorMessage = 'Не удалось загрузить данные документа';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentData(documentId);
    }
  }, [isOpen, documentId]);

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
    if (!formData.year || !formData.month || !formData.electricity) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (!documentId) {
      setError('ID документа не найден');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const electricityValue = formData.electricity.replace(/\s/g, '');
      
      const monthName = months.find(m => m.value === parseInt(formData.month))?.label;
      
      const requestData = {
        year: parseInt(formData.year),
        month: monthName,
        totalSuv: parseInt(electricityValue)
      };

      console.log('Изменяем документ ID:', documentId);
      console.log('Отправляем данные:', requestData);
      
      const response = await axios.put(`${api}/suv/${documentId}`, requestData);

      console.log('Ответ сервера:', response.data);

      if (onSubmit) {
        onSubmit(response.data.data || response.data);
      }
      
      onClose();
    } catch (err) {
      console.error('Ошибка при изменении:', err);
      
      let errorMessage = 'Произошла ошибка при изменении данных';
      
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
      month: new Date().getMonth() + 1,
      electricity: ''
    });
    setDocumentData(null);
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && !loadingData) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Загрузка данных документа...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight">
            Изменить документ воды
          </h2>
          <button
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            disabled={loading || loadingData}
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
                disabled={loading || loadingData}
                placeholder="Введите год"
              />
            </div>

            {/* Month field */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Месяц *
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  month: e.target.value
                }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || loadingData}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
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
                disabled={loading || loadingData}
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
              disabled={loading || loadingData}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
              disabled={loading || loadingData || !formData.year || !formData.month || !formData.electricity}
            >
              {loading ? 'Изменение...' : 'Изменить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDocumentModal;