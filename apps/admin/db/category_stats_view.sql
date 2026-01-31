-- Create a view to easily query category popularity
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    category,
    COUNT(*) as order_count,
    SUM(quantity) as total_items_sold,
    SUM(price * quantity) as total_revenue
FROM 
    order_items
WHERE
    category IS NOT NULL
GROUP BY 
    category
ORDER BY 
    total_items_sold DESC;

-- Grant access to authenticated users (or service role)
GRANT SELECT ON category_stats TO authenticated;
GRANT SELECT ON category_stats TO service_role;
