'use client';

type CheckoutStepperProps = {
    currentStep: 1 | 2 | 3;
};

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
    const steps = [
        { step: 1, label: 'Shopping Cart', icon: 'shopping_cart' },
        { step: 2, label: 'Checkout Details', icon: 'credit_card' },
        { step: 3, label: 'Order Complete', icon: 'check_circle' }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mb-10 px-4">
            <div className="relative flex items-center justify-between z-0">
                {/* Connecting Line - Background */}
                <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700" />

                {/* Connecting Line - Progress */}
                <div
                    className="absolute left-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-[#4c9a80] transition-all duration-700 ease-in-out"
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 80}%`
                    }}
                />

                {steps.map((s) => {
                    const isCompleted = currentStep > s.step;
                    const isActive = currentStep === s.step;

                    return (
                        <div key={s.step} className="flex flex-col items-center gap-3 relative group">
                            {/* Step Circle */}
                            <div
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-out z-10
                                    ${isActive
                                        ? 'bg-white dark:bg-[#0d1b17] border-[#4c9a80] text-[#4c9a80] shadow-[0_0_0_4px_rgba(76,154,128,0.15)] scale-110'
                                        : isCompleted
                                            ? 'bg-[#4c9a80] border-[#4c9a80] text-white shadow-md shadow-[#4c9a80]/20'
                                            : 'bg-white dark:bg-[#0d1b17] border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                                    }
                                `}
                            >
                                <span className={`material-icons-round text-xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                                    {isCompleted ? 'check' : s.icon}
                                </span>
                            </div>

                            {/* Label */}
                            <div className="flex flex-col items-center gap-0.5">
                                <span
                                    className={`
                                        text-xs font-bold uppercase tracking-wider transition-colors duration-300
                                        ${isActive
                                            ? 'text-[#0d1b17] dark:text-white'
                                            : isCompleted
                                                ? 'text-[#4c9a80]'
                                                : 'text-slate-400 dark:text-slate-600'
                                        }
                                    `}
                                >
                                    Step {s.step}
                                </span>
                                <span
                                    className={`
                                        text-sm font-bold whitespace-nowrap transition-colors duration-300 hidden sm:block
                                        ${isActive || isCompleted
                                            ? 'text-[#0d1b17] dark:text-white'
                                            : 'text-slate-400 dark:text-slate-600'
                                        }
                                    `}
                                >
                                    {s.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
