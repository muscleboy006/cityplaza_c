import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import api from '@/Utils/api';

const DocumentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    totalTax: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatNumber = (value) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleTaxChange = (e) => {
    const formatted = formatNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      totalTax: formatted
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.year || !formData.totalTax) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const totalTaxValue = formData.totalTax.replace(/\s/g, '');

      const requestData = {
        year: parseInt(formData.year),
        totalTax: parseInt(totalTaxValue)
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
        totalTax: ''
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
      totalTax: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight">
            Добавить документ налога
          </h2>
          <button
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form className="p-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Год *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, year: e.target.value }))
                }
                min="2000"
                max="2100"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={loading}
              />
            </div>

            {/* Tax */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Общая сумма *</label>
              <input
                type="text"
                value={formData.totalTax}
                onChange={handleTaxChange}
                placeholder="Сумма"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mt-4">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2 flex-1"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
              disabled={loading || !formData.year || !formData.totalTax}
            >
              {loading ? 'Отправка...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
