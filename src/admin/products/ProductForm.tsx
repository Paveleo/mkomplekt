import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import styles from '../admin.module.css';

type FormValues = {
  title: string;
  sku?: string;
  category_id: string;
  price?: number | string;
  thickness?: number | string;
  color?: string;
  material?: string;
  description?: string;
  is_published?: boolean;
};

type CategoryOption = {
  id: string;
  title: string;
};

type ProductImage = {
  id: string;
  url: string;
  sort: number;
};

type ProductResponse = {
  id: string;
  title: string;
  sku?: string | null;
  category_id: string;
  price?: number | null;
  thickness?: number | null;
  color?: string | null;
  material?: string | null;
  description?: string | null;
  is_published?: boolean;
  images?: ProductImage[];
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      const categoriesResponse = await apiRequest<CategoryOption[]>('/api/admin/categories/options');
      if (!active) {
        return;
      }

      setCategories(categoriesResponse || []);

      if (!id) {
        setValue('is_published', true as never);
        return;
      }

      const product = await apiRequest<ProductResponse>(`/api/admin/products/${id}`);
      if (!active || !product) {
        return;
      }

      setValue('title', product.title as never);
      setValue('sku', (product.sku || '') as never);
      setValue('category_id', product.category_id as never);
      setValue('price', (product.price ?? '') as never);
      setValue('thickness', (product.thickness ?? '') as never);
      setValue('color', (product.color || '') as never);
      setValue('material', (product.material || '') as never);
      setValue('description', (product.description || '') as never);
      setValue('is_published', Boolean(product.is_published) as never);
      setExistingImages(product.images || []);
    };

    load().catch((requestError) => {
      if (!active) {
        return;
      }
      setError((requestError as Error).message || 'Не удалось загрузить форму товара.');
    });

    return () => {
      active = false;
    };
  }, [id, setValue]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const title = watch('title') || '';
  const categoryId = watch('category_id') || '';
  const price = watch('price');
  const thickness = watch('thickness');
  const color = watch('color') || '';
  const material = watch('material') || '';
  const isPublished = Boolean(watch('is_published'));

  const syncPreviewUrls = (files: File[]) => {
    setPreviewUrls((current) => {
      current.forEach((url) => URL.revokeObjectURL(url));
      return files.map((file) => URL.createObjectURL(file));
    });
  };

  const handleFilesSelected = (files: FileList | null | undefined) => {
    const nextFiles = files ? Array.from(files) : [];
    if (nextFiles.length === 0) {
      return;
    }

    setSelectedFiles((current) => {
      const mergedFiles = [...current, ...nextFiles];
      syncPreviewUrls(mergedFiles);
      return mergedFiles;
    });

    setFileInputKey((current) => current + 1);
  };

  const removeSelectedFile = (fileIndex: number) => {
    setSelectedFiles((current) => {
      const nextFiles = current.filter((_, index) => index !== fileIndex);
      syncPreviewUrls(nextFiles);
      return nextFiles;
    });
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages((current) => current.filter((image) => image.id !== imageId));
  };

  const onSubmit = async (values: FormValues) => {
    setError('');
    setNotice('');

    if (!values.category_id) {
      setError('Выберите категорию товара.');
      return;
    }

    try {
      const formData = new FormData();
      formData.set('title', values.title);
      formData.set('sku', values.sku || '');
      formData.set('category_id', values.category_id);
      formData.set('price', values.price === '' || values.price === undefined ? '' : String(values.price));
      formData.set('thickness', values.thickness === '' || values.thickness === undefined ? '' : String(values.thickness));
      formData.set('color', values.color || '');
      formData.set('material', values.material || '');
      formData.set('description', values.description || '');
      formData.set('is_published', values.is_published ? 'true' : 'false');

      existingImages.forEach((image) => {
        formData.append('keep_image_ids', image.id);
      });

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (id) {
        await apiRequest(`/api/admin/products/${id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await apiRequest('/api/admin/products', {
          method: 'POST',
          body: formData,
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products-admin'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
      ]);

      setNotice(id ? 'Карточка товара обновлена.' : 'Товар добавлен в каталог.');
      navigate('/admin/products');
    } catch (requestError: any) {
      setError(requestError?.message ?? 'Не удалось сохранить товар.');
    }
  };

  const activeCategory = categories.find((item) => item.id === categoryId)?.title;
  const galleryCount = existingImages.length + selectedFiles.length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Карточка товара</p>
          <h1 className={styles.title}>{id ? 'Редактирование товара' : 'Новый товар'}</h1>
          <p className={styles.subtitle}>
            Заполните основную информацию, загрузите несколько фотографий и при необходимости
            оставьте только те изображения, которые должны остаться в галерее товара.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.buttonGhost} onClick={() => navigate('/admin/products')}>
            Назад к списку
          </button>
        </div>
      </div>

      {error ? <div className={styles.errorNotice}>{error}</div> : null}
      {notice ? <div className={styles.successNotice}>{notice}</div> : null}

      <div className={styles.contentSplit}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formStack}>
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Основа</h2>
            <p className={styles.sectionDescription}>
              Название, категория и артикул формируют понятную карточку для каталога и поиска.
            </p>

            <div className={styles.formGrid}>
              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>Название</span>
                <input
                  className={styles.input}
                  placeholder="Например: Столешница дуб натуральный"
                  {...register('title', { required: true })}
                />
                <span className={styles.fieldHint}>Понятное название для каталога и карточки товара.</span>
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>SKU</span>
                <input
                  className={styles.input}
                  placeholder="Артикул или внутренний код"
                  {...register('sku')}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Категория</span>
                <select className={styles.select} {...register('category_id', { required: true })}>
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Характеристики</h2>
            <p className={styles.sectionDescription}>
              Эти поля можно заполнять по мере готовности карточки. Пустые значения не помешают сохранению.
            </p>

            <div className={styles.formGridCompact}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Цена</span>
                <input
                  className={styles.input}
                  type="number"
                  step="0.01"
                  placeholder="Например: 2590"
                  {...register('price')}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Толщина</span>
                <input
                  className={styles.input}
                  type="number"
                  step="0.1"
                  placeholder="Например: 38"
                  {...register('thickness')}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Цвет</span>
                <input
                  className={styles.input}
                  placeholder="Белый, графит, дуб"
                  {...register('color')}
                />
              </label>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>Материал</span>
                <input
                  className={styles.input}
                  placeholder="ЛДСП, МДФ, пластик, металл"
                  {...register('material')}
                />
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <p className={styles.sectionDescription}>
              Кратко опишите назначение, преимущества, размеры или особенности товара.
            </p>

            <label className={styles.fieldWide}>
              <span className={styles.fieldLabel}>Текст карточки</span>
              <textarea
                className={styles.textarea}
                placeholder="Например: Влагостойкая столешница для кухни, подходит для..."
                {...register('description')}
              />
            </label>
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Галерея товара</h2>
            <p className={styles.sectionDescription}>
              Можно загрузить сразу несколько фото. При редактировании старые изображения можно
              оставить частично, удалить или дополнить новыми.
            </p>

            <div className={styles.dropzone}>
              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>Новые фотографии</span>
                <input
                  key={fileInputKey}
                  ref={fileInputRef}
                  className={styles.input}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => handleFilesSelected(event.target.files)}
                />
                <span className={styles.fieldHint}>
                  Можно выбрать несколько файлов сразу, а потом ещё раз нажать выбор и добавить следующую пачку.
                </span>
              </label>

              {selectedFiles.length > 0 ? (
                <div className={styles.inlineNotice}>
                  Новых файлов выбрано: <strong>{selectedFiles.length}</strong>
                </div>
              ) : null}
            </div>

            {existingImages.length > 0 ? (
              <div className={styles.formStack}>
                <div className={styles.inlineNotice}>
                  Текущих изображений: <strong>{existingImages.length}</strong>
                </div>

                <div className={styles.previewGrid}>
                  {existingImages.map((image, index) => (
                    <div key={image.id} className={styles.previewCard}>
                      <img className={styles.previewImage} src={image.url} alt={`existing-${index + 1}`} />
                      <div className={styles.previewInfo}>Текущее фото #{index + 1}</div>
                      <div style={{ padding: '0 12px 12px' }}>
                        <button
                          type="button"
                          className={styles.buttonDanger}
                          onClick={() => removeExistingImage(image.id)}
                        >
                          Удалить из галереи
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {previewUrls.length > 0 ? (
              <div className={styles.formStack}>
                <div className={styles.inlineNotice}>
                  К добавлению подготовлено: <strong>{previewUrls.length}</strong>
                </div>

                <div className={styles.previewGrid}>
                  {previewUrls.map((url, index) => (
                    <div key={url} className={styles.previewCard}>
                      <img className={styles.previewImage} src={url} alt={`preview-${index + 1}`} />
                      <div className={styles.previewInfo}>{selectedFiles[index]?.name || `Файл ${index + 1}`}</div>
                      <div style={{ padding: '0 12px 12px' }}>
                        <button
                          type="button"
                          className={styles.buttonGhost}
                          onClick={() => removeSelectedFile(index)}
                        >
                          Убрать из загрузки
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Публикация</h2>
            <div className={styles.switchRow}>
              <input type="checkbox" {...register('is_published')} />
              <div className={styles.switchLabel}>
                <span className={styles.switchTitle}>Показывать товар на сайте</span>
                <span className={styles.switchText}>
                  Если выключить, карточка останется в админке, но не будет видна в каталоге.
                </span>
              </div>
            </div>
          </section>

          <div className={styles.actions}>
            <button className={styles.buttonPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняю...' : id ? 'Сохранить изменения' : 'Создать товар'}
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => navigate('/admin/products')}
              disabled={isSubmitting}
            >
              Отмена
            </button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <div className={styles.summaryPreview}>
            <p className={styles.eyebrow}>Предпросмотр</p>
            <h2 className={styles.summaryTitle}>{title || 'Название пока не заполнено'}</h2>
            <p className={styles.summaryText}>{activeCategory || 'Категория не выбрана'}</p>

            <div className={styles.summaryMeta}>
              {price ? <span className={styles.pill}>{price} ₽</span> : <span className={styles.pillMuted}>Цена не указана</span>}
              {thickness ? <span className={styles.pill}>{thickness} мм</span> : null}
              {color ? <span className={styles.pillMuted}>{color}</span> : null}
              {material ? <span className={styles.pillMuted}>{material}</span> : null}
              <span className={isPublished ? styles.statusCompleted : styles.statusCancelled}>
                {isPublished ? 'Опубликован' : 'Скрыт'}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Статус карточки</h3>
                <p className={styles.cardText}>Короткая сводка перед сохранением.</p>
              </div>
            </div>

            <div className={styles.formStack}>
              <div className={styles.inlineNotice}>
                Фото в галерее после сохранения: <strong>{galleryCount}</strong>
              </div>
              <div className={styles.inlineNotice}>
                Категория: <strong>{activeCategory || 'не выбрана'}</strong>
              </div>
              <div className={styles.inlineNotice}>
                Публикация: <strong>{isPublished ? 'включена' : 'выключена'}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
