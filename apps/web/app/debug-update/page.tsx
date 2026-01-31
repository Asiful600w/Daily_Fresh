'use client';

import { useState, useEffect } from 'react';
import { updateProduct, getProduct } from '@/lib/api';

export default function DebugUpdatePage() {
    const [log, setLog] = useState<string[]>([]);
    const [productId, setProductId] = useState('');

    // Capture console logs
    useEffect(() => {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
            setLog(prev => [...prev, `LOG: ${args.map(a => JSON.stringify(a)).join(' ')}`]);
            originalLog(...args);
        };
        console.warn = (...args) => {
            setLog(prev => [...prev, `WARN: ${args.map(a => JSON.stringify(a)).join(' ')}`]);
            originalWarn(...args);
        };
        console.error = (...args) => {
            setLog(prev => [...prev, `ERR: ${args.map(a => JSON.stringify(a)).join(' ')}`]);
            originalError(...args);
        };

        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    const addLog = (msg: string) => setLog(prev => [...prev, `${new Date().toISOString().split('T')[1]}: ${msg}`]);

    const runTest = async () => {
        if (!productId) return alert('Enter Product ID');
        const id = parseInt(productId);
        addLog(`Starting test for product ${id}...`);

        try {
            // 1. Fetch current
            addLog('Fetching current product...');
            const current = await getProduct(id.toString());
            if (!current) {
                addLog('Product not found!');
                return;
            }
            addLog(`Current: ${current.category} / ${current.subcategory}`);

            // 2. Update to new values
            const newCat = 'Fashion';
            const newSub = "Men's Fashion";
            addLog(`Updating to ${newCat} / ${newSub}...`);

            await updateProduct(id, {
                ...current,
                category: newCat,
                subcategory: newSub
            });
            addLog('Update function finished.');

            // 3. Verify
            addLog('Fetching again to verify...');
            const updated = await getProduct(id.toString());
            addLog(`New State: ${updated?.category} / ${updated?.subcategory}`);

            if (updated?.category === newCat && updated?.subcategory === newSub) {
                addLog('SUCCESS: Product updated correctly.');
            } else {
                addLog('FAILURE: Product did NOT update.');
            }

        } catch (e: any) {
            addLog(`ERROR: ${e.message}`);
            console.error(e);
        }
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Debug Update Product</h1>
            <div className="flex gap-2">
                <input
                    className="border p-2 rounded"
                    placeholder="Product ID"
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                />
                <button onClick={runTest} className="bg-blue-500 text-white px-4 py-2 rounded">Run Test</button>
            </div>
            <div className="bg-slate-100 p-4 rounded h-96 overflow-auto font-mono text-sm whitespace-pre-wrap">
                {log.join('\n')}
            </div>
        </div>
    );
}
