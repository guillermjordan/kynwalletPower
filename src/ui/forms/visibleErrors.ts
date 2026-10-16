/** Errores visibles: solo los de controles ya tocados (001 FR-005, 002 FR-009). */
export function visibleErrors<F extends string>(
  errors: Partial<Record<F, string>>,
  touched: Record<F, boolean>,
): Partial<Record<F, string>> {
  const visible: Partial<Record<F, string>> = {};
  for (const field of Object.keys(errors) as F[]) {
    if (touched[field]) visible[field] = errors[field];
  }
  return visible;
}
