// Placeholder user profile endpoint
export async function handler(req: any, res: any) {
  // Return dummy profile until Supabase integration is added
  res.status(200).json({ id: 'unknown', display_name: 'placeholder' });
}
