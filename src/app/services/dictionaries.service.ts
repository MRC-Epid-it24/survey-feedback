import {Injectable} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {none, Option, some} from 'ts-option';
import {
  CharacterBuilder,
  CharacterRules,
  CharacterSentiment,
  CharacterSentimentEnum,
  CharacterTypeEnum
} from '../classes/character.class';
import {DemographicGroup, DemographicScaleSectorSentimentEnum} from '../classes/demographic-group.class';
import {SurveysService} from './surveys.service';
import {DemographicGroupsService} from './demographic-groups.service';
import {NutrientTypesService} from './nutrient-types.service';
import {SurveyStats} from '../classes/survey-result.class';
import {NutrientType} from '../classes/nutrient-types.class';
import {AppConfig} from '../conf';
import {SurveyFeedbackStyleEnum} from '../classes/survey-feedback-style.enum';
import {FeedbackStyleService} from './feedback-style.service';
import {map} from 'rxjs/internal/operators';
import {FiveADayFeedback} from '../classes/five-a-day-feedback';
import {FoodGroupsFeedbackService} from './food-groups-feedback.service';
import {SurveyFollowUpService} from './survey-followup.service';
import {FoodGroupFeedback} from '../classes/food-group-feedback';


export enum NutrientTypeIdEnum {
  Energy = 1,
  Carbohydrate = 13,
  Protein = 11,
  TotalFat = 49,
  Sugar = 23,
  SatdFat = 50,
  Fibre = 15,
  VitaminA = 120,
  Calcium = 140,
  VitaminC = 129,
  Iron = 143,
  Folate = 134,
  CO2 = 228,
  TotalFreeSugars = 251,
  AOACFibre = 242
}

class Phrases {
  static WatchOut = 'Watch out!';
  static Careful = 'Careful!';
  static DoingGreat = 'Doing great!';
}


const CharacterBuilders = [
  new CharacterBuilder(CharacterTypeEnum.BATTERY, [NutrientTypeIdEnum.Energy], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Your battery needs a boost'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Your battery needs a boost'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Your\'re so energetic'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Energy overload'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Energy overload')
  ]),

  new CharacterBuilder(CharacterTypeEnum.BREAD, [NutrientTypeIdEnum.Carbohydrate], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'You could be more starchy'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'You could be more starchy'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'You\'re Super Starchy!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Careful on the starch'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Careful on the starch')
  ]),

  new CharacterBuilder(CharacterTypeEnum.APPLE, [NutrientTypeIdEnum.Fibre], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Keep your finger on pulses!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Keep your finger on pulses!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Fibre-licious!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Keep your finger on pulses!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Keep your finger on pulses!')
  ]),

  new CharacterBuilder(CharacterTypeEnum.CANDY, [NutrientTypeIdEnum.Sugar], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Take care, Sugar'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Take care, Sugar'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'You\'re doing well, Sugar'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Take care, Sugar'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Take care, Sugar')
  ]),

  new CharacterBuilder(CharacterTypeEnum.SALMON, [NutrientTypeIdEnum.VitaminA], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Not quite scoring A* for Vitamin A'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Not quite scoring A* for Vitamin A'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Scoring A* for Vitamin A'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Too fishy'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Too fishy')
  ]),

  new CharacterBuilder(CharacterTypeEnum.MILK, [NutrientTypeIdEnum.Calcium], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Your milk could be spoiled'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Your milk could be spoiled'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Say cheese!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Your milk could be spoiled'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Your milk could be spoiled')
  ]),

  new CharacterBuilder(CharacterTypeEnum.BURGER, [NutrientTypeIdEnum.SatdFat], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Please don\'t eat me!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Please don\'t eat me!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Such a rate!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Please don\'t eat me!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Please don\'t eat me!')
  ]),

  new CharacterBuilder(CharacterTypeEnum.FRIES, [NutrientTypeIdEnum.TotalFat], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Chip is feeling fried'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Chip is feeling fried'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Chip is feeling delicious!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Chip is feeling fried'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Chip is feeling fried')
  ]),

  new CharacterBuilder(CharacterTypeEnum.EGG, [NutrientTypeIdEnum.Protein], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Pump up that protein!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Pump up that protein!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Feels Egg-static!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Whey too much protein!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Whey too much protein!')
  ]),

  new CharacterBuilder(CharacterTypeEnum.STRAWBERRY, [NutrientTypeIdEnum.VitaminC], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER,
      'Stranded in the Vitamin Sea'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING,
      'Stranded in the Vitamin Sea'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      'Sí Señor(ita)!'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      'Too deep in the Vitamin Sea'),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      'Too deep in the Vitamin Sea')
  ]),

  new CharacterBuilder(CharacterTypeEnum.IRON, [NutrientTypeIdEnum.Iron], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      '')
  ], SurveyFeedbackStyleEnum.Default),

  new CharacterBuilder(CharacterTypeEnum.FOLATE, [NutrientTypeIdEnum.Folate], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      '')
  ], SurveyFeedbackStyleEnum.Default),

  new CharacterBuilder(CharacterTypeEnum.CANDY, [NutrientTypeIdEnum.TotalFreeSugars], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      '')
  ], SurveyFeedbackStyleEnum.Default),

  new CharacterBuilder(CharacterTypeEnum.APPLE, [NutrientTypeIdEnum.AOACFibre], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      '')
  ], SurveyFeedbackStyleEnum.Default),

  new CharacterBuilder(CharacterTypeEnum.CO2, [NutrientTypeIdEnum.CO2], [
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.TOO_LOW, DemographicScaleSectorSentimentEnum.LOW],
      CharacterSentimentEnum.DANGER, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_LOW],
      CharacterSentimentEnum.WARNING, ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.GOOD, DemographicScaleSectorSentimentEnum.EXCELLENT],
      CharacterSentimentEnum.EXCITING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.BIT_HIGH],
      CharacterSentimentEnum.WARNING,
      ''),
    new CharacterSentiment(
      [DemographicScaleSectorSentimentEnum.HIGH, DemographicScaleSectorSentimentEnum.TOO_HIGH],
      CharacterSentimentEnum.DANGER,
      '')
  ], SurveyFeedbackStyleEnum.Default)

];

