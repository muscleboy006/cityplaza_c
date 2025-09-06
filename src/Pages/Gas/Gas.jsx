import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "@/Utils/api";
import DelPaymentModal from "./delPayment";
import AddPaymentModal from "./addPayment";
import EditPaymentModal from "./editPayment";
import DocumentModal from "./addGas";
import EditDocumentModal from "./editGas";
import DelConfirmModal from "./delGas";
import ImageViewerModal from "./imgViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CreditCard, Edit, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ClientTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedGasId, setSelectedGasId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addElecOpen, setAddElecOpen] = useState(false);
  
  // Состояния для просмотра изображений
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDeleteClick = (gasId, paymentId) => {
    setSelectedPaymentId(paymentId);
    setSelectedGasId(gasId);
    setModalOpen(true);
  };

  const handleEditClick = (gasId, paymentId) => {
    setSelectedPaymentId(paymentId);
    setSelectedGasId(gasId);
    setIsEditModalOpen(true);
  };
  
  const handelAddClick = (id) => {
    setSelectedGasId(id)
    setAddModalOpen(true)
  }

  const handleElecClick = (id) => {
    setEditModalOpen(true)
    setSelectedGasId(id)
  }

  const handleElecDeleteClick = (id) => {
    setSelectedGasId(id);
    setDeleteModalOpen(true);
  };

  // Функции для просмотра изображений
  const handleImageClick = (images, clickedIndex) => {
    const fullImageUrls = images.map(img => `${api}${img}`);
    setCurrentImages(fullImageUrls);
    setCurrentImageIndex(clickedIndex);
    setImageViewerOpen(true);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : currentImages.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < currentImages.length - 1 ? prev + 1 : 0
    );
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  const handleDocumentSubmit = (result) => {
    fetchData()
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;
  
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/gas?page=${page}&limit=${rowsPerPage}`);
      setData(res.data.data);
      console.log(res.data.data);
      
      setTotalPages(res.data.totalPages || Math.ceil(res.data.total / rowsPerPage));
    } catch (err) {
      setError("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Функция для форматирования чисел
  const formatNumber = (number) => {
    return Math.round(number).toLocaleString('ru-RU');
  };

  if (loading) return <p className="text-center">Загрузка...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      Таблица начислений по газу
    </h1>
    <Button 
      onClick={() => setAddElecOpen(true)}
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Добавить документ
    </Button>
  </div>

  {/* Table Card */}
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                Год
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                Месяц
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-30">
                Общая сумма
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-30">
                Общий по газу
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                В процентах
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Действия
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Платежи
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle">
                  <div className="font-medium">{item.year}</div>
                </td>
                <td className="p-4 align-middle">
                  <div className="font-medium">{item.month}</div>
                </td>
                <td className="p-4 align-middle">
                  <div className="font-semibold text-lg">{formatNumber(item.totalAmount)} UZS</div>
                </td>
                <td className="p-4 align-middle">
                  <div className="font-semibold text-lg">{formatNumber(item.totalGas)} UZS</div>
                </td>
                <td className="p-4 align-middle">
                  <Badge variant={"default"}>
                    {item.inPercent}%
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-1">
                    <Button 
                      onClick={() => handelAddClick(item._id)}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 gap-1"
                    >
                      <CreditCard className="h-3 w-3" />
                      Платеж
                    </Button>
                    <Button 
                      onClick={() => handleElecClick(item._id)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      onClick={() => handleElecDeleteClick(item._id)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  {item.paymentAmount.length > 0 ? (
                    <Card className="w-full">
                      <CardContent className="p-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  Компания
                                </th>
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  Сумма
                                </th>
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  Изображения
                                </th>
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  Действия
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.paymentAmount.map((pay) => (
                                <tr key={pay._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                  <td className="py-2 px-2">
                                    <div className="font-medium">
                                      {pay.name || "—"}
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 w-40">
                                    <Badge variant="outline" className="font-mono">
                                      {formatNumber(pay.amount)} UZS
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-2">
                                    {pay.images.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {pay.images.map((img, idx) => (
                                          <div key={idx} className="relative group">
                                            <img
                                              src={`${api}${img}`}
                                              alt="payment"
                                              className="w-10 h-10 object-cover rounded-md border-2 border-border hover:border-primary transition-colors cursor-pointer hover:shadow-lg"
                                              onClick={() => handleImageClick(pay.images, idx)}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">
                                        Нет изображений
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2 w-40">
                                    <div className="flex items-center gap-1">
                                      <Button
                                        onClick={() => handleEditClick(item._id, pay._id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() => handleDeleteClick(item._id, pay._id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-muted-foreground text-sm italic">
                      Нет платежей
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>

  {/* Pagination */}
  <div className="flex items-center justify-between">
    <p className="text-sm text-muted-foreground">
      Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
    </p>
    <div className="flex items-center space-x-2">
      <Button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Button>
      <Button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
        className="gap-1"
      >
        Далее
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>

      {/* Модал просмотра изображений */}
      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={handleCloseImageViewer}
        images={currentImages}
        currentIndex={currentImageIndex}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
      />
      <DocumentModal
        isOpen={addElecOpen}
        onClose={() => setAddElecOpen(false)}
        onSubmit={handleDocumentSubmit}
      />
      <EditDocumentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedGasId(null);
        }}
        onSubmit={handleDocumentSubmit}
        documentId={selectedGasId}
      />
      <DelConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedGasId(null);
        }}
        documentId={selectedGasId}
        onSuccess={handleDocumentSubmit}
        title="Удалить документ газа?"
        confirmText="Удалить"
      />
      <DelPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        gasId={selectedGasId}
        paymentId={selectedPaymentId}
        onSuccess={handleDocumentSubmit}
      />
      <AddPaymentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        gasId={selectedGasId}
        onSuccess={handleDocumentSubmit}
      />
      <EditPaymentModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        gasId={selectedGasId}
        paymentId={selectedPaymentId}
        onSuccess={handleDocumentSubmit}
      />
    </div>
  );
};

export default ClientTable;