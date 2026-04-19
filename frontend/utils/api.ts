export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gym-guru-vfbz.onrender.com";
export const WS_BASE_URL = API_BASE_URL.replace("http", "ws");

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        GOOGLE: `${API_BASE_URL}/api/auth/google`,
    },
    WORKOUT: {
        SESSIONS: `${API_BASE_URL}/api/workout/sessions`,
        ANALYZE: `${API_BASE_URL}/api/workout/analyze`,
    },
    DIET: {
        PLAN: `${API_BASE_URL}/api/diet/plan`,
        CHAT: `${WS_BASE_URL}/api/diet/chat`,
    },
    BUDDY: {
        CHAT: `${WS_BASE_URL}/api/buddy/chat`,
    },
    ANALYTICS: {
        SUMMARY: `${API_BASE_URL}/api/analytics/summary`,
        WEEKLY: `${API_BASE_URL}/api/analytics/weekly-report/me`,
    }
};
