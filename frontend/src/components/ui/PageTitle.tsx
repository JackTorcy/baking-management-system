function PageTitle({ title, className = "" }: { title: string; className?: string }) {
    return <div className={`text-4xl mb-4 font-semibold ${className}`}>{title}</div>;
}

export default PageTitle;
