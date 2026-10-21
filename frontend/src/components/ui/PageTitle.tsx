function PageTitle({ title, className = "" }: { title: string; className?: string }) {
    return (
        <div className={`text-4xl text-header mb-4 font-semibold tracking-tight  ${className}`}>
            {title}
        </div>
    );
}

export default PageTitle;
