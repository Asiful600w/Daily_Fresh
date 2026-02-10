'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { searchProducts } from '@/lib/api';

export default function DebugSearchPage() {
    const [query, setQuery] = useState('apple');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const runSearch = async () => {
        try {
            setError(null);
            setResult('Searching...');
            console.log('Starting search for:', query);
            const data = await searchProducts(query);
            console.log('Search result:', data);
            setResult(data);
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err);
        }
    };

    const runDirectQuery = async () => {
        try {
            setError(null);
            setResult('Running direct query...');
            const { data, error } = await supabase
                .from('products')
                .select(`
                    id, name, price,
                    categories (name),
                    special_categories (name),
                    subcategories (name)
                `)
                .ilike('name', `%${query}%`)
                .limit(5);

            if (error) throw error;
            setResult(data);
        } catch (err: any) {
            setError(err);
        }
    };

    const checkCategories = async () => {
        try {
            setResult('Checking categories...');
            const { data, error } = await supabase.from('categories').select('*').limit(5);
            if (error) throw error;
            setResult(data);
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Search Debugger</h1>

            <div className="mb-6 p-4 bg-slate-100 rounded">
                <h2 className="font-bold">Auth Status</h2>
                <button onClick={checkUser} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Check User</button>
                <div className="mt-2">
                    {user ? (
                        <div className="text-green-600">Logged In: {user.email} ({user.id})</div>
                    ) : (
                        <div className="text-red-500">Not Logged In</div>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="border p-2 rounded mr-2 w-64"
                    placeholder="Search term"
                />
                <button onClick={runSearch} className="bg-green-600 text-white px-4 py-2 rounded mr-2">Run API Search</button>
                <button onClick={runDirectQuery} className="bg-purple-600 text-white px-4 py-2 rounded mr-2">Run Direct Query</button>
                <button onClick={checkCategories} className="bg-orange-500 text-white px-4 py-2 rounded">Check Categories</button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded overflow-auto">
                    <h3 className="font-bold">Error:</h3>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {result && (
                <div className="p-4 bg-gray-100 border border-gray-300 rounded overflow-auto max-h-[500px]">
                    <h3 className="font-bold">Result ({Array.isArray(result) ? result.length : 'Object'}):</h3>
                    <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
