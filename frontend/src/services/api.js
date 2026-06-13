const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const anonymousLogin = async () => {
    try {
        const response = await fetch(`${API_URL}/auth/anonymous-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error("Failed to authenticate anonymously");
        }
        return await response.json();
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};
