import { useState } from "react";
import { registerUser, loginUser } from "../models/db";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export const useAuthViewModel = () => {
  const { t } = useTranslation();
  const { login, continueAsGuest } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
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

  const handleAuth = () => {
    if (!username || !password)
      return showStatus("error", t("error"), t("err_fill"));

    if (isLogin) {
      const user = loginUser(username, password);
      if (user) {
        login(user);
      } else {
        showStatus("error", t("error"), t("err_auth"));
      }
    } else {
      try {
        registerUser(username, password);
        showStatus("success", t("success"), t("msg_reg_ok"));
        setIsLogin(true);
      } catch (e) {
        showStatus("error", t("error"), t("err_exists"));
      }
    }
  };

  return {
    isLogin,
    setIsLogin,
    username,
    setUsername,
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
