import { Routes, Route, Link } from 'react-router-dom';
import BookList from './components/BookList';
import BookCreate from './components/BookCreate';
import BookEdit from './components/BookEdit';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navigation Header */}
      <nav className="navbar navbar-dark bg-primary shadow-sm py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
            </svg>
            <span className="fw-bold fs-5">SkyGarden Library</span>
          </Link>
          <span className="navbar-text text-white-50 small d-none d-sm-inline">
            Module 5 &bull; Quản lý sách thư viện
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container my-4 flex-grow-1">
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/create" element={<BookCreate />} />
          <Route path="/edit/:id" element={<BookEdit />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          Hệ thống Quản lý Sách Thư viện SkyGarden &bull; Module 5 Front-end with ReactJS
        </div>
      </footer>
    </div>
  );
}

export default App;
