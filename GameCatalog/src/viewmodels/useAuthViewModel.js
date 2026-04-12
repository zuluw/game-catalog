import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { loginInCloud, registerInCloud } from "../models/firebase";

export const useAuthViewModel = () => {
  const { t } = useTranslation();
  const { login, continueAsGuest } = useAuth(); 

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) =>
    setModal({ visible: true, type, title, message });

  const handleAuth = async () => {
    if (!email || !password)
      return showStatus("error", t("error"), t("err_fill"));

    try {
      if (isLogin) {
        const firebaseUser = await loginInCloud(email, password);
        login(firebaseUser);
      } else {
        if (password.length < 6)
          return showStatus("error", t("error"), t("err_short"));
        await registerInCloud(email, password);
        showStatus("success", t("success"), t("msg_reg_ok"));
        setIsLogin(true);
      }
    } catch (e) {
      console.error(e.code);
      showStatus("error", t("error"), t("err_auth"));
    }
  };

  return {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    modal,
    setModal,
    handleAuth,
    continueAsGuest,
    t,
  };
};
