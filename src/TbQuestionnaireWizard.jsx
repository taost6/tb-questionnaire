import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Field from "./components/ui/field";
import { motion } from "framer-motion";
import sections from "./consts/sections";
import patientReasons from "./consts/patientReasons";
import { CloudCog } from "lucide-react";

export default function TbQuestionnaireWizard() {
  const [showOptions, setShowOptions] = useState({
    hide: {},
    noRequire: {},
    mode: "normal",
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const parsedParams = {
      hide: {},
      noRequire: {},
      mode: "normal",
    };
    for (const [key, value] of searchParams.entries()) {
      if (key === "options") {
        value
          .split(",")
          .map((v) => v.trim())
          .forEach((k) => {
            if (k == "") return;
            if (k === "noaddr") {
              parsedParams.hide["postalCode"] = true;
              parsedParams.hide["addressPrefCity"] = true;
              parsedParams.hide["addressTown"] = true;
            } else if (k === "nobirthd") {
              parsedParams.hide["birthDate"] = true;
            } else if (k === "patients") {
              parsedParams.mode = "patients";
            } else if (k === "contacts") {
              parsedParams.mode = "contacts";
            }
          });
      }
    }
    setShowOptions(parsedParams);
  }, []);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    language: "日本語",
    nationality: "japan",
    age: "20",
    householdContactsList: [""],
    workSchoolContactsList: [""],
    otherRegularContactsList: [""],
  });
  const [inputError, setInputError] = useState({});
  const [validationError, setValidationError] = useState({});
  const [showData, setShowData] = useState(false);

  const validateFields = (fields, parentId = "root") => {
    let isValid = true;
    let newInputError = {};
    let newValidationError = {};
    let hasInputError = false;

    const validate = (fieldList, parentKey) => {
      fieldList.forEach((f) => {
        if ((f.conditional && !f.conditional(formData)) || (f.conditionalValue && f.conditionalValue !== formData[parentKey])) {
          return;
        }
        if (showOptions.hide[f.id]) return;
        const value = formData[f.id];
        if (!showOptions.noRequire[f.id] && f.required) {
          if (value == null || value === "") {
            newInputError[f.id] = true;
            isValid = false;
            hasInputError = true;
          } else {
            newInputError[f.id] = false;
          }
        }

        if (f.id === "phone" && value && value !== "") {
          const jpPhoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/;
          if (!jpPhoneRegex.test(value)) {
            isValid = false;
            newInputError[f.id] = false;
            newValidationError[f.id] = true;
          } else {
            newValidationError[f.id] = false;
          }
        }

        // Email validation
        if (f.id === "email" && value && value !== "") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            newInputError[f.id] = false;
            newValidationError[f.id] = true;
          } else {
            newValidationError[f.id] = false;
          }
        }

        if (f.children) {
          validate(f.children, f.id);
        }
      });
    };

    validate(fields, parentId);

    setInputError(newInputError);
    setValidationError(newValidationError);
    return [isValid, hasInputError, newValidationError];
  };

  const handleNext = () => {
    // setPage(p => p + 1);
    window.scrollTo(0, 0);
    let isValid, hasInputError, vError;
    [isValid, hasInputError, vError] = validateFields(sections[step].fields);
    if (!isValid) {
      if (hasInputError) {
        alert("赤字の設問は必ず入力して下さい");
      }
      if (step === 0 && vError.email) {
        alert("メールアドレスの形式が不正です");
      } else if (step === 1 && vError.phone) {
        alert("電話番号の形式が不正です");
      } else {
      }
      return;
    }
    setStep((s) => Math.min(s + 1, sections.length - 1));
  };

  const handleSubmit = () => {
    // 送信処理
    document.getElementById("formData").style.display = "block";
    location.href = "/#/tb-dialogue";
    setShowData(true);
  };

  const cur = sections[step];
  const progress = ((step + 1) / sections.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">結核問診票 / Tuberculosis Questionnaire</h1>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
        <Card className="shadow">
          <CardContent className="p-6">
            {cur.id === "health" ? (
              <h2 className="text-xl font-semibold mb-4">
                {cur.title} ({patientReasons.includes(formData.requestReason) ? "患者" : "接触者"})
              </h2>
            ) : (
              <h2 className="text-xl font-semibold mb-4">{cur.title}</h2>
            )}

            {cur.fields.map(
              (f) =>
                !showOptions.hide[f.id] && (
                  <Field
                    key={f.id}
                    field={f}
                    data={formData}
                    setData={setFormData}
                    inputError={inputError}
                    validationError={validationError}
                    error={inputError[f.id] ? true : false}
                    showOptions={showOptions}
                  />
                )
            )}
          </CardContent>
        </Card>
      </motion.div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
          戻る
        </Button>
        {step < sections.length - 1 ? <Button onClick={handleNext}>次へ</Button> : <Button onClick={handleSubmit}>提出</Button>}
      </div>
      <pre
        className="mt-6 text-xs bg-gray-100 p-2 rounded leading-tight overflow-x-auto"
        id="formData"
        style={{ display: "none", background: "#f7f7f7", padding: "1em" }}
      >
        <code>{JSON.stringify(formData, null, 2)}</code>
      </pre>
    </div>
  );
}
