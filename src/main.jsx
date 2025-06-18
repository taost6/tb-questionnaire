import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TbQuestionnaireWizard from "./TbQuestionnaireWizard";
import TbDialogueWizard from "./TbDialogueWizard";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/tb-questionnaire" element={<TbQuestionnaireWizard />} />
        <Route path="/tb-dialogue" element={<TbDialogueWizard />} />
        <Route path="*" element={<Navigate to="/tb-questionnaire" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
