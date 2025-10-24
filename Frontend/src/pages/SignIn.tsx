import { useRef, useState } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { PasswordInput } from "../components/PasswordInput"
import { Logo } from "../icons/Logo"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../api"

export const Signin = () => {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const signin = async () => {
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Password length validation
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authAPI.signin({ email, password });
            localStorage.setItem("token", response.token);
            navigate("/dashboard");
        } catch (error: any) {
            console.error(error);
            setError(error.response?.data?.message || "Failed to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    }


    return <div className="w-screen h-screen bg-black flex justify-center items-center">
        <div className="bg-black h-fit p-10 rounded-2xl flex items-center gap-10 border border-gray-800">
            <div className="text-3xl flex pl-4 mb-4 gap-4 h-20 items-center text-white">
                <div className="cursor-pointer">
                    <Logo className="w-12"/>
                </div>
                <div className="cursor-pointer font-bold">
                    Mind<span className="text-custom-900">Stream</span>
                </div>
            </div>
            <div className="flex justify-center flex-col min-w-[300px]">
                <div className="text-2xl text-center text-white font-bold mb-6">
                    Sign In
                </div>
                <div>
                    <Input placeholder="Email" reference={emailRef} className="w-full"/>
                </div>
                <div>
                    <PasswordInput placeholder="Password" ref={passwordRef} className="w-full"/>
                </div>
                <Button 
                    variant="primary" 
                    size="md" 
                    text={loading ? "Signing in..." : "Sign In"} 
                    className="w-full mt-4" 
                    onClick={signin}
                />
                {error && (
                    <div className="text-center mt-2 text-red-500 text-sm">
                        {error}
                    </div>
                )}
                <div className="text-center mt-4 text-gray-500">
                    Don't have an account? <a href="/signup" className="text-white hover:underline">Sign up</a>
                </div>
            </div>
        </div>
    </div>
}