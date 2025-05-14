import { createServerClient } from '../src/lib/supabase/client';

async function updateNewsStatus() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('news_items')
      .update({ status: 'published' })
      .eq('status', 'pending')
      .select('id, title, status');

    if (error) {
      console.error('Error updating news items:', error);
      return;
    }

    console.log(`Updated ${data?.length || 0} news items to published status`);
    console.log('Updated items:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateNewsStatus(); 