import { ProductForm } from '../../ProductForm';
import { getProduct } from '@/lib/api';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Edit Product</h1>
            <ProductForm initialData={product} />
        </div>
    );
}
