// Placeholder login endpoint implementation
import { ApiError } from '../../lib/errors';

export async function handler(req: any, res: any) {
  try {
    // TODO: implement login flow
    res.status(200).json({ message: 'login placeholder' });
  } catch (err: any) {
    const e = err instanceof ApiError ? err : new ApiError(500, 'internal_error');
    res.status(e.status).json({ message: e.message });
  }
}
