import axios from "axios";

const API_BASE_URL = "http://localhost:8900/api/v1";

export const fetchProfiles = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/profile/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching profiles:", error);
        return [];
    }
};

export const fetchUserDetails = async (permaId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${permaId}/profile`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user details for ${permaId}:`, error);
        return null;
    }
};

export const fetchRules = async (permaId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/resolution-rules/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user details for ${permaId}:`, error);
        return null;
    }
};

export const deleteUserProfile = async (permaId) => {

    try {
    const response = await axios.delete(`${API_BASE_URL}/${permaId}/profile`);
    } catch (error) {
        throw new Error("Failed to delete user profile");
    }
};
