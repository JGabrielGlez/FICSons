// Placeholder signup endpoint implementation
import { ApiError } from '../../lib/errors';

export async function handler(req: any, res: any) {
  try {
    // TODO: implement signup flow using Supabase client
    res.status(201).json({ message: 'signup placeholder' });
  } catch (err: any) {
    const e = err instanceof ApiError ? err : new ApiError(500, 'internal_error');
    res.status(e.status).json(e.message ? { message: e.message } : {});
  }
}
