import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="bg-[#fafafa] dark:bg-[#111827] min-h-screen py-16 px-6 lg:px-24">
            <div className="max-w-4xl mx-auto bg-white dark:bg-[#1e293b] rounded-2xl p-8 lg:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Terms of Service</h1>
                    <p className="text-slate-500 dark:text-slate-400">Last updated: February 2, 2026</p>
                </div>

                <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Daily Fresh (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Description of Service</h2>
                        <p>
                            Daily Fresh provides an online platform for purchasing fresh groceries and having them delivered to your doorstep. We reserve the right to modify, suspend, or discontinue any part of the service at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. User Account</h2>
                        <p>
                            To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account. You agree to notify Daily Fresh immediately of any unauthorized use of your account or password.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Orders and Payments</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All orders are subject to acceptance and availability.</li>
                            <li>Prices for products are subject to change without notice.</li>
                            <li>Daily Fresh reserves the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase.</li>
                            <li>You agree to provide current, complete, and accurate purchase and account information for all purchases made via our store.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Delivery and Returns</h2>
                        <p>
                            We aim to deliver products within the estimated timeframes, but we are not liable for any delays. If you are not satisfied with the quality of any perishable items, please contact us within 24 hours of delivery for a refund or replacement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at support@dailyfresh.com.
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
