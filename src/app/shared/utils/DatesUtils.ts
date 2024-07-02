import {TranslocoService} from "@jsverse/transloco";

const months = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];

export function getMonth(index: number) {
  if (index > 11 || index < 0)
    return months[0];
  return months[index];
}

export function getMonthTranslated(translocoService: TranslocoService, index: number){
  const currentLangMonths = translocoService.translate('GENERIC.texts.monthsArray')

  if (index > 11 || index < 0)
    return currentLangMonths[0];
  return currentLangMonths[index];
}

export function getDayTranslated(translocoService: TranslocoService, index: number){
  const currentLangDays = translocoService.translate('GENERIC.texts.daysArray')

  if (index > 7 || index < 0)
    return currentLangDays[0];
  return currentLangDays[index];
}
