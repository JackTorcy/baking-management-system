import PageTitle from "../components/ui/PageTitle";

function Login() {
    return (
        <div className="bg=primary h-screen w-screen flex items-center justify-center bg-primary">
            <div className="flex flex-col gap-6">
                <PageTitle title="Login" className="text-center text-header"></PageTitle>
                <input className="min-w-50 border border-border rounded-2xl p-1 bg-surface" />
                <input className="min-w-50 border border-border rounded-2xl p-1 bg-surface" />
            </div>
        </div>
    );
}

export default Login;
