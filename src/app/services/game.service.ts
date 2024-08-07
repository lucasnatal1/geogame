import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private _url = 'https://restcountries.com/v3.1/';
  private _matchSize = 5;
  private _flagCost = 40;
  private _capitalCost = 30;
  private _bordersCost = 20;
  private _timeInterval = 2000;
  private allCountries: any;
  private curGameCountries: any = [];
  private maxIndex = -1;
  private curCountry: any;
  curCountryChanged = new Subject();
  private curCountryIndex = 0;
  curCountryIndexChanged = new Subject<number>();
  points = -1;
  pointsChanged = new Subject<number>();
  private totalPoints = 0;
  totalPointsChanged = new Subject<number>();
  private matchOver = false;
  isMatchOver = new Subject<boolean>();
  displayCorrectAnswer = new Subject<boolean>();

  constructor() {}

  public getMatchSize() {
    return this._matchSize;
  }

  public getFlagCost() {
    return this._flagCost;
  }

  public getCapitalCost() {
    return this._capitalCost;
  }

  public getBordersCost() {
    return this._bordersCost;
  }

  public getTimeInterval() {
    return this._timeInterval;
  }

  private async getData() {
    try {
      const response = await fetch(this._url + 'all');
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      this.allCountries = json.filter((c: any) => {
        return c.translations.por.common.length < 29;
      });
      this.maxIndex = this.allCountries.length - 1;
    } catch (error: any) {
      console.log(error.message);
    }
  }

  private getRandomMatchCountries() {
    var index;
    for (let i = 0; i < this._matchSize; i++) {
      index = Math.floor(Math.random() * this.maxIndex);
      this.curGameCountries.push(this.allCountries[index]);

      [this.allCountries[index], this.allCountries[this.maxIndex]] = [
        this.allCountries[this.maxIndex],
        this.allCountries[index],
      ];

      this.maxIndex = this.maxIndex - 1;
    }
    this.maxIndex = this.maxIndex + this._matchSize;
    
    this.publishInitialDataSetup();
  }

  private publishInitialDataSetup() {
    this.curCountry = this.curGameCountries[0];
    this.curCountryChanged.next(this.curCountry);
    this.curCountryIndex = 0;
    this.curCountryIndexChanged.next(this.curCountryIndex);
    this.points = 100;
    this.pointsChanged.next(this.points);
    this.totalPoints = 0;
    this.totalPointsChanged.next(this.totalPoints);
  }

  public async initializeData() {
    await this.getData();
    this.getRandomMatchCountries();
  }

  public newGame() {
    this.getRandomMatchCountries();
  }

  private getRegionData(region: string) {
    const countriesByRegion = this.allCountries.filter((c: any) => {
        return c.region === region && c.translations.por.common !== this.curCountry.translations.por.common;
      });
    var index;
    const options = [];
    for (let i = 0; i < 3; i++) {
      index = Math.floor(Math.random() * countriesByRegion.length);
      options.push(countriesByRegion[index]?.translations.por.common != null ? countriesByRegion[index].translations.por.common : 'Brasil');
      countriesByRegion.splice(index, 1);
    }
    options.push(this.curCountry.translations.por.common);
    return this.shuffle(options);
  }

  private shuffle(arr: any[]) {
    let currentIndex = arr.length;
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex],
        arr[currentIndex],
      ];
    }

    return arr;
  }

  public getAnswerOptions(subregion: string) {
    let opt = this.getRegionData(subregion);
    return opt;
  }

  public getBordersCountries(borders: string[]) {
    if (borders == null) { return [] }
    const bordersNames = [];
    for (let i = 0; i < borders.length; i++) {
        bordersNames.push(this.allCountries.filter((c: any) => {return c.cca3 == borders[i]})[0]?.translations.por.common);
    }
    return bordersNames;
  }

  public onOpenHint(hint: 'f' | 'c' | 'b') {
    this.points = this.points - (hint === 'f' ? this._flagCost : hint === 'c' ? this._capitalCost : this._bordersCost);
    this.pointsChanged.next(this.points);
  }

  public onUserAnswer(guess: string) {
    if (guess === this.curCountry.translations.por.common) {
      this.totalPoints = this.totalPoints + this.points;
      this.totalPointsChanged.next(this.totalPoints);
    }

    this.points = 100;
    this.pointsChanged.next(this.points);

    if (this.curCountryIndex < this._matchSize - 1) {
      this.getNextCountry();
    } else {
      this.finishGame();
    }
  }

  private getNextCountry() {
    this.displayCorrectAnswer.next(true);
    setTimeout(() => {
      this.displayCorrectAnswer.next(false);
      this.curCountryIndex = this.curCountryIndex + 1;
      this.curCountryIndexChanged.next(this.curCountryIndex);
      this.curCountry = this.curGameCountries[this.curCountryIndex];
      this.curCountryChanged.next(this.curCountry);
    }, this._timeInterval);
    // this.curCountryIndex = this.curCountryIndex + 1;
    // this.curCountryIndexChanged.next(this.curCountryIndex);
    // this.curCountry = this.curGameCountries[this.curCountryIndex];
    // this.curCountryChanged.next(this.curCountry);
  }

  private finishGame() {
    this.displayCorrectAnswer.next(true);
    this.matchOver = true;
    this.isMatchOver.next(this.matchOver);
    // localStorage.setItem("", this.totalPoints);
    //TODO: salvar no firebase as 10 maiores pontuações
  }
}
