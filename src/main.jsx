import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TbQuestionnaireWizard from "./TbQuestionnaireWizard";
import TbDialogueWizard from "./TbDialogueWizard";
import { Routes, Route, Navigate, HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/tb-questionnaire" element={<TbQuestionnaireWizard />} />
        <Route path="/tb-dialogue" element={<TbDialogueWizard />} />
        <Route path="*" element={<Navigate to="/tb-questionnaire" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
