import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import GamePage from "../pages/GamePage";
import HistoryPage from "../pages/HistoryPage";
import SettingPage from "../pages/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Routes with DefaultLayout */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/setting" element={<SettingPage />} />
        </Route>

        {/* Routes with AuthLayout */}
        <Route element={<AuthLayout />}>

        </Route>

        {/* Routes without layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
