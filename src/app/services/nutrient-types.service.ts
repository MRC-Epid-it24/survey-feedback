import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AppAuthHttp} from "./app-http.service";
import {NutrientType} from "../classes/nutrient-types.class";
import {ApiEndpoints} from "../api-endpoints";
import {Option, some, none} from "ts-option";

@Injectable()
export class NutrientTypesService {

  private cachedNutrientTypes: NutrientType[];

  constructor(private httpService: AppAuthHttp) {
    this.cachedNutrientTypes = [];
  }

  list(): Observable<NutrientType[]> {
    return this.httpService
      .get(ApiEndpoints.nutrientTypes())
      .map(res => {
        this.cachedNutrientTypes = res.json().map(NutrientType.fromJson);
        return this.cachedNutrientTypes;
      });
  }

  getUnitByNutrientTypeId(nutrientTypeId: number): Option<string> {
    let nutrientTypes = this.cachedNutrientTypes.filter(nt => nt.id == nutrientTypeId);
    if (nutrientTypes.length) {
      return some(nutrientTypes[0].unit);
    } else {
      return none;
    }
  }

}
