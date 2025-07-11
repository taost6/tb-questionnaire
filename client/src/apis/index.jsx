import axios from "axios";

export const sendRequest = async (data = {}, method = "GET", url = "", requireAuth = false) => {
  try {
    const Authorization = requireAuth
      ? {
          Authorization: `Bearer ${localStorage.getItem("tbq-auth")}`,
        }
      : {};
    const req = {
      headers: {
        ...Authorization,
        Accept: "*",
      },
      method,
      url: `${import.meta.env.VITE_TBQ_API_URL}${url}`,
    };

    Object.assign(req, method === "GET" ? { params: data } : { data });
    const response = await axios(req);

    if (response.status >= 200 && response.status < 299) {
      const resData = await response.data;
      return resData;
    }

    return false;
  } catch (e) {
    console.log(e);
    if (e?.response?.data) alert(e.response.data.error);
    else alert("Something went wrong.");
    return false;
  }
};

export default sendRequest;
