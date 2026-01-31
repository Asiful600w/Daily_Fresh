export default {
    darkMode: 'selector',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#22C55E", // Emerald 500
                "background-light": "#F3F4F6", // Gray 100 (Better contrast with white cards)
                "background-dark": "#0F172A", // Slate 900
                "border-subtle": "#F1F5F9", // Slate 100 (Extremely subtle)
                "text-main": "#0F172A", // Slate 900
                "text-muted": "#64748B", // Slate 500
            },
            fontFamily: {}, // Removed display font to use default sans
            borderRadius: {
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
            },
            keyframes: {
                "scale-up": {
                    "0%": { transform: "scale(0.5)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            animation: {
                "scale-up": "scale-up 0.7s ease-out forwards",
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
        require("tailwindcss-animate"),
    ],
}
