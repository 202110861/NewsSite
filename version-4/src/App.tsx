import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import SectionPage from "./pages/SectionPage";
import SearchPage from "./pages/SearchPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SupportPage from "./pages/SupportPage";
import SupportCompletePage from "./pages/SupportCompletePage";

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
      </Routes>
    </Layout>
  );
}

export default App;
