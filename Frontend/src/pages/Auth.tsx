import { useSearchParams, useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"
import { SignInForm } from "../components/SignInForm"
import { SignupForm } from "../components/SignupForm"
import { useEffect } from "react"

export const Auth = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const mode = searchParams.get("mode") || "signin"

    // Redirect to dashboard if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            navigate('/dashboard', { replace: true })
        }
    }, [navigate])

    const switchToSignup = () => {
        setSearchParams({ mode: "signup" })
    }

    const switchToSignin = () => {
        setSearchParams({ mode: "signin" })
    }

    return (
        <AuthLayout>
            <div className="w-full max-w-md fadeIn">
                {mode === "signin" ? (
                    <SignInForm onSwitchToSignup={switchToSignup} />
                ) : (
                    <SignupForm onSwitchToSignin={switchToSignin} />
                )}
            </div>
        </AuthLayout>
    )
}
