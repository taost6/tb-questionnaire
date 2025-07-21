import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TbQuestionnaireWizard from "./TbQuestionnaireWizard";
import TbDialogueWizard from "./TbDialogueWizard";
import TbAdminWizard from "./TbAdminWizard";
import TbAdminLoginWizard from "./TbAdminLoginWizard";

import { Routes, Route, Navigate, HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <HashRouter>
    <Routes>
      <Route path="/questionnaire" element={<TbQuestionnaireWizard />} />
      <Route path="/dialogue" element={<TbDialogueWizard />} />
      <Route path="/admin" element={<TbAdminWizard />} />
      <Route path="/login" element={<TbAdminLoginWizard />} />
      <Route path="*" element={<Navigate to="/questionnaire" replace />} />
    </Routes>
  </HashRouter>
  // </React.StrictMode>
);
