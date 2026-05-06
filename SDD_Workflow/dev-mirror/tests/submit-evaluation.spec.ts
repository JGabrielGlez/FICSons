// Placeholder test for submit-evaluation mirror
import { gradeAttempt } from '../src/services/grading';

test('grading stub', () => {
  const r = gradeAttempt([]);
  expect(r).toHaveProperty('score');
});
