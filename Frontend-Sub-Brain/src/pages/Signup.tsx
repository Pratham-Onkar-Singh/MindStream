import { useRef, useState } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Logo } from "../icons/Logo"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../api"

export const Signup = () => {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const signup = async () => {
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        const name = nameRef.current?.value;
        const email = emailRef.current?.value;

        if (!name || !username || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await authAPI.signup({ name, email, username, password });
            navigate("/signin");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create account. Please try again.");
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
                    Sign Up
                </div>
                <div>
                    <Input placeholder="Name" reference={nameRef} className="w-full"/>
                </div>
                <div>
                    <Input placeholder="Email" reference={emailRef} className="w-full"/>
                </div>
                <div>
                    <Input placeholder="Username" reference={usernameRef} className="w-full"/>
                </div>
                <div>
                    <Input placeholder="Password" reference={passwordRef} className="w-full"/>
                </div>
                <Button 
                    variant="primary" 
                    size="md" 
                    text={loading ? "Creating account..." : "Sign Up"} 
                    className="w-full mt-4" 
                    onClick={signup}
                />
                {error && (
                    <div className="text-center mt-2 text-red-500 text-sm">
                        {error}
                    </div>
                )}
                <div className="text-center mt-4 text-gray-500">
                    Already have an account? <a href="/signin" className="text-white hover:underline">Sign in</a>
                </div>
            </div>
        </div>
    </div>
}