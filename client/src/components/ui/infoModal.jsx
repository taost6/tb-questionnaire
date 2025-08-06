import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { exportExcel, exportJson, exportPdf, addString, getString, calculateAge, formatJapaneseDate } from "@/helper";
import patientReasons, { patientReasonsHospital } from "@/consts/patientReasons";
import { symptomCondition } from "@/consts/symptomCondition";

const InfoModal = ({ selectedUser, handleCloseModal }) => {
    if (!selectedUser) return null;

    const selectedContent = selectedUser.content || {};

    const getNationalityLabel = (value) => {
        const nationalityOptions = [
            { value: "japan", label: "日本国籍" },
            { value: "foreigner", label: "外国籍" },
            { value: "other", label: "その他・分からない" },
        ];
        const found = nationalityOptions.find(opt => opt.value === value);
        return found ? found.label : value || "";
    };

    const getNationalityDisplay = (content) => {
        if (content.nationality === "foreigner") {
            return content.nationalityDetail || "";
        }
        return getNationalityLabel(content.nationality);
    };

    const getJpLevelLabel = (value) => {
        // 日本語能力ラベル取得
        const jpLevelOptions = [
            { label: "流暢に話せる", value: "4" },
            { label: "簡単な会話ができる", value: "3" },
            { label: "簡単な単語やフレーズだけわかる", value: "2" },
            { label: "まったくわからない", value: "1" },
            { label: "その他・分からない", value: "-1" },
        ];
        const found = jpLevelOptions.find(opt => opt.value === String(value));
        return found ? found.label : value || "";
    };

    const getOccupationLabel = (value) => {
        // 職業区分ラベル取得
        const occupationOptions = [
            { value: "infant", label: "乳幼児" },
            { value: "schoolChild", label: "小中学生等学童" },
            { value: "highStudent", label: "高校生以上の生徒学生等" },
            { value: "worker", label: "勤労者" },
            { value: "trainee", label: "技能実習生" },
            { value: "houseWork", label: "家事従事者" },
            { value: "unemployed", label: "無職" },
            { value: "otherOcc", label: "その他・分からない" },
        ];
        const found = occupationOptions.find(opt => opt.value === value);
        return found ? found.label : value || "";
    };

    // 職業区分詳細ラベル取得
    const getOccupationDetailLabel = (content) => {
        switch (content.occupation) {
            case "infant":
                return "通園先名称";
            case "schoolChild":
            case "highStudent":
                return "通学先名称";
            case "worker":
                if (["company", "teacher", "service", "medical"].includes(content.placeWorkType)) {
                    return "勤務先名称";
                }
                if (content.placeWorkType === "self") return "";
                if (content.placeWorkType === "otherWorker") return "職種";
                return "";
            case "trainee":
                return "技能実習先施設";
            case "otherOcc":
                return "説明";
            default:
                return "";
        }
    };

    const getOccupationDetailData = (content) => {
        switch (content.occupation) {
            case "infant":
                return content.placeNurseryName || "";
            case "schoolChild":
            case "highStudent":
                return content.placeSchoolName || "";
            case "worker":
                if (["company", "teacher", "service", "medical"].includes(content.placeWorkType)) {
                    return content.placeWorkerName || "";
                }
                if (content.placeWorkType === "self") return "自営業、自由業";
                if (content.placeWorkType === "otherWorker") return content.placeWorkerCategory || "";
                return "";
            case "trainee":
                return content.placeTrainName || "";
            case "otherOcc":
                return content.otherOccNote || "";
            default:
                return "";
        }
    }

    const getRequestReason = (content) => {
        const options = [
            { value: "diagnosed", label: "医療機関にて結核の診断を受けた", mode: "patients" },
            { value: "possible", label: "医療機関にて結核の可能性を指摘された", mode: "patients" },
            { value: "investigation", label: "結核患者の濃厚接触者として調査を受けた", mode: "contacts" },
            { value: "contactPossible", label: "結核患者との接触の可能性を指摘された", mode: "contacts" },
            { value: "healthCheck", label: "健康診断で異常を指摘された", mode: "patients" },
            { value: "unknown", label: "よく分からない", mode: "contacts" },
        ];
        const found = options.find(opt => opt.value === content.requestReason);
        let result = found ? found.label : content.requestReason || "";
        if (!found) return result;
        if (content.requestReason === "investigation") {
            const relationOptions = [
                { value: "living", label: "同居している" },
                { value: "work", label: "職場等で日常的に接している" },
                { value: "unknownRelation", label: "分からない" },
                { value: "otherRelation", label: "その他" },
            ];
            const relationFound = relationOptions.find(opt => opt.value === content.contactRelation);
            if (relationFound) {
                result = addString(result, `患者との関係: ${relationFound.label}`);
                if (["living", "work"].includes(content.contactRelation)) {
                    result = addString(result, `患者の名前: ${content.contactPatientName}`);
                }
                if (["work", "unknownRelation"].includes(content.contactRelation)) {
                    result = addString(result, `接触期間・状況: ${content.contactDuration}`)
                }
                if (content.contactRelation === "otherRelation") {
                    result = addString(result, `その他: ${content.contactRelationOther}`)
                }
            }
        }

        if (content.requestReason === "healthCheck") {
            if (content.checkupType) result = addString(result, `健康診断の種類: ${content.checkupType}`);
            if (content.checkupDate) result = addString(result, `検診日: ${formatJapaneseDate(content.checkupDate)}`);
        }
        return result;
    }

    const getHealthStatus = (content) => {
        const healthOptions = [
            { value: "healthy", label: "健康 (定期的な通院等なし)" },
            { value: "underTreat", label: "症状あり (未通院)" },
            { value: "underHospital", label: "通院中" },
            { value: "other", label: "その他・分からない" },
        ];
        const found = healthOptions.find(opt => opt.value === content.healthStatus);
        return found ? found.label : "";
    }

    const getHealthStatusDetail = (content) => {
        if (content.healthStatus === "other") {
            return content.otherHealthStatus || "";
        }
        let result = "";

        if (content.healthStatus === "underTreat" || content.healthStatus === "underHospital") {
            const sinceOptions = [
                { value: "none", label: "特にない" },
                { value: "since-1w", label: "1～2週間前から" },
                { value: "since-2w", label: "2～3週間前から" },
                { value: "since-mt1m", label: "1ヶ月以上前から" },
                { value: "other", label: "その他・分からない" },
            ];
            const found = sinceOptions.find(opt => opt.value === content.symptomSince);
            if (found) {
                result = addString(result, `呼吸器系の症状（せき・たん など）: ${found.label}`);
                if (content.symptomSince === "since-mt1m") {
                    result += `、症状が始まった時期: ${getString(content.symptomSinceDetailed)}`;
                }
            }
            else {
                result = addString(result, "呼吸器系の症状（せき・たん など）: ");
            }
        }

        if (content.healthStatus === "underTreat") {
            const options = [
                { value: "yes", label: "はい" },
                { value: "no", label: "いいえ" },
                { value: "unknown", label: "分からない" },
            ];
            const found = options.find(opt => opt.value === content.nonPatientTreated);
            result = addString(result, `せき・たんに関する検査や治療の有無: ${found ? found.label : ""}`);
        }

        if (content.healthStatus === "underTreat") {
            const historyOptions = [
                { value: "tb", label: "結核" },
                { value: "asthma", label: "喘息" },
                { value: "infiltration", label: "肺浸潤" },
                { value: "pleuritis", label: "胸膜炎" },
                { value: "peritonitis", label: "肋膜炎" },
                { value: "lymph", label: "頚部リンパ節結核等" },
                { value: "other", label: "その他", inputs: ["otherRespiratory"] },
            ];
            const historyFound = historyOptions.find(opt => opt.value === content.respiratoryHistory);
            result = addString(result, `過去の呼吸器系の病歴: ${historyFound ? historyFound.label : ""}`);
            if (historyFound) {
                if (content.respiratoryHistory === "other" && content.otherRespiratory) {
                    result = addString(result, `${content.otherRespiratory}`);
                }
            }
        }

        if (["underTreat", "underHospital"].includes(content.healthStatus)) {
            result = addString(result, `その他の症状: ${content.otherSymptom}`);
        }

        if (content.healthStatus === "underHospital") {
            result = addString(result, `定期通院している医療機関の名称: ${content.regularVisits}`);
        }

        if (content.healthStatus === "underHospital") {
            result = addString(result, `通院中の病名: ${content.diseaseName}`);
        }

        if (content.healthStatus === "underHospital") {
            result = addString(result, `内服薬: ${content.oralMedication}`);
        }

        return result;
    }

    const getPastTbDetail = (content) => {
        if (content.pastTb !== "yes") return "";
        let res = "";
        res = addString(res, `時期: ${content.pastTbEpisode ? content.pastTbEpisode : ""}`);
        res = addString(res, `治療内容: ${content.pastTbTreatment ? content.pastTbTreatment : ""}`);
        return res;
    }

    const getCheckupLabel = (content) => {
        const options = [
            { value: "annual", label: "毎年受けている" },
            { value: "fewYear", label: "数年に一度受けている" },
            { value: "gt3year", label: "３年間以上受けていない" },
            { value: "other", label: "その他・分からない" }
        ];
        const found = options.find(opt => opt.value === content.regularCheckup);
        return found ? found.label : "";
    }

    const getCheckupDetail = (content) => {
        const options = [
            { value: "none", label: "指示されていない" },
            { value: "notDone", label: "指示を受けたが受診していない" },
            { value: "done", label: "指示を受け受診している" },
            { value: "other", label: "その他・分からない" },
        ];
        const found = options.find(opt => opt.value === content.checkupFollow);
        return found ? found.label : "";
    }

    const getTbMedic = (content) => {
        const options = [
            { value: "no", label: "飲んでいない" },
            { value: "planned", label: "飲むことになっている" },
            { value: "yes", label: "飲んでいる" },
            { value: "other", label: "その他・分からない" },
        ];
        const found = options.find(opt => opt.value === content.tbMedication);
        return found ? found.label : "";
    }

    const getBcgReason = (content) => {
        if (content.bcg !== "no") return "";
        if (content.bcgReason === "tuber")
            return "ツベルクリン反応検査が陽性だったため";
        let res = "その他の理由";
        if (content.bcgOtherReason) {
            res += `: ${content.bcgOtherReason}`;
        }
        return res;
    }

    const getLivingDetail = (content) => {
        if (content.livingSituation === "facility") return content.facilityName;
        if (content.livingSituation === "hospital") return content.hospitalName;
        if (content.livingSituation === "other") return content.otherLivingSituation;
        return "";
    }

    const getHomelessDetail = (content) => {
        if (!content.homeless) return "";
        let res = "";
        if (content.vulnerableHomelessSpots) res += "よく野宿する場所: " + content.vulnerableHomelessSpots;
        if (content.vulnerableFacilities) {
            if (res !== "") res += "、";
            res += "よく利用する福祉施設・職業安定所・障害者施設等: " + content.vulnerableFacilities;
        }
        return res;
    }

    const getFamilyTbDetail = (content) => {
        if (content.familyTb !== "yes") return "";
        return content.familyTbDetail
    }

    const getOverseaDetail = (content) => {
        if (content.overseaStay !== "yes") return "";
        let res = "";
        if (content.overseaDuration) res += content.overseaDuration;
        if (content.overseaCountry) {
            if (res != "") res += "、";
            res += content.overseaCountry;
        }
        return res;
    }

    const getFacilities = (content) => {
        const options = [
            { value: "karaoke", label: "カラオケ", "name": "karaokeName" },
            { value: "gameCenter", label: "ゲームセンター", "name": "gameCenterName" },
            { value: "netCafe", label: "ネットカフェ・まんが喫茶", "name": "netCafeName" },
            { value: "pachinko", label: "パチンコ・麻雀店", "name": "pachinkoName" },
            { value: "raceTrack", label: "競馬場・競輪場", "name": "raceTrackName" },
            { value: "izakaya", label: "居酒屋・バー・キャバクラ等", "name": "izakayaName" },
            { value: "sauna", label: "サウナ・銭湯", "name": "saunaName" },
            { value: "capsuleHotel", label: "カプセルホテル", "name": "capsuleHotelName" },
            { value: "simpleInn", label: "簡易宿泊所", "name": "simpleInnName" },
        ];
        return options.reduce((acc, option) => {
            if (content[option.name]) {
                acc = addString(acc, `${option.label}: ${option.name}`);
            }
            return acc;
        }, "");
    }

    const getOptions = (value, options) => {
        const found = options.find(opt => opt.value === value);
        return found ? found.label : "";
    }

    const handleExportExcel = () => {
        exportExcel(selectedUser);
    }

    const handleExportPdf = () => {
        exportPdf(selectedUser);
    }

    const handleExportJson = () => {
        exportJson(selectedUser);
    }

    return (
        <Dialog open={true} onClose={handleCloseModal} maxWidth="lg" fullWidth>
            <DialogTitle className="border" sx={{ m: 0, p: 2, position: "relative" }}>
                ユーザー情報
                <IconButton
                    aria-label="close"
                    onClick={handleCloseModal}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                    size="large"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className="p-4" id="info-modal-print-content">
                    <table className="min-w-full border-collapse mb-4 border border-gray-200">
                        <thead>
                            <tr>
                                <th colSpan="4" className="border border-green-500 p-2 bg-green-500 text-white">基本情報</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">名前</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedUser.name}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">氏名カナ</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedUser.furiganaName}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">性別</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedUser.sex === "male" ? "男性" : selectedUser.sex === "female" ? "女性" : "その他"}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">年齢</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.age}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">住所</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.addressPrefCity + " " + selectedContent.addressTown}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">生年月日</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{formatJapaneseDate(selectedUser.birthDate)}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">電話番号</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedUser.phone}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">連絡がつきやすい時間帯</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.connectDay ? selectedContent.connectDay : ""}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">国籍</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getNationalityDisplay(selectedContent)}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">⽇本語能⼒</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getJpLevelLabel(selectedContent.jpLevel)}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">職業区分</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getOccupationLabel(selectedContent.occupation)}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">{getOccupationDetailLabel(selectedContent)}</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getOccupationDetailData(selectedContent)}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">問診依頼の経緯</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getRequestReason(selectedContent)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="min-w-full border-collapse mb-4 border border-gray-200">
                        <thead>
                            <tr>
                                <th colSpan="4" className="border border-green-500 p-2 bg-green-500 text-white">健康状況</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">健康状態</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getHealthStatus(selectedContent)}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">詳細</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getHealthStatusDetail(selectedContent)}</td>
                            </tr>
                            {
                                patientReasonsHospital.includes(selectedContent.requestReason) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">今回結核の診断をした医療機関</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getString(selectedContent.medicalInstitutions)}</td>
                                </tr>
                            }
                            {
                                patientReasons.includes(selectedContent.requestReason) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">この2年間で入院した医療機関</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getString(selectedContent.hospitalizations)}</td>
                                </tr>
                            }
                            {
                                patientReasons.includes(selectedContent.requestReason) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">結核既往歴</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.pastTb === "yes" ? "あり" : selectedContent.pastTb === "no" ? "なし" : selectedContent.pastTb === "unknown" ? "分からない" : ""}</td>
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">詳細</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{getPastTbDetail(selectedContent)}</td>
                                </tr>
                            }
                            {
                                patientReasons.includes(selectedContent.requestReason) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">結核患者との接触歴</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.contactWithTb === "yes" ? "あり" : selectedContent.contactWithTb === "no" ? "なし" : selectedContent.contactWithTb === "unknown" ? "分からない" : ""}</td>
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">詳細</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{getString(selectedContent.contactWithTbDetail)}</td>
                                </tr>
                            }
                            {
                                !patientReasons.includes(selectedContent.requestReason) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">健康診断受診状況</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{getCheckupLabel(selectedContent)}</td>
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">検診にて要精密検査を指示されていますか？</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{getCheckupDetail(selectedContent)}</td>
                                </tr>
                            }
                            {
                                !patientReasons.includes(selectedContent.requestReason) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">結核治療薬内服</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{getTbMedic(selectedContent)}</td>
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">理由</td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line">{getString(selectedContent.tbMedicationReason)}</td>
                                </tr>
                            }
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">BCG接種歴</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getOptions(selectedContent.bcg, [
                                    { value: "yes", label: "あり" },
                                    { value: "no", label: "なし" },
                                    { value: "other", label: "その他・分からない" },
                                ])}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">理由</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getBcgReason(selectedContent)}</td>
                            </tr>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">身⾧</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getString(selectedContent.height)}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">体重</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getString(selectedContent.weight)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="min-w-full border-collapse border border-gray-200">
                        <thead>
                            <tr>
                                <th colSpan="4" className="border border-green-500 p-2 bg-green-500 text-white">ライフスタイル</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">住まい・⽣活状況 </td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getOptions(selectedContent.livingSituation, [
                                    { value: "alone", label: "単身生活" },
                                    { value: "withFamily", label: "家族や知人と同居" },
                                    { value: "facility", label: "老健・福祉施設等共同生活" },
                                    { value: "hospital", label: "医療機関入院中" },
                                    { value: "other", label: "その他" },
                                ])}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">詳細</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getLivingDetail(selectedContent)}</td>
                            </tr>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">ホームレス経験  </td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.homeless ? "あり" : "なし"}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">詳細</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getHomelessDetail(selectedContent)}</td>
                            </tr>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">喫煙習慣</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.smokes ? "あり" : "なし"}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">飲酒習慣</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.drinks ? "あり" : "なし"}</td>
                            </tr>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">家族/同居⼈の結核感染者（過去2年間） </td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getOptions(selectedContent.familyTb, [
                                    { value: "yes", label: "いる" },
                                    { value: "no", label: "いない" },
                                    { value: "unknown", label: "その他・分からない" },
                                ])}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">詳細</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getFamilyTbDetail(selectedContent)}</td>
                            </tr>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">海外居住歴 </td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getOptions(selectedContent.overseaStay, [
                                    { value: "yes", label: "はい" },
                                    { value: "no", label: "いいえ" },
                                    { value: "unkown", label: "分からない" },
                                ])}</td>
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">詳細</td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line">{getOverseaDetail(selectedContent)}</td>
                            </tr>
                            <tr className="border border-gray-200">
                                <td className="border border-gray-200 p-2 text-center whitespace-pre-line">よく利用する店舗・施設 </td>
                                <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getFacilities(selectedContent)}</td>
                            </tr>
                            {
                                Number(selectedContent.age) >= 18 && Number(selectedContent.age) <= 75 && symptomCondition(selectedContent) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">上記以外に月１回以上行くような場所 </td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getString(selectedContent.adultOtherPlaces)}</td>
                                </tr>
                            }
                            {
                                Number(selectedContent.age) >= 18 && Number(selectedContent.age) <= 75 && symptomCondition(selectedContent) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">大勢の人が集まるような機会 </td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getString(selectedContent.adultLiveEvents)}</td>
                                </tr>
                            }
                            {
                                Number(selectedContent.age) >= 70 && symptomCondition(selectedContent) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">ショートステイ等、入所を伴う施設 </td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{selectedContent.elderlyShortStay === "yes" && "あり" + (selectedContent.elderlyShortStayDetail ? "、" + selectedContent.elderlyShortStayDetail : "")}</td>
                                </tr>
                            }
                            {
                                Number(selectedContent.age) >= 70 && symptomCondition(selectedContent) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">デイサービス等、利用している施設 </td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{selectedContent.elderlyDayService === "yes" && "あり" + (selectedContent.elderlyDayServiceDetail ? "、" + selectedContent.elderlyDayServiceDetail : "")}</td>
                                </tr>
                            }
                            {
                                ["foreigner"].includes(selectedContent.nationality) && symptomCondition(selectedContent) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">日本で通っていた学校 </td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getString(selectedContent.foreignSchool)}</td>
                                </tr>
                            }
                            {
                                ["foreigner"].includes(selectedContent.nationality) && symptomCondition(selectedContent) &&
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">同郷の方々が集まるような集会 </td>
                                    <td className="border border-gray-200 p-2 whitespace-pre-line" colSpan="3">{getString(selectedContent.foreignGatherings)}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                    {symptomCondition(selectedContent) &&
                        <table className="min-w-full border-collapse mt-4 border border-gray-200">
                            <thead>
                                <tr>
                                    <th colSpan="4" className="border border-green-500 p-2 bg-green-500 text-white">接触者</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">同居されている方</td>
                                    <td colSpan="3" className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.householdContacts && selectedContent.householdContacts.join("\n")}</td>
                                </tr>
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">職場・通学先等での日常的な接触相手</td>
                                    <td colSpan="3" className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.workSchoolContacts && selectedContent.workSchoolContacts.join("\n")}</td>
                                </tr>
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">その他の活動における日常的な接触相手</td>
                                    <td colSpan="3" className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.otherRegularContacts && selectedContent.otherRegularContacts.join("\n")}</td>
                                </tr>
                                <tr className="border border-gray-200">
                                    <td className="border border-gray-200 p-2 text-center whitespace-pre-line">その他、気になることやご質問</td>
                                    <td colSpan="3" className="border border-gray-200 p-2 whitespace-pre-line">{selectedContent.GeneralComments}</td>
                                </tr>
                            </tbody>
                        </table>
                    }
                    {selectedUser.finalMessage &&
                        <div className="p-4 mt-4 border border-green-500 rounded bg-green-50">
                            <strong>調査結果:</strong>
                            <div className="mt-2 whitespace-pre-line">
                                {selectedUser.finalMessage}
                            </div>
                        </div>
                    }
                </div>
            </DialogContent>
            <DialogActions className="border">
                <Button onClick={handleExportJson} color="primary" variant="outlined">
                    JSONでエクスポート
                </Button>
                <Button onClick={handleExportPdf} color="primary" variant="outlined">
                    PDFでエクスポート
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default InfoModal;