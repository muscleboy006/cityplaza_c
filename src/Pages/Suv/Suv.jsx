import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "@/Utils/api";
import DelPaymentModal from "./delPayment";
import AddPaymentModal from "./addPayment";
import EditPaymentModal from "./editPayment";
import DocumentModal from "./addSuv";
import EditDocumentModal from "./editSuv";
import DelConfirmModal from "./delSuv";
import ImageViewerModal from "./imgViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CreditCard, Edit, Plus, Trash2, Calendar, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const ClientTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedSuvId, setSelectedSuvId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addElecOpen, setAddElecOpen] = useState(false);

  // Состояние для просмотра изображений
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDeleteClick = (suvId, paymentId) => {
    setSelectedPaymentId(paymentId);
    setSelectedSuvId(suvId);
    setModalOpen(true);
  };

  const handleEditClick = (suvId, paymentId) => {
    setSelectedPaymentId(paymentId);
    setSelectedSuvId(suvId);
    setIsEditModalOpen(true);
  };

  const handelAddClick = (id) => {
    setSelectedSuvId(id);
    setAddModalOpen(true);
  };

  const handleElecClick = (id) => {
    setEditModalOpen(true);
    setSelectedSuvId(id);
  };

  const handleElecDeleteClick = (id) => {
    setSelectedSuvId(id);
    setDeleteModalOpen(true);
  };

  // Функции для просмотра изображений
  const handleImageClick = (images, clickedIndex) => {
    const fullImageUrls = images.map((img) => `${api}${img}`);
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
    fetchData();
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/suv?page=${page}&limit=${rowsPerPage}`);
      setData(res.data.data); // массив текущей страницы
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

  if (loading) return <p className="text-center py-8">Загрузка...</p>;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Таблица начислений по воде
          </h1>
          <Button onClick={() => setAddElecOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Добавить документ
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
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
                        Общий по воде
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
                          <div className="font-semibold text-lg">{formatNumber(item.totalSuv)} UZS</div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={"default"}>{item.inPercent}%</Badge>
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
                                        <tr
                                          key={pay._id}
                                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                          <td className="py-2 px-2">
                                            <div className="font-medium">{pay.name || "—"}</div>
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
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {data.map((item) => (
            <Card key={item._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      {item.month} {item.year}
                    </CardTitle>
                  </div>
                  <Badge variant="default">{item.inPercent}%</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Общая сумма:</span>
                    <span className="font-semibold">{formatNumber(item.totalAmount)} UZS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      По воде:
                    </span>
                    <span className="font-semibold">{formatNumber(item.totalSuv)} UZS</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handelAddClick(item._id)}
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none gap-2"
                  >
                    <CreditCard className="h-3 w-3" />
                    Добавить платеж
                  </Button>
                  <Button
                    onClick={() => handleElecClick(item._id)}
                    size="sm"
                    variant="ghost"
                    className="px-3"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => handleElecDeleteClick(item._id)}
                    size="sm"
                    variant="ghost"
                    className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Payments */}
                {item.paymentAmount.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Платежи:</h4>
                    {item.paymentAmount.map((pay) => (
                      <Card key={pay._id} className="bg-muted/20">
                        <CardContent className="p-3">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{pay.name || "Без названия"}</div>
                                <Badge variant="outline" className="font-mono mt-1">
                                  {formatNumber(pay.amount)} UZS
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => handleEditClick(item._id, pay._id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteClick(item._id, pay._id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {pay.images.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">Изображения:</div>
                                <div className="flex flex-wrap gap-2">
                                  {pay.images.map((img, idx) => (
                                    <div key={idx} className="relative">
                                      <img
                                        src={`${api}${img}`}
                                        alt="payment"
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer hover:shadow-lg"
                                        onClick={() => handleImageClick(pay.images, idx)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm italic py-4 border rounded-lg bg-muted/20">
                    Нет платежей
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
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
              <span className="hidden sm:inline">Назад</span>
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <span className="hidden sm:inline">Далее</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Модальные окна */}
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
          setSelectedSuvId(null);
        }}
        onSubmit={handleDocumentSubmit}
        documentId={selectedSuvId}
      />
      <DelConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedSuvId(null);
        }}
        documentId={selectedSuvId}
        onSuccess={handleDocumentSubmit}
        title="Удалить документ воды?"
        confirmText="Удалить"
      />
      <DelPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        suvId={selectedSuvId}
        paymentId={selectedPaymentId}
        onSuccess={handleDocumentSubmit}
      />
      <AddPaymentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        suvId={selectedSuvId}
        onSuccess={handleDocumentSubmit}
      />
      <EditPaymentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        suvId={selectedSuvId}
        paymentId={selectedPaymentId}
        onSuccess={handleDocumentSubmit}
      />
    </div>
  );
};

export default ClientTable;