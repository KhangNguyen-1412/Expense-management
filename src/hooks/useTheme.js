import { useState, useEffect, useCallback } from "react";

export const THEME_VARIANTS = {
  FINTECH_INDIGO: "fintech_indigo",
  SUNRISE: "sunrise",
  SUNSET: "sunset",
  LIGHT: "light",
  DARK: "dark",
  LUXURY_GOLD: "luxury_gold",
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
  // Theme Style Preset ("fintech_indigo", "luxury_gold", etc.)
  const [themeStyle, setThemeStyleState] = useState(() => {
    return localStorage.getItem("theme_style_preset") || THEME_VARIANTS.FINTECH_INDIGO;
  });

  // Manual Dark Mode toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme_dark_manual");
    return saved !== null ? saved === "true" : true;
  });

  // Auto Time-based toggle (Sunrise / Sunset / Night / Day)
  const [isAutoTime, setIsAutoTime] = useState(() => {
    const saved = localStorage.getItem("theme_auto_time");
    return saved !== null ? saved === "true" : false;
  });

  const [activeTheme, setActiveTheme] = useState(THEME_VARIANTS.FINTECH_INDIGO);

  const setThemeStyle = useCallback((styleName) => {
    setThemeStyleState(styleName);
    localStorage.setItem("theme_style_preset", styleName);
  }, []);

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
      let currentTheme = THEME_VARIANTS.FINTECH_INDIGO;

      if (themeStyle === THEME_VARIANTS.FINTECH_INDIGO) {
        currentTheme = THEME_VARIANTS.FINTECH_INDIGO;
      } else if (themeStyle === THEME_VARIANTS.LUXURY_GOLD) {
        currentTheme = THEME_VARIANTS.LUXURY_GOLD;
      } else if (isDarkMode) {
        currentTheme = THEME_VARIANTS.DARK;
      } else if (isAutoTime) {
        currentTheme = getTimeBasedTheme();
      } else {
        currentTheme = THEME_VARIANTS.LIGHT;
      }

      setActiveTheme(currentTheme);

      const root = document.documentElement;
      root.classList.remove("dark", "theme-sunrise", "theme-sunset", "theme-luxury-gold", "theme-fintech-indigo");
      root.removeAttribute("data-theme");

      if (currentTheme === THEME_VARIANTS.FINTECH_INDIGO) {
        if (isDarkMode) {
          root.classList.add("dark");
        }
        root.classList.add("theme-fintech-indigo");
        root.setAttribute("data-theme", "fintech_indigo");
      } else if (currentTheme === THEME_VARIANTS.LUXURY_GOLD) {
        root.classList.add("dark", "theme-luxury-gold");
        root.setAttribute("data-theme", "luxury_gold");
      } else if (currentTheme === THEME_VARIANTS.DARK) {
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
      if (!isDarkMode && isAutoTime && themeStyle !== THEME_VARIANTS.LUXURY_GOLD && themeStyle !== THEME_VARIANTS.FINTECH_INDIGO) {
        updateDOM();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isDarkMode, isAutoTime, themeStyle]);

  return {
    theme: activeTheme,
    themeStyle,
    setThemeStyle,
    isDarkMode,
    isAutoTime,
    toggleDarkMode,
    toggleAutoTime,
    toggleTheme: toggleDarkMode,
  };
};
