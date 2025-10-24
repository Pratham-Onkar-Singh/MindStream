import { useState, useEffect, useRef } from "react"
import { Button } from "./Button"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../api"

const textareaStyles = {
    "default": "w-full bg-black text-white border border-gray-800 py-3 px-4 rounded-lg placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
}

interface SignInFormProps {
    onSwitchToSignup: () => void
}

export const SignInForm = ({ onSwitchToSignup }: SignInFormProps) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [displayPassword, setDisplayPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        const newLength = newValue.length
        const oldLength = displayPassword.length

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        if (showPassword) {
            setPassword(newValue)
            setDisplayPassword(newValue)
        } else {
            if (newLength > oldLength) {
                const addedChar = newValue[newLength - 1]
                const newPassword = password + addedChar
                setPassword(newPassword)
                
                const maskedPrevious = '•'.repeat(oldLength)
                setDisplayPassword(maskedPrevious + addedChar)

                timeoutRef.current = setTimeout(() => {
                    setDisplayPassword('•'.repeat(newLength))
                }, 500)
            } else if (newLength < oldLength) {
                const charsDeleted = oldLength - newLength
                const newPassword = password.slice(0, password.length - charsDeleted)
                setPassword(newPassword)
                setDisplayPassword('•'.repeat(newLength))
            }
        }
    }

    const togglePasswordVisibility = () => {
        const newShowState = !showPassword
        setShowPassword(newShowState)
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        
        if (newShowState) {
            setDisplayPassword(password)
        } else {
            setDisplayPassword('•'.repeat(password.length))
        }
    }

    const signin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await authAPI.signin({ email, password })
            localStorage.setItem("token", response.token)
            navigate("/dashboard")
        } catch (error: any) {
            console.error(error)
            setError(error.response?.data?.message || "Invalid email or password")
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            signin()
        }
    }

    return (
        <div className="flex justify-center flex-col w-full">
            <div className="text-2xl text-center text-white font-bold mb-6">
                Sign In
            </div>
            <div className="mb-4 mt-4">
                <input 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Email"
                    className={`${textareaStyles.default} w-full`}
                />
            </div>
            <div className="mb-4 mt-4 relative">
                <input 
                    type="text"
                    value={displayPassword}
                    onChange={handlePasswordChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Password"
                    className={`${textareaStyles.default} w-full pr-12`}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>
            </div>
            <Button 
                variant="primary" 
                size="md" 
                text={loading ? "Signing in..." : "Sign In"} 
                className="w-full mt-4" 
                onClick={signin}
                type="button"
            />
            {error && (
                <div className="text-center mt-2 text-red-500 text-sm">
                    {error}
                </div>
            )}
            <div className="text-center mt-4 text-gray-500">
                Don't have an account?{' '}
                <button 
                    onClick={onSwitchToSignup}
                    className="text-white hover:underline cursor-pointer"
                >
                    Sign up
                </button>
            </div>
        </div>
    )
}
