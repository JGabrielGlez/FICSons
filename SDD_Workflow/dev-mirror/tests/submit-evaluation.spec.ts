// Placeholder test for submit-evaluation mirror
import { test, expect } from 'vitest';
import { gradeAttempt } from "../src/services/grading";

test("grading stub", () => {
  const r = gradeAttempt([]);
  expect(r).toHaveProperty("score");
});
