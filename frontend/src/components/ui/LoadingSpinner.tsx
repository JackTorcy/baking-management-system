function LoadingSpinner({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-spin rounded-full border-2 border-current border-t-transparent border-b-transparent ${className}`}
        />
    );
}

export default LoadingSpinner;
