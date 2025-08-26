import React, { useState } from "react";
import { motion } from "framer-motion";
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";

export default function AuthSwitcher() {
  const [active, setActive] = useState("login");

  const front = { opacity: 1, y: 0, scale: 1, zIndex: 30, transition: { duration: 0.45, ease: "easeOut" } };
  const behind = { opacity: 0.75, y: 28, scale: 0.94, zIndex: 10, transition: { duration: 0.45, ease: "easeOut" } };
  const outUp = { opacity: 0, y: -48, scale: 0.98, zIndex: 5, transition: { duration: 0.35, ease: "easeIn" } };

  const loginVariants = { active: front, inactive: outUp };
  const registerVariants = { active: front, inactive: behind };

  const switchTo = (page) => {
    console.log("[AuthSwitcher] switchTo ->", page);
    setActive(page);
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      <div className="relative w-full max-w-md px-4 py-12">
        <motion.div
          aria-hidden={active !== "login"}
          initial={active === "login" ? "active" : "inactive"}
          animate={active === "login" ? "active" : "inactive"}
          variants={loginVariants}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: active === "login" ? "auto" : "none" }}
        >
          <Login onSwitch={() => switchTo("register")} />
        </motion.div>

        <motion.div
          aria-hidden={active !== "register"}
          initial={active === "register" ? "active" : "inactive"}
          animate={active === "register" ? "active" : "inactive"}
          variants={registerVariants}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: active === "register" ? "auto" : "none" }}
        >
          <Register onSwitch={() => switchTo("login")} />
        </motion.div>
      </div>
    </div>
  );
}
