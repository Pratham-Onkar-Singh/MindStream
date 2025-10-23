import { useEffect, useState } from "react"
import { contentAPI } from "../api";

interface Content {
    _id: string;
    title: string;
    description?: string;
    type: string;
    link?: string;
    tags?: string[];
    userId: string;
}

export const useContent = () => {
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await contentAPI.getAll();
            setContents(response.contents);
        } catch (error: any) {
            console.error("Failed to fetch contents:", error);
            setError(error.response?.data?.message || "Failed to load content");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, [])

    return { contents, refresh, loading, error }
}