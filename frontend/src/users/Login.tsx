import { useState } from "react";
import { Link } from "react-router-dom";
import {
    CakeSlice,
    ChefHat,
    Cookie,
    Croissant,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Wheat,
} from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-border/70 bg-surface py-3 pl-11 pr-4 text-header shadow-sm outline-none transition placeholder:text-body/50 focus:border-primary focus:ring-4 focus:ring-primary/15";

function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            <div className="relative hidden lg:flex flex-col justify-center overflow-hidden bg-primary p-14 text-header">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 text-header/10"
                >
                    <Croissant className="absolute -left-6 top-16 h-40 w-40 -rotate-12" />
                    <CakeSlice className="absolute right-10 top-10 h-28 w-28 rotate-12" />
                    <Wheat className="absolute -right-8 bottom-24 h-48 w-48 -rotate-6" />
                    <Cookie className="absolute left-20 bottom-10 h-24 w-24 rotate-6" />
                </div>

                <div className="relative max-w-md">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="rounded-2xl bg-surface/25 p-3">
                            <ChefHat className="h-8 w-8" />
                        </div>
                        <span className="text-lg font-semibold">Baking Management</span>
                    </div>
                    <h2 className="text-5xl font-semibold leading-tight tracking-tight">
                        Your recipes, costed to the penny.
                    </h2>
                    <p className="mt-5 text-lg text-header/80">
                        Track ingredient prices, build your recipes and know exactly what every bake
                        costs.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="rounded-2xl bg-primary/15 p-2.5 text-primary">
                            <ChefHat className="h-7 w-7" />
                        </div>
                        <span className="text-lg font-semibold text-header">Baking Management</span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight text-header">
                        Welcome back
                    </h1>
                    <p className="mt-1 mb-8">Log in to your bakery.</p>

                    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-header"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={inputClass}
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
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className={`${inputClass} pr-12`}
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
                        </div>

                        <button
                            type="submit"
                            className="mt-2 flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-header shadow-sm shadow-primary/30 transition hover:bg-primary-dark hover:shadow-md active:scale-[0.98]"
                        >
                            Log in
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm">
                        New here?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-primary-dark hover:underline"
                        >
                            Create your bakery
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
