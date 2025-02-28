import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import GamePage from "../pages/GamePage";
import HistoryPage from "../pages/HistoryPage";
import NotFoundPage from "../pages/NotFoundPage";
import DuelGamePage from "../pages/DuelGamePage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Routes with DefaultLayout */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/duel" element={<DuelGamePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
        {/* Routes without layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
