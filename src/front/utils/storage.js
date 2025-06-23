export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Usuario corrupto en localStorage:", err);
    localStorage.removeItem("user");
    return null;
  }
};
