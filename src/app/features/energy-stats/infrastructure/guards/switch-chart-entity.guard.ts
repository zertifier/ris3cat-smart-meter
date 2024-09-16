import {CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";
import {ChartStoreService} from "../services/chart-store.service";
import {ChartEntity} from "../../domain/ChartEntity";

/**
 * Acts more like an interceptor. Always grant access but when the user is trying to access to this route
 * change the chart entity to the specified one.
 * @param resource
 */
export function switchChartEntityGuard(resource: ChartEntity): CanActivateFn {
  return () => {
    const chartStoreService = inject(ChartStoreService);
    chartStoreService.patchState({selectedChartEntity: resource});
    return true;
  }
}
