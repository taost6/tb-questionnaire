import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./button";
import Select from "@/components/ui/select";

const POST_CODE_API_URL = "https://apis.postcode-jp.com/api/v6/postcodes";
const POSTAL_CODE_API_KEY = "FqVYXziF2zIfLYrghe1fP3UCpyeFY9VBDlmtcX9";

const drawChildren = (field, data, setData, inputError = {}) => {
  return field.children?.map((child) => {
    // child.conditional があればそれを優先、なければ conditionalValue との比較
    const ok = child.conditional ? child.conditional(data) : data[field.id] === child.conditionalValue;
    if (!ok) return null;
    return (
      <div key={child.id} className="ml-4">
        <Field field={child} data={data} setData={setData} error={inputError[child.id] ? true : false} />
      </div>
    );
  });
};

/** Field renderer **/
function Field({ field, data, setData, inputError = {}, error = false }) {
  if (field.conditional && !field.conditional(data)) return null;
  // const set = v => setData(d => ({ ...d, [field.id]: v }));
  const labelCls = "block mb-1 font-semibold";
  // const value = data[field.id] || field.default || "";
  field.id === "occupation" && console.log("inputError:", inputError);
  const getAddressByPostcode = async (postcode) => {
    try {
      const response = await fetch(`${POST_CODE_API_URL}/${postcode}`, {
        method: "GET",
        headers: {
          apikey: POSTAL_CODE_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const json = await response.json();
      if (json.length > 0) {
        setData((d) => ({
          ...d,
          addressPref: json[0].pref,
          addressCity: json[0].city,
          addressTown: json[0].town,
        }));
      }
    } catch (error) {
      console.error("Error fetching postcode data:", error);
      return null;
    }
  };

  const handlePostcodeChange = (e) => {
    const postcode = e.target.value;
    const postalCodeRegex = /^〒?\d{3}-?\d{4}$/;
    setData((d) => ({
      ...d,
      postalCode: postcode,
    }));
    if (postalCodeRegex.test(postcode)) {
      getAddressByPostcode(postcode.replace(/[^\d]/g, ""));
    }
  };

  switch (field.type) {
    case "text":
      return (
        <div className="mb-4">
          <Label className={`${labelCls} ${error && "text-red-500"}`} htmlFor={field.id}>
            {field.label}
          </Label>
          <div className="pl-4">
            <Input
              id={field.id}
              value={data[field.id] || ""}
              placeholder={field.placeholder || ""}
              onChange={(e) => setData((d) => ({ ...d, [field.id]: e.target.value }))}
              validationError={error}
            />
          </div>
          {/* ── ここから子フィールド描画 ── */}
          {drawChildren(field, data, setData, inputError)}
          {/* ── ここまで ── */}
        </div>
      );

    case "date":
      return (
        <div className="mb-4">
          <Label className={`${labelCls} ${error && "text-red-500"}`} htmlFor={field.id}>
            {field.label}
          </Label>
          <div className="pl-4">
            <Input
              id={field.id}
              type="date"
              value={data[field.id] || ""}
              validationError={error}
              onChange={(e) => setData((d) => ({ ...d, [field.id]: e.target.value }))}
            />
          </div>
        </div>
      );

    case "select":
      return (
        <div className="">
          <Label className={labelCls} htmlFor={field.id}>
            {field.label}
          </Label>
          <div className="pl-4 mb-4">
            <Select
              id={field.id}
              options={field.options}
              value={data[field.id] || field.default}
              onChange={(v) => setData((d) => ({ ...d, [field.id]: v }))}
            />
          </div>
          {/* ── ここから子フィールド描画 ── */}
          {drawChildren(field, data, setData, inputError)}
          {/* ── ここまで ── */}
        </div>
      );

    case "radio":
      return (
        <div className="mb-4">
          {/* 設問ラベル */}
          <Label htmlFor={field.id} className={`${labelCls} ${error && "text-red-500"}`}>
            {field.label}
          </Label>

          {/* ラジオ選択肢 */}
          <div className="space-y-1 ml-4">
            {field.options.map((opt) => {
              const selected = data[field.id] === opt.value;
              return (
                <div key={opt.value}>
                  {/* ラジオボタン本体 */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      checked={selected}
                      onChange={(e) => setData((d) => ({ ...d, [field.id]: e.target.value }))}
                    />
                    <span>{opt.label}</span>
                  </label>

                  {/* ここから子フィールド展開（選択中のみ） */}
                  {selected &&
                    field.children?.map((child) => {
                      // 子にconditional関数があればそれを評価、
                      // なければ conditionalValue との比較で判定
                      const ok = child.conditional ? child.conditional(data) : data[field.id] === child.conditionalValue;
                      if (!ok) return null;
                      return (
                        <div key={child.id} className="ml-8 mt-2">
                          <Field field={child} data={data} setData={setData} inputError={inputError} error={inputError[child.id] ? true : false} />
                        </div>
                      );
                    })}
                  {/* ここまで子フィールド展開 */}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "check":
      return (
        <>
          <div className="ml-4 mb-4 flex items-center space-x-2">
            <Checkbox id={field.id} checked={!!data[field.id]} onCheckedChange={(v) => setData((d) => ({ ...d, [field.id]: v }))} />
            <Label htmlFor={field.id} className="font-semibold">
              {field.label}
            </Label>
          </div>
          {/* ── ここから子フィールド描画 ── */}
          {drawChildren(field, data, setData, inputError)}
          {/* ── ここまで ── */}
        </>
      );

    case "checkbox":
      return (
        <div className="mb-4">
          <Label className={`${labelCls} ${error && "text-red-500"}`}>{field.label}</Label>
          <div className="ml-4">
            {field.options.map((opt) => {
              const checked = (data[field.id] || []).includes(opt.value);
              // ユニークな id を生成
              const inputId = `${field.id}-${opt.value}`;

              return (
                <div key={opt.value} className="mb-1">
                  {/* チェック＋ラベルだけを行内配置 */}
                  <div className="flex items-center">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={(v) => {
                        const arr = data[field.id] || [];
                        setData((d) => ({
                          ...d,
                          [field.id]: v ? [...arr, opt.value] : arr.filter((x) => x !== opt.value),
                        }));
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={inputId} className="select-none">
                      {opt.label}
                    </label>
                  </div>

                  {/* チェック時のみ、別行に ml-4 で字下げ */}
                  {checked &&
                    field.children?.map((child) => {
                      if (child.conditionalValue !== opt.value) return null;
                      if (!data[field.id]?.includes(child.conditionalValue) || (child.conditional && !child.conditional(data))) return null;

                      return (
                        <div key={child.id} className="ml-8">
                          <Field field={child} data={data} setData={setData} inputError={inputError} error={inputError[child.id] ? true : false} />
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "textarea":
      return (
        <div className="mb-4">
          <Label className={labelCls} htmlFor={field.id}>
            {field.label}
          </Label>
          <Textarea
            id={field.id}
            className="ml-4"
            value={data[field.id] || ""}
            onChange={(e) => setData((d) => ({ ...d, [field.id]: e.target.value }))}
          />
        </div>
      );

    case "note":
      return (
        <div className="mb-2 ml-4">
          <p className="text-sm text-gray-600">{field.label}</p>
        </div>
      );

    case "list":
      // data[field.id] は文字列の配列として管理します
      const list = data[field.id] || [""];
      const setList = (newList) => setData((d) => ({ ...d, [field.id]: newList }));
      return (
        <div className="mb-4">
          <Label className={labelCls}>{field.label}</Label>
          <div className="ml-4 space-y-2">
            {list.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Input
                  value={item}
                  placeholder={field.placeholder || ""}
                  onChange={(e) => {
                    const arr = [...list];
                    arr[idx] = e.target.value;
                    setList(arr);
                  }}
                />
                {/* 削除ボタン */}
                {list.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const arr = list.filter((_, i) => i !== idx);
                      setList(arr);
                    }}
                  >
                    削除
                  </Button>
                )}
              </div>
            ))}
            {/* 追加ボタン */}
            <div className="w-full flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setList([...list, ""])}>
                追加
              </Button>
            </div>
          </div>
        </div>
      );

    case "postcode":
      return (
        <div className="mb-4">
          <Label className={`${labelCls} ${error && "text-red-500"}`} htmlFor={field.id}>
            {field.label}
          </Label>
          <div className="pl-4">
            <Input
              id={field.id}
              value={data[field.id] || ""}
              placeholder={field.placeholder || ""}
              validationError={error}
              onChange={handlePostcodeChange}
            />
          </div>
          {/* ── ここから子フィールド描画 ── */}
          {drawChildren(field, data, setData, inputError)}
          {/* ── ここまで ── */}
        </div>
      );

    default:
      return null;
  }
}

export default Field;
