import { Mail, Lock, EyeOff, Eye, Store, TriangleAlert } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Register() {
    const [bakeryName, setBakeryName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const { setUser } = useAuth();

    const register = async () => {
        setSubmitting(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bakeryName, email, password }),
            });

            if (res.ok) {
                const me = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`);
                setUser(await me.json());
                navigate("/ingredients");
                return;
            }

            if (res.status === 400) {
                const body = await res.json();
                setErrors(
                    Array.isArray(body)
                        ? body
                        : (Object.values(body.errors ?? {}).flat() as string[]),
                );
            } else if (res.status === 429) {
                setErrors(["Too many attempts. Please wait a minute and try again."]);
            } else {
                setErrors(["Something went wrong. Please try again."]);
            }
        } catch {
            setErrors(["Couldn't reach the server. Please try again."]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-3xl font-semibold tracking-tight text-header">Register now</h1>
            <p className="mt-1 mb-8">Get started setting up your bakery.</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    register();
                }}
                className="flex flex-col gap-5"
            >
                <div>
                    <label
                        htmlFor="bakeryName"
                        className="mb-1.5 block text-sm font-medium text-header"
                    >
                        Bakery name
                    </label>
                    <div className="relative">
                        <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                        <input
                            id="bakeryName"
                            type="text"
                            value={bakeryName}
                            onChange={(e) => setBakeryName(e.target.value)}
                            autoComplete="organization"
                            required
                            className="w-full rounded-xl border border-border/70 bg-surface py-3 pl-11 pr-4 text-header shadow-sm outline-none transition placeholder:text-body/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
                            placeholder="Your Bakery"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-header">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="w-full rounded-xl border border-border/70 bg-surface py-3 pl-11 pr-4 text-header shadow-sm outline-none transition placeholder:text-body/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
                            placeholder="you@yourbakery.com"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-1.5 block text-sm font-medium text-header"
                    >
                        Password
                    </label>
                    <div className="relative mb-2">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            minLength={15}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            className="w-full rounded-xl border border-border/70 bg-surface py-3 pl-11 text-header shadow-sm outline-none transition placeholder:text-body/50 focus:border-primary focus:ring-4 focus:ring-primary/15 pr-12"
                        />
                        <button
                            type="button"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-body/60 hover:bg-background hover:text-header"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <p className="text-sm font-light ">Must be at least 15 characters</p>
                </div>

                <button
                    type="submit"
                    className="mt-2 flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-header shadow-sm shadow-primary/30 transition hover:bg-primary-dark hover:shadow-md active:scale-[0.98]"
                    disabled={submitting}
                >
                    {submitting ? <LoadingSpinner className="h-4 w-4" /> : "Sign Up"}
                </button>

                <div
                    hidden={errors.length === 0}
                    role="alert"
                    className="flex items-start text-sm text-danger font-bold"
                >
                    <TriangleAlert className="inline w-5 h-5 mr-2" />{" "}
                    <ul>
                        {errors.map((e) => (
                            <li key={e}>{e}</li>
                        ))}
                    </ul>
                </div>
            </form>

            <p className="mt-8 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary-dark hover:underline">
                    Log in
                </Link>
            </p>
        </AuthLayout>
    );
}

export default Register;
