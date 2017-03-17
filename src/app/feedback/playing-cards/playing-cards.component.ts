import {Component} from "@angular/core";
import {SELECTOR_PREFIX} from "../feedback.const";
import {Observable} from "rxjs";
import {CharacterSentimentWithDescription} from "../../classes/character.class";
import {UserDemographic} from "../../classes/demographic-group.class";
import {Food} from "../../classes/food.class";
import {NutrientTypeIdEnum, DictionariesService, Dictionaries} from "../../services/dictionaries.service";
import {UserDemographicService} from "../../services/user-demographic.service";
import {PieChardData} from "../pie-chart/pie-chart.component";

@Component({
  selector: SELECTOR_PREFIX + "playing-cards",
  templateUrl: "./playing-cards.component.html",
  styleUrls: ["./playing-cards.component.scss"]
})

export class PlayingCardsComponent {

  readonly ColorNamesMap: [string, string][] = [
    ["ch-red", "#FF6384"],
    ["ch-blue", "#36A2EB"],
    ["ch-yellow", "#FFCE56"],
    ["ch-lilac", "#9c27b0"],
    ["ch-green", "#8bc34a"],
    ["ch-grey", "#999999"]
  ];

  results: CharacterSentimentWithDescription[] = [];
  userDemographic: UserDemographic;
  foodHighInCalories: Food[] = [];
  foodHighInSugar: Food[] = [];
  foodHighInSatFat: Food[] = [];

  caloriesChartData: PieChardData[];
  sugarChartData: PieChardData[];
  satFatChartData: PieChardData[];

  nutrientTypeIdEnergy: NutrientTypeIdEnum = NutrientTypeIdEnum.ENERGEY;
  nutrientTypeIdSugar: NutrientTypeIdEnum = NutrientTypeIdEnum.SUGAR;
  nutrientTypeIdSatFat: NutrientTypeIdEnum = NutrientTypeIdEnum.SATD_FAT;

  showTopNumber: number = 5;

  diets: any = [
    {
      src: "/assets/img/salmon-pic.jpg",
      title: "Salmon",
      howMany: "At least 2 portions a week. Portion is around 140g.",
      sourceOf: ["healthy fats", "protein", "Vitamin D"]
    },

    {
      src: "/assets/img/egg-pic.jpg",
      title: "Eggs",
      howMany: "No more than 3 whole eggs a day",
      sourceOf: ["healthy fats", "protein"]
    },

    {
      src: "/assets/img/blue-pic.jpg",
      title: "Blueberries",
      howMany: "50g a day",
      sourceOf: ["Vitamin B", "Vitamin E"]
    },
  ];

  constructor(private dictionariesService: DictionariesService,
              private userDemographicService: UserDemographicService) {
  }

  ngOnInit(): void {


    Observable.forkJoin(
      this.dictionariesService.get(),
      this.userDemographicService.getUserDemographic()
    ).subscribe(res => this.buildView(res));

  }

  getByColumns(colsCount: number): CharacterSentimentWithDescription[][] {
    let result = [];
    let colIndex = 0;
    while (colIndex < colsCount) {
      result.push(this.results.filter((r, i) => i % colsCount == colIndex));
      colIndex++;
    }
    return result;
  }

  private buildView(dictionariesRes: [Dictionaries, UserDemographic]): void {
    this.buildCHaracterCards(dictionariesRes);
    this.getTopFoods(dictionariesRes[0].surveyResults);
  }

  private buildCHaracterCards(dictionariesRes: [Dictionaries, UserDemographic]): void {
    let dictionaries = dictionariesRes[0];
    let foods = dictionaries.surveyResults;
    let characterRules = dictionaries.characterRules;
    this.userDemographic = dictionariesRes[1];
    this.results = characterRules.map(characterRule => {
      let sentiment = characterRule.getSentiment(this.userDemographic, foods);
      return sentiment.get;
    });
  }

  private getTopFoods(foods: Food[]): void {
    let foodHighInCalories = this.sortFoodByNutrientTypeId(NutrientTypeIdEnum.ENERGEY, foods);
    let foodHighInSugar = this.sortFoodByNutrientTypeId(NutrientTypeIdEnum.SUGAR, foods);
    let foodHighInSatFat = this.sortFoodByNutrientTypeId(NutrientTypeIdEnum.SATD_FAT, foods);

    let otherCalories = foodHighInCalories.slice(this.showTopNumber);
    let otherSugar = foodHighInSugar.slice(this.showTopNumber);
    let otherSatdFat = foodHighInSatFat.slice(this.showTopNumber);

    this.foodHighInCalories = foodHighInCalories.slice(0, this.showTopNumber).concat(this.summeriseOtherFood(NutrientTypeIdEnum.ENERGEY, otherCalories));
    this.foodHighInSugar = foodHighInSugar.slice(0, this.showTopNumber).concat(this.summeriseOtherFood(NutrientTypeIdEnum.SUGAR, otherSugar));
    this.foodHighInSatFat = foodHighInSatFat.slice(0, this.showTopNumber).concat(this.summeriseOtherFood(NutrientTypeIdEnum.SATD_FAT, otherSatdFat));

    this.caloriesChartData = this.foodHighInCalories
      .map((f, i) => new PieChardData(f.getConsumption(NutrientTypeIdEnum.ENERGEY), f.englishName, this.ColorNamesMap[i][1]));

    this.sugarChartData = this.foodHighInSugar
      .map((f, i) => new PieChardData(f.getConsumption(NutrientTypeIdEnum.SUGAR), f.englishName, this.ColorNamesMap[i][1]));

    this.satFatChartData = this.foodHighInSatFat
      .map((f, i) => new PieChardData(f.getConsumption(NutrientTypeIdEnum.SATD_FAT), f.englishName, this.ColorNamesMap[i][1]));
  }

  private sortFoodByNutrientTypeId(nutrientTypeId: number, foods: Food[]): Food[] {
    return foods.map(food => food.clone())
      .sort((a, b) => b.getConsumption(nutrientTypeId) - a.getConsumption(nutrientTypeId));
  }

  private summeriseOtherFood(nutrientTypeId: number, foods: Food[]): Food[] {
    let total = foods.map(f => f.getConsumption(nutrientTypeId)).reduce((a, b) => a + b);
    return [new Food("Other food", "Other food", [[nutrientTypeId, total]])];
  }

}