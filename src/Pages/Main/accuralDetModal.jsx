import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditAccrualModal from "./accrualEditModal";
import DeleteAccrualModal from "./accrualDelModal";
import api from "@/Utils/api";

export default function AccrualDetailsModal({ accrualId, open, onClose, onSuccess }) {
  const [accrual, setAccrual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAccrualId, setSelectedAccrualId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (open && accrualId) {
      setLoading(true);
      setError("");
      
      // Загружаем данные начисления
      axios.get(`${api}/acc/accruals/${accrualId}`)
        .then(res => {
          const accrualData = res.data.data;
          setAccrual(accrualData);
          
          // Если в данных начисления есть contractId, загружаем контракт
          if (accrualData.contractId) {
            return axios.get(`${api}/con/contracts/${accrualData.contractId}`);
          }
          return null;
        })
        .then(contractRes => {
          if (contractRes) {
            setContract(contractRes.data.data.contract);
          }
        })
        .catch(() => setError("Ошибка загрузки данных начисления"))
        .finally(() => setLoading(false));
    } else {
      setAccrual(null);
      setContract(null);
      setError("");
    }
  }, [open, accrualId]);

  // Функция открытия модалки редактирования
  const openEditModal = (accrualId) => {
    setSelectedAccrualId(accrualId);
    setIsEditOpen(true);
  };

  // Функция открытия модалки удаления
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  // Функция обновления единичного начисления
  const updateSingleAccrual = async (accrualId) => {
    try {
      const response = await axios.get(`${api}/acc/accruals/${accrualId}`);
      const updatedAccrual = response.data.data;
      setAccrual(updatedAccrual);
      
      // Также вызываем onSuccess из родительского компонента если он передан
      if (onSuccess) {
        onSuccess(accrualId);
      }
      
      console.log("Начисление успешно обновлено в модале");
    } catch (error) {
      console.error("Ошибка при обновлении записи:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Детали начисления</DialogTitle>
          </DialogHeader>

          {loading && <p>Загрузка...</p>}

          {error && <p className="text-red-600">{error}</p>}

          {accrual && !loading && !error && (
            <div className="space-y-2">
              <p><b>Год:</b> {accrual.year}</p>
              <p><b>Месяц:</b> {accrual.month}</p>
              <p><b>Начисление:</b> {new Intl.NumberFormat("ru-RU").format(accrual.accrualAmount)} сум</p>
              {/* Здесь можно добавить любые другие поля, которые есть у accrual */}
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <div className="flex gap-2">
              {accrual && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => openEditModal(accrual._id)}
                  >
                    Редактировать
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => openDeleteModal(accrual._id)}
                  >
                    Удалить
                  </Button>
                </>
              )}
            </div>
            <Button onClick={() => onClose(false)}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модал редактирования */}
      {contract && (
        <EditAccrualModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          accrualId={selectedAccrualId}
          contractId={contract._id}
          onSuccess={async () => {
            console.log("Начисление успешно обновлено, обновляем запись...");
            await updateSingleAccrual(selectedAccrualId);
            setIsEditOpen(false);
          }}
        />
      )}

      {/* Модал удаления */}
      <DeleteAccrualModal
        open={deleteOpen}
        accrualId={deleteId}
        onOpenChange={setDeleteOpen}
        onSuccess={() => {
          // Закрываем модал деталей после удаления
          onClose(false);
          setDeleteOpen(false);
          
          // Вызываем onSuccess родительского компонента для обновления списка
          if (onSuccess) {
            onSuccess();
          }
        }}
      />
    </>
  );
}