import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import SectionPage from "./pages/SectionPage";
import SearchPage from "./pages/SearchPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import SupportPage from "./pages/SupportPage";
import SupportCompletePage from "./pages/SupportCompletePage";
import SupportPortOneReturnPage from "./pages/SupportPortOneReturnPage";
import MyPage from "./pages/MyPage";
import AdminReviewListPage from "./pages/admin/AdminReviewListPage";
import AdminArticleFormPage from "./pages/admin/AdminArticleFormPage";
import PolicyPage from "./pages/PolicyPage";
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/section/:sectionId" element={<SectionPage />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/complete"
          element={
            <ProtectedRoute>
              <SupportCompletePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/portone-return"
          element={
            <ProtectedRoute>
              <SupportPortOneReturnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute requireAdmin>
              <AdminReviewListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles/:id"
          element={
            <ProtectedRoute requireAdmin>
              <AdminArticleFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="/policy/:type" element={<PolicyPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
