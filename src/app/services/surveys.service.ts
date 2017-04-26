import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AppHttp} from "./app-http.service";
import {UserStateService} from "./user-state.service";
import {SurveyResult} from "../classes/survey-result.class";
import {ApiEndpoints} from "../api-endpoints";
import {AppConfig} from "../conf";
import {SurveyPublicParameters} from "../classes/survey-public-parameters.class";


@Injectable()
export class SurveysService {

  constructor(private httpService: AppHttp, private userService: UserStateService) {
  }

  getMySurveyResults(surveyId: string): Observable<SurveyResult> {
    return this.httpService
      .get(ApiEndpoints.mySurveyResults(surveyId))
      .map(res => {
        return SurveyResult.fromJson(res.json());
      });
  }

  getSurveyPublicInfo(surveyId: string): Observable<SurveyPublicParameters> {
    return this.httpService.get(ApiEndpoints.surveyPublicParameters(surveyId))
      .map(res => SurveyPublicParameters.fromJson(res.json()));
  }

}