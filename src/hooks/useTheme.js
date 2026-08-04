import { useState, useEffect, useCallback } from "react";

export const THEME_VARIANTS = {
  SUNRISE: "sunrise",
  SUNSET: "sunset",
  LIGHT: "light",
  DARK: "dark",
};

/**
 * Determine active theme variant according to local device hour:
 * - 05:00 - 07:59: Sunrise (Bình minh)
 * - 08:00 - 16:59: Light (Ban ngày)
 * - 17:00 - 18:59: Sunset (Hoàng hôn)
 * - 19:00 - 04:59: Dark (Ban đêm)
 */
export const getTimeBasedTheme = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return THEME_VARIANTS.SUNRISE;
  if (hour >= 8 && hour < 17) return THEME_VARIANTS.LIGHT;
  if (hour >= 17 && hour < 19) return THEME_VARIANTS.SUNSET;
  return THEME_VARIANTS.DARK;
};

export const useTheme = () => {
  // Manual Dark Mode toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme_dark_manual") === "true";
  });

  // Auto Time-based toggle (Sunrise / Sunset / Night / Day)
  const [isAutoTime, setIsAutoTime] = useState(() => {
    const saved = localStorage.getItem("theme_auto_time");
    return saved !== null ? saved === "true" : true;
  });

  const [activeTheme, setActiveTheme] = useState(THEME_VARIANTS.LIGHT);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme_dark_manual", String(next));
      return next;
    });
  }, []);

  const toggleAutoTime = useCallback(() => {
    setIsAutoTime((prev) => {
      const next = !prev;
      localStorage.setItem("theme_auto_time", String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const updateDOM = () => {
      let currentTheme = THEME_VARIANTS.LIGHT;

      if (isDarkMode) {
        currentTheme = THEME_VARIANTS.DARK;
      } else if (isAutoTime) {
        currentTheme = getTimeBasedTheme();
      } else {
        currentTheme = THEME_VARIANTS.LIGHT;
      }

      setActiveTheme(currentTheme);

      const root = document.documentElement;
      root.classList.remove("dark", "theme-sunrise", "theme-sunset");
      root.removeAttribute("data-theme");

      if (currentTheme === THEME_VARIANTS.DARK) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else if (currentTheme === THEME_VARIANTS.SUNSET) {
        root.classList.add("dark", "theme-sunset");
        root.setAttribute("data-theme", "sunset");
      } else if (currentTheme === THEME_VARIANTS.SUNRISE) {
        root.classList.add("theme-sunrise");
        root.setAttribute("data-theme", "sunrise");
      } else {
        root.setAttribute("data-theme", "light");
      }
    };

    updateDOM();

    // Check time every minute if auto-time is active and dark mode is OFF
    const interval = setInterval(() => {
      if (!isDarkMode && isAutoTime) {
        updateDOM();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isDarkMode, isAutoTime]);

  return {
    theme: activeTheme,
    isDarkMode,
    isAutoTime,
    toggleDarkMode,
    toggleAutoTime,
    toggleTheme: toggleDarkMode,
  };
};
