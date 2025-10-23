import axios, { AxiosError } from 'axios';
import { BACKEND_URL } from './config';

// Create axios instance with default config
const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.token = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized request - clear token and redirect to signin
            localStorage.removeItem('token');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: async (data: { name: string; email: string; username: string; password: string }) => {
        const response = await api.post('/api/v1/signup', data);
        return response.data;
    },

    signin: async (data: { email: string; password: string }) => {
        const response = await api.post('/api/v1/signin', data);
        return response.data;
    },
};

// Content API
export const contentAPI = {
    create: async (data: { title: string; type: string; link?: string; description?: string; collection?: string }) => {
        const response = await api.post('/api/v1/content', data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/api/v1/content');
        return response.data;
    },

    delete: async (contentId: string) => {
        const response = await api.delete('/api/v1/content', {
            data: { contentId }
        });
        return response.data;
    },

    update: async (contentId: string, data: {
        title?: string;
        description?: string;
        link?: string;
        collection?: string | null;
    }) => {
        const response = await api.put('/api/v1/content', {
            contentId,
            ...data
        });
        return response.data;
    },
};

// file uploading API
export const uploadAPI = {
    // createSingleFile: async (fileInfo: { 
    //     filename: string, 
    //     url: string, 
    //     publicId: string,  
    //     resourceType: string,
    //     format: string,
    //     bytes: number,
    //     width: number,
    //     height: number
    // }) => {
    //     const response = await axios.post("/api/v1/upload", fileInfo);

    // },
    uploadFile: async (formData: FormData) => {
        const response = await api.post('/api/v1/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // TODO: create other file routes like getting all files, getting file by Id, deleting a file, 
    // Work in progress here...
}

// Share API
export const shareAPI = {
    getBrainLink: async () => {
        const response = await api.get('/api/v1/brain/share');
        return response.data;
    },

    getShared: async (shareLink: string) => {
        const response = await api.get(`/api/v1/brain/${shareLink}`);
        return response.data;
    },
};

// API for searching
export const searchAPI = {
    search: async (query: string, filters? : {
        type?: string;
        sortBy?: string;
        collection?: string;
    }) => {
        const params = new URLSearchParams({ query });
        if (filters?.type) params.append('type', filters.type);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.collection) params.append('collection', filters.collection);
        
        const response = await api.get(`/api/v1/search?${params.toString()}`);
        return response.data;
    }
}

// User API
export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/api/v1/user/profile');
        return response.data;
    },

    updateProfile: async (data: { name?: string; username?: string; email?: string }) => {
        const response = await api.put('/api/v1/user/profile', data);
        return response.data;
    },

    toggleBrainVisibility: async (isBrainPublic: boolean) => {
        const response = await api.put('/api/v1/user/brain-visibility', { isBrainPublic });
        return response.data;
    },
};

// Collection API
export const collectionAPI = {
    getAll: async () => {
        const response = await api.get('/api/v1/collections');
        return response.data;
    },

    create: async (data: {
        name: string,
        description?: string,
        icon?: string,
        color?: string,
        parentCollection?: string
    }) => {
        const response = await api.post('/api/v1/collections', data);
        return response.data;
    },

    update: async (collectionId: string, data: {
        name?: string,
        description?: string,
        icon?: string,
        color?: string
    }) => {
        const response = await api.post(`/api/v1/collections/${collectionId}`, data);
        return response.data;
    },

    delete: async (collectionId: string) => {
        const response = await api.delete(`/api/v1/collections/${collectionId}`)
        return response.data
    },

    getContent: async (collectionId: string) => {
        const response = await api.get(`/api/v1/collections/${collectionId}/contents`)
        return response.data;
    }

}

export default api;
