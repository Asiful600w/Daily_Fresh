interface CategoryHeroProps {
    title: string;
    image: string;
    description?: string;
}

export function CategoryHero({ title, image, description }: CategoryHeroProps) {
    return (
        <div className="relative w-full h-64 rounded-3xl overflow-hidden mb-12 group">
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%), url("${image}")` }}
            ></div>
            <div className="relative h-full flex flex-col justify-center px-12 max-w-2xl">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block w-fit backdrop-blur-sm border border-primary/30">
                    Seasonal Picks
                </span>
                <h1 className="text-white text-5xl font-extrabold leading-tight mb-2">
                    {title}
                </h1>
                {description && (
                    <p className="text-slate-200 text-lg">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
