import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { getBookById, updateBook } from '../services/bookService';
import { getAllCategories } from '../services/categoryService';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required('Mã sách không được để trống')
    .matches(/^BO\s*[-–]\s*\d{4}$/i, 'Mã sách phải đúng định dạng BO-XXXX (với X là các số)'),
  title: Yup.string()
    .required('Tên sách không được để trống')
    .max(100, 'Tên sách không dài quá 100 ký tự'),
  categoryId: Yup.string().required('Vui lòng chọn thể loại sách'),
  importDate: Yup.string()
    .required('Ngày nhập sách không được để trống')
    .test('not-in-future', 'Ngày nhập sách không được lớn hơn ngày hiện tại', (val) => {
      if (!val) return false;
      return val <= getTodayString();
    }),
  quantity: Yup.number()
    .typeError('Số lượng sách phải là một số')
    .required('Số lượng sách không được để trống')
    .integer('Số lượng sách phải là số nguyên')
    .min(1, 'Số lượng sách phải là số nguyên lớn hơn 0'),
});

const BookEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.all([getBookById(id), getAllCategories()])
      .then(([bookData, categoriesData]) => {
        if (!ignore) {
          setCategories(categoriesData);
          setInitialValues({
            code: bookData.code || '',
            title: bookData.title || '',
            categoryId: String(bookData.categoryId || ''),
            importDate: bookData.importDate || '',
            quantity: bookData.quantity || '',
          });
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error('Không tìm thấy thông tin sách!');
          setLoading(false);
          navigate('/');
        }
      });
    return () => {
      ignore = true;
    };
  }, [id, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        code: values.code.trim(),
        title: values.title.trim(),
        categoryId: String(values.categoryId),
        importDate: values.importDate,
        quantity: parseInt(values.quantity, 10),
      };

      await updateBook(id, payload);
      toast.success('Cập nhật thông tin sách thành công!');
      navigate('/');
    } catch {
      toast.error('Cập nhật thất bại, vui lòng kiểm tra lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải thông tin sách...</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8 col-xl-7">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="card-title fw-bold text-dark mb-1">Chỉnh Sửa Thông Tin Sách</h4>
              <p className="text-muted small mb-0">Cập nhật thông tin chi tiết cho mã sách {initialValues.code}</p>
            </div>
            <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
              <span>Quay lại</span>
            </Link>
          </div>

          <div className="card-body p-4">
            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form>
                  {/* Mã sách */}
                  <div className="mb-3">
                    <label htmlFor="code" className="form-label fw-semibold text-secondary small">
                      MÃ SÁCH <span className="text-danger">*</span>
                    </label>
                    <Field
                      id="code"
                      name="code"
                      type="text"
                      placeholder="Ví dụ: BO-0001"
                      className={`form-control font-monospace ${
                        touched.code && errors.code ? 'is-invalid' : ''
                      }`}
                    />
                    <ErrorMessage name="code" component="div" className="invalid-feedback fw-semibold" />
                    <div className="form-text text-muted small">Định dạng chuẩn: BO-XXXX (với X là các chữ số)</div>
                  </div>

                  {/* Tên sách */}
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label fw-semibold text-secondary small">
                      TÊN SÁCH <span className="text-danger">*</span>
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      maxLength={100}
                      placeholder="Nhập tên tác phẩm / sách..."
                      className={`form-control ${
                        touched.title && errors.title ? 'is-invalid' : ''
                      }`}
                    />
                    <ErrorMessage name="title" component="div" className="invalid-feedback fw-semibold" />
                    <div className="form-text text-muted small">Tối đa không quá 100 ký tự</div>
                  </div>

                  {/* Thể loại */}
                  <div className="mb-3">
                    <label htmlFor="categoryId" className="form-label fw-semibold text-secondary small">
                      THỂ LOẠI SÁCH <span className="text-danger">*</span>
                    </label>
                    <Field
                      as="select"
                      id="categoryId"
                      name="categoryId"
                      className={`form-select ${
                        touched.categoryId && errors.categoryId ? 'is-invalid' : ''
                      }`}
                    >
                      <option value="">-- Chọn thể loại từ danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.description || cat.code})
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="categoryId" component="div" className="invalid-feedback fw-semibold" />
                  </div>

                  {/* Ngày nhập sách */}
                  <div className="mb-3">
                    <label htmlFor="importDate" className="form-label fw-semibold text-secondary small">
                      NGÀY NHẬP SÁCH <span className="text-danger">*</span>
                    </label>
                    <Field
                      id="importDate"
                      name="importDate"
                      type="date"
                      max={getTodayString()}
                      className={`form-control ${
                        touched.importDate && errors.importDate ? 'is-invalid' : ''
                      }`}
                    />
                    <ErrorMessage name="importDate" component="div" className="invalid-feedback fw-semibold" />
                    <div className="form-text text-muted small">Ngày nhập không được lớn hơn ngày hiện tại</div>
                  </div>

                  {/* Số lượng */}
                  <div className="mb-4">
                    <label htmlFor="quantity" className="form-label fw-semibold text-secondary small">
                      SỐ LƯỢNG <span className="text-danger">*</span>
                    </label>
                    <Field
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="Nhập số lượng sách..."
                      className={`form-control ${
                        touched.quantity && errors.quantity ? 'is-invalid' : ''
                      }`}
                    />
                    <ErrorMessage name="quantity" component="div" className="invalid-feedback fw-semibold" />
                    <div className="form-text text-muted small">Số lượng phải là số nguyên dương lớn hơn 0</div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <Link to="/" className="btn btn-light px-3">
                      Hủy bỏ
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-warning px-4 d-flex align-items-center gap-2 shadow-sm text-dark fw-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                          </svg>
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookEdit;
