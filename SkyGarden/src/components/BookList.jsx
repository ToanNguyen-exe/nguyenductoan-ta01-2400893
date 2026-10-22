import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBooks, deleteBook } from '../services/bookService';
import { getAllCategories } from '../services/categoryService';
import { toast } from 'react-toastify';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search input state
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  // Active filter state (only updated on "Tìm kiếm" submit)
  const [filterCriteria, setFilterCriteria] = useState({
    title: '',
    categoryId: '',
  });

  // Sort order: default 'asc' (tăng dần theo Yêu cầu 1), hỗ trợ toggle 'desc' (giảm dần theo Barem)
  const [sortOrder, setSortOrder] = useState('asc');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([getAllBooks(), getAllCategories()])
      .then(([booksData, categoriesData]) => {
        if (!ignore) {
          setBooks(booksData);
          setCategories(categoriesData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error('Không thể tải dữ liệu từ server!');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const getCategory = (categoryId) => {
    return categories.find((cat) => String(cat.id) === String(categoryId));
  };

  const getCategoryBadgeClass = (categoryId) => {
    switch (String(categoryId)) {
      case '1':
        return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
      case '2':
        return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
      case '3':
        return 'bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25';
      case '4':
        return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
      case '5':
        return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
      case '6':
        return 'bg-info bg-opacity-10 text-primary border border-primary border-opacity-25';
      case '7':
        return 'bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilterCriteria({
      title: searchTitle.trim().toLowerCase(),
      categoryId: searchCategory,
    });
  };

  const handleResetSearch = () => {
    setSearchTitle('');
    setSearchCategory('');
    setFilterCriteria({
      title: '',
      categoryId: '',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteBook(deleteTarget.id);
      setBooks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success(`Đã xóa sách "${deleteTarget.title}" thành công!`);
      setDeleteTarget(null);
    } catch {
      toast.error('Xóa sách thất bại, vui lòng thử lại!');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort books
  const filteredBooks = books
    .filter((book) => {
      const matchTitle = filterCriteria.title
        ? (book.title || '').toLowerCase().includes(filterCriteria.title)
        : true;
      const matchCategory = filterCriteria.categoryId
        ? String(book.categoryId) === String(filterCriteria.categoryId)
        : true;
      return matchTitle && matchCategory;
    })
    .sort((a, b) => {
      const qA = Number(a.quantity) || 0;
      const qB = Number(b.quantity) || 0;
      return sortOrder === 'asc' ? qA - qB : qB - qA;
    });

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h4 className="card-title fw-bold text-dark mb-1">Danh Sách Sách Thư Viện</h4>
          <p className="text-muted small mb-0">Quản lý kho sách, chỉnh sửa và cập nhật số lượng tồn</p>
        </div>
        <Link to="/create" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
          </svg>
          <span>Thêm mới sách</span>
        </Link>
      </div>

      <div className="card-body p-4">
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="row g-3 mb-4 p-3 bg-light rounded-3 border">
          <div className="col-md-5">
            <label htmlFor="searchTitle" className="form-label fw-semibold text-secondary small">
              TÊN SÁCH (TÌM GẦN ĐÚNG)
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </span>
              <input
                id="searchTitle"
                type="text"
                className="form-control border-start-0"
                placeholder="Nhập tên sách..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <label htmlFor="searchCategory" className="form-label fw-semibold text-secondary small">
              THỂ LOẠI
            </label>
            <select
              id="searchCategory"
              className="form-select"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              <option value="">-- Tất cả thể loại --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3 d-flex align-items-end gap-2">
            <button type="submit" className="btn btn-primary flex-fill d-flex justify-content-center align-items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
              <span>Tìm kiếm</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleResetSearch}
              title="Đặt lại bộ lọc"
            >
              Đặt lại
            </button>
          </div>
        </form>

        {/* Toolbar: Count & Sort */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div className="text-muted small">
            Hiển thị: <strong>{filteredBooks.length}</strong> kết quả
            {filterCriteria.title && <span> &bull; Từ khóa: "{filterCriteria.title}"</span>}
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Sắp xếp theo số lượng:</span>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${sortOrder === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSortOrder('asc')}
              >
                ↑ Tăng dần
              </button>
              <button
                type="button"
                className={`btn ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSortOrder('desc')}
              >
                ↓ Giảm dần
              </button>
            </div>
          </div>
        </div>

        {/* State rendering */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 text-muted">Đang tải danh sách sách...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          /* Empty state: Replace table completely with text notification */
          <div className="empty-state-box text-center my-4">
            <div className="text-warning mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </div>
            <h5 className="text-danger fw-bold mb-2">Không có thông tin sách này</h5>
            <p className="text-muted small mb-3">
              Không tìm thấy quyển sách nào phù hợp với điều kiện tìm kiếm hiện tại.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleResetSearch}
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          /* Table of books */
          <div className="table-responsive rounded-3 border">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '50px' }}>STT</th>
                  <th style={{ width: '120px' }}>Mã sách</th>
                  <th>Tên sách</th>
                  <th style={{ width: '160px' }}>Thể loại</th>
                  <th className="text-center" style={{ width: '120px' }}>Ngày nhập</th>
                  <th className="text-center" style={{ width: '100px' }}>Số lượng</th>
                  <th className="text-center" style={{ width: '100px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => {
                  const category = getCategory(book.categoryId);
                  return (
                    <tr key={book.id || index}>
                      <td className="text-center text-muted fw-semibold">{index + 1}</td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace px-2 py-1">
                          {book.code}
                        </span>
                      </td>
                      <td className="fw-semibold text-dark">{book.title}</td>
                      <td>
                        <span className={`badge badge-category ${getCategoryBadgeClass(book.categoryId)}`}>
                          {category ? category.name : 'Chưa phân loại'}
                        </span>
                      </td>
                      <td className="text-center text-secondary">{formatDate(book.importDate)}</td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border px-3 py-1 fw-bold">
                          {book.quantity}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Link
                            to={`/edit/${book.id}`}
                            className="btn btn-sm btn-outline-warning text-dark btn-icon"
                            title="Sửa thông tin sách"
                            aria-label="Sửa thông tin sách"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger btn-icon"
                            onClick={() => setDeleteTarget(book)}
                            title="Xóa sách"
                            aria-label="Xóa sách"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete */}
      {deleteTarget && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 rounded-3">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                  </svg>
                  Xác nhận xóa sách
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => !deleting && setDeleteTarget(null)}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">Bạn có chắc chắn muốn xóa quyển sách này không?</p>
                <div className="p-3 bg-light rounded border">
                  <div><strong>Mã sách:</strong> <span className="font-monospace text-primary">{deleteTarget.code}</span></div>
                  <div><strong>Tên sách:</strong> {deleteTarget.title}</div>
                  <div><strong>Số lượng:</strong> {deleteTarget.quantity}</div>
                </div>
                <div className="text-danger small mt-2">
                  * Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống (db.json) và không thể khôi phục.
                </div>
              </div>
              <div className="modal-footer bg-light border-top">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <span>Xác nhận xóa</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;
