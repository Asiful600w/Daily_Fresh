import React from 'react';
import Link from 'next/link';

export default function DataDeletionPage() {
    return (
        <div className="bg-[#fafafa] dark:bg-[#111827] min-h-screen py-16 px-6 lg:px-24">
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#1e293b] rounded-2xl p-8 lg:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">User Data Deletion</h1>
                    <p className="text-slate-500 dark:text-slate-400">Instructions for removing your data from Daily Fresh</p>
                </div>

                <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <section>
                        <p>
                            Daily Fresh values your privacy and rights to your data. According to Facebook Platform rules, we have to provide
                            User Data Deletion Callback URL or Data Deletion Instructions URL. If you want to delete your activities
                            for the Daily Fresh App, you can follow these instructions:
                        </p>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Remove via Facebook</h2>
                        <ol className="list-decimal pl-5 space-y-3">
                            <li>Go to your Facebook Account's <strong>Settings & Privacy</strong>. Click <strong>Settings</strong>.</li>
                            <li>Look for <strong>Apps and Websites</strong> and you will see all of the apps and websites you linked with your Facebook.</li>
                            <li>Search and Click <strong>Daily Fresh</strong> in the search bar.</li>
                            <li>Scroll and click <strong>Remove</strong>.</li>
                            <li>Congratulations, you have successfully removed your app activities.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Request Permanent Data Deletion</h2>
                        <p className="mb-4">
                            If you wish to permanently delete your account and all associated data from our servers, please contact our support team.
                            We will process your request within 30 days.
                        </p>
                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <span className="material-icons-round text-primary">email</span>
                            <span>Email us at: <a href="mailto:privacy@dailyfresh.com" className="text-primary font-bold hover:underline">privacy@dailyfresh.com</a></span>
                        </div>
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
