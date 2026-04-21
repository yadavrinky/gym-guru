export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gym-guru-vfbz.onrender.com";
export const WS_BASE_URL = API_BASE_URL.replace("http", "ws");

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        GOOGLE: `${API_BASE_URL}/api/auth/google`,
        ME: `${API_BASE_URL}/api/auth/me`,
        UPDATE_NAME: `${API_BASE_URL}/api/auth/update-name`,
        UPDATE_PROFILE: `${API_BASE_URL}/api/auth/update-profile`,
        PROFILE_PICTURE: `${API_BASE_URL}/api/auth/profile-picture`,
    },
    WORKOUT: {
        SESSION: `${API_BASE_URL}/api/workout/session`,
        HISTORY: `${API_BASE_URL}/api/workout/history`,
    },
    DIET: {
        PLAN: `${API_BASE_URL}/api/diet/plan`,
        CHAT: `${WS_BASE_URL}/api/diet/chat`,
    },
    BUDDY: {
        CHAT: `${WS_BASE_URL}/api/buddy/chat`,
    },
    HABIT: {
        PREDICT: `${API_BASE_URL}/api/habit/predict`,
    },
    ANALYTICS: {
        SUMMARY: `${API_BASE_URL}/api/analytics/summary/me`,
        WEEKLY: `${API_BASE_URL}/api/analytics/weekly-report/me`,
    }
};
