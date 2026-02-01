import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="bg-[#fafafa] dark:bg-[#111827] min-h-screen py-16 px-6 lg:px-24">
            <div className="max-w-4xl mx-auto bg-white dark:bg-[#1e293b] rounded-2xl p-8 lg:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-500 dark:text-slate-400">Last updated: February 2, 2026</p>
                </div>

                <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Information We Collect</h2>
                        <p className="mb-2">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This may include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Name, email address, phone number, and postal address.</li>
                            <li>Payment information (processed securely by our payment processors).</li>
                            <li>Order history and preferences.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Process your orders and deliver your groceries.</li>
                            <li>Send you transaction confirmations and updates.</li>
                            <li>Provide customer support and respond to your inquiries.</li>
                            <li>Identify and prevent fraud.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Data Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, no internet transmission is ever completely secure or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Cookies</h2>
                        <p>
                            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Third-Party Services</h2>
                        <p>
                            We may share your data with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you (e.g., payment processors, delivery partners), so long as those parties agree to keep this information confidential.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@dailyfresh.com.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-center">
                    <Link href="/" className="text-primary font-bold hover:underline flex items-center gap-2">
                        <span className="material-icons-round">arrow_back</span>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
