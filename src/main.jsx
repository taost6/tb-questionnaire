import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TbQuestionnaireWizard from "./TbQuestionnaireWizard";
import TbDialogueWizard from "./TbDialogueWizard";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/tb-questionnaire">
      <Routes>
        <Route path="/questionnaire" element={<TbQuestionnaireWizard />} />
        <Route path="/dialogue" element={<TbDialogueWizard />} />
        <Route path="*" element={<Navigate to="/questionnaire" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
