
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const applyThemeClass = (theme: "light" | "dark") => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const getStoredTheme = () => {
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return "system";
};

const media = window.matchMedia("(prefers-color-scheme: dark)");
const resolveTheme = () => (media.matches ? "dark" : "light");

const storedTheme = getStoredTheme();
applyThemeClass(storedTheme === "system" ? resolveTheme() : storedTheme);

media.addEventListener("change", () => {
  if (getStoredTheme() === "system") {
    applyThemeClass(resolveTheme());
  }
});

createRoot(document.getElementById("root")!).render(<App />);
  
