
import CategoryForm from '../CategoryForm';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
    const { id } = await params;
    return <CategoryForm id={id} />;
}
