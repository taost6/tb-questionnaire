import { getLang } from "@/helper";

const Header = ({ lang = "jp", percent = 100 }) => {
    return <>
        <h1 className="text-2xl font-bold mb-4">{getLang(lang, "header")}</h1>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percent}%` }} />
        </div>
    </>
}

export default Header;