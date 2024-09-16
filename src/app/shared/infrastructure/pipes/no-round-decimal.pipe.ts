import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'noRoundDecimal',
  standalone: true
})
export class NoRoundDecimalPipe implements PipeTransform {

  transform(value: number, decimalPlaces: number): string {
    if (!isFinite(value) || isNaN(decimalPlaces) || decimalPlaces < 0) {
      return value.toString();
    }

    // Check if the number has a decimal part
    if (Math.floor(value) === value) {
      // It's an integer, return it without decimal places
      return value.toString();
    }

    // Handle the case with decimal places
    const factor = Math.pow(10, decimalPlaces);
    const truncatedValue = Math.floor(value * factor) / factor;

    // Convert to string without trailing zeros if no decimals present
    let truncatedStr = truncatedValue.toString();

    // Only ensure fixed decimal places if decimalPlaces > 0
    if (decimalPlaces > 0) {
      // Convert to fixed to add required decimal places
      truncatedStr = truncatedValue.toFixed(decimalPlaces);
      // Remove unnecessary trailing zeros and decimal point if any
      truncatedStr = truncatedStr.replace(/\.?0+$/, '');
    }

    return truncatedStr;
  }
}
