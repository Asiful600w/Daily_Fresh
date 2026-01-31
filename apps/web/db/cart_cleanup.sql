-- Trigger: Auto-delete cart when empty
-- If you want the cart (basket) to disappear when the last item is removed:

create or replace function public.delete_empty_cart()
returns trigger as $$
begin
  -- Check if the cart has any remaining items
  if not exists (select 1 from public.cart_items where cart_id = old.cart_id) then
    -- If no items, delete the cart
    delete from public.carts where id = old.cart_id;
  end if;
  return old;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors on re-run
drop trigger if exists on_cart_item_delete on public.cart_items;

create trigger on_cart_item_delete
after delete on public.cart_items
for each row execute procedure public.delete_empty_cart();
