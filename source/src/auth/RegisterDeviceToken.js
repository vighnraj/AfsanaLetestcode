import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../Config";

const RegisterDeviceToken = () => {
  const [tokenRegistered, setTokenRegistered] = useState(false);

  useEffect(() => {
    const registerToken = async () => {
      let deviceToken = localStorage.getItem("fcm_token");
      const userId = localStorage.getItem("user_id");

      // Agar token abhi available nahi hai, thodi der wait karo
      if (!deviceToken) {
        const checkToken = () =>
          new Promise((resolve) => {
            const interval = setInterval(() => {
              const t = localStorage.getItem("fcm_token");
              if (t) {
                clearInterval(interval);
                resolve(t);
              }
            }, 100); // har 100ms check
          });
        deviceToken = await checkToken();
      }

      try {
        await axios.post(
          `${BASE_URL}registerDeviceToken`,
          {
            user_id: userId,
            token: deviceToken,
            user_agent: navigator.userAgent,
            platform: "web",
          }
        );
        console.log("Device token registered successfully!");
        setTokenRegistered(true);
      } catch (err) {
        console.error("Error registering device token:", err);
      }
    };

    if (!tokenRegistered) registerToken();
  }, [tokenRegistered]);

  return null;
};

export default RegisterDeviceToken;
