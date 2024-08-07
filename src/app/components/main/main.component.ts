import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  matchSize = 0;
  flagCost = 0;
  capitalCost = 0;
  bordersCost = 0;
  timeInterval = 0;
  country: any;
  options: string[] = [];
  borders: string[] = [];
  isFlagHidden = true;
  isCapitalHidden = true;
  isBordersHidden = true;
  imgHiddenPath = 'assets/eye-slash-solid.svg';
  imgHoverPath = 'assets/eye-solid.svg';
  imgHints = [this.imgHiddenPath, this.imgHiddenPath, this.imgHiddenPath];
  points = 0;
  totalPoints = 0;
  countryIndex = 0;
  matchOver = false;
  @ViewChild('firstFocus') flagHiddenEl!: ElementRef;
  showCorrectAnswer = false;
  clickable = true;

  constructor(private service: GameService) {}

  ngOnInit(): void {
    this.matchSize = this.service.getMatchSize();
    this.flagCost = this.service.getFlagCost();
    this.capitalCost = this.service.getCapitalCost();
    this.bordersCost = this.service.getBordersCost();
    this.timeInterval = this.service.getTimeInterval();

    this.service.curCountryChanged.subscribe((country: any) => {
      this.country = country;
      this.options = this.service.getAnswerOptions(this.country.region);
      this.borders = this.service.getBordersCountries(this.country.borders);
    });

    this.service.pointsChanged.subscribe((p: number) => {
      this.points = p;
    });

    this.service.totalPointsChanged.subscribe((p: number) => {
      this.totalPoints = p;
    });

    this.service.curCountryIndexChanged.subscribe((index: number) => {
      this.countryIndex = index;
    });

    this.service.isMatchOver.subscribe((finished: boolean) => {
      this.matchOver = finished;
    });

    this.service.displayCorrectAnswer.subscribe((display: boolean) => {
      this.showCorrectAnswer = display;
    });
  }

  openHint(hint: 'f' | 'c' | 'b') {
    if (hint === 'f') {
      this.isFlagHidden = false;
    } else if (hint === 'c') {
      this.isCapitalHidden = false;
    } else {
      this.isBordersHidden = false;
    }
    this.service.onOpenHint(hint);
  }

  bordersToString() {
    if (this.borders.length === 0) {
      return 'Não possui fronteiras com outro país.';
    }
    var bordersStr = this.borders.join(', ');
    return bordersStr;
  }

  onGuess(i: number) {
    this.service.onUserAnswer(this.options[i]);

    this.isFlagHidden = false;
    this.isCapitalHidden = false;
    this.isBordersHidden = false;
    this.clickable = false;

    if (!this.matchOver) {
      this.imgHints = this.imgHints.fill(this.imgHiddenPath);
      setTimeout(() => {
        this.isFlagHidden = true;
        this.isCapitalHidden = true;
        this.isBordersHidden = true;
        this.clickable = true;
        this.flagHiddenEl.nativeElement.focus();
      }, this.timeInterval);
    }
  }
}