@Injectable()
export class DictionariesService {

  private cachedDictionaries: Option<Dictionaries> = none;

  constructor(private mySurveyResultsService: SurveysService,
              private styleService: FeedbackStyleService,
              private demographicGroupsService: DemographicGroupsService,
              private nutrientTypesService: NutrientTypesService,
              private foodGroupsFeedbackService: FoodGroupsFeedbackService,
              private surveyFollowUpService: SurveyFollowUpService) {
  }

  get(): Observable<Dictionaries> {
    return this.cachedDictionaries.match({
      some: dictionaries => of(dictionaries),
      none: () => forkJoin(
        this.mySurveyResultsService.getMySurveyResults(AppConfig.surveyId),
        this.demographicGroupsService.list(),
        this.nutrientTypesService.list(),
        this.styleService.getFeedbackStyle(AppConfig.surveyId),
        this.foodGroupsFeedbackService.getFiveADayFeedback(),
        this.surveyFollowUpService.getFollowUpUrl(AppConfig.surveyId),
        this.foodGroupsFeedbackService.getFoodGroupsFeedback()
      ).pipe(
        map(res => {
          const surveyResult = res[0];
          const nutrientTypes = res[2];
          const style = res[3];
          const fiveADayFeedback = res[4];
          const followUpUrl = res[5];
          const foodGroupsFeedback = res[6];
          const demographicGroups = res[1].map(dg =>
            dg.addNutrient(nutrientTypes.filter(nt => nt.id == dg.nutrientTypeId)[0]));

          const characterRules = CharacterBuilders.map(characterBuilder => {
            const nutrientTypeIds = characterBuilder.nutrientTypeIds;
            const dgs = demographicGroups.filter(dg => nutrientTypeIds.indexOf(dg.nutrientTypeId) > -1);
            return new CharacterRules(nutrientTypeIds, dgs, characterBuilder.type,
              characterBuilder.sentiments, characterBuilder.displayInFeedbackStyle);
          });

          const dictionaries = new Dictionaries(surveyResult, demographicGroups,
            nutrientTypes, characterRules, fiveADayFeedback, foodGroupsFeedback, style, followUpUrl);

          this.cachedDictionaries = some(dictionaries);

          return dictionaries;
        }))
    });
  }

}

export class Dictionaries {
  readonly surveyResult: SurveyStats;
  readonly demographicGroups: DemographicGroup[];
  readonly nutrientTypes: NutrientType[];
  readonly characterRules: CharacterRules[];
  readonly fiveADayFeedback: FiveADayFeedback;
  readonly foodGroupsFeedback: FoodGroupFeedback[];
  readonly surveyFeedbackStyle: SurveyFeedbackStyleEnum;
  readonly followUpUrl?: string;


  constructor(surveyResult: SurveyStats,
              demographicGroups: DemographicGroup[],
              nutrientTypes: NutrientType[],
              characterRules: CharacterRules[],
              fiveADayFeedback: FiveADayFeedback,
              foodGroupsFeedback: FoodGroupFeedback[],
              surveyFeedbackStyle: SurveyFeedbackStyleEnum,
              followUpUrl: string | undefined) {
    this.surveyResult = surveyResult;
    this.demographicGroups = demographicGroups;
    this.nutrientTypes = nutrientTypes;
    this.characterRules = characterRules;
    this.fiveADayFeedback = fiveADayFeedback;
    this.foodGroupsFeedback = foodGroupsFeedback;
    this.surveyFeedbackStyle = surveyFeedbackStyle;
    this.followUpUrl = followUpUrl;
  }

}
