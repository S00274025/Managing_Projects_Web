import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export function passwordsMatch(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!confirm) return null; // required validator on the confirm field handles empty
    return password === confirm ? null : { passwordsMismatch: true };
  };
}
