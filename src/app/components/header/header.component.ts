import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  theme: 'light' | 'dark' = 'light';

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.getTheme();
  }

  getTheme() {
    this.theme = localStorage.getItem('geoTheme') === 'dark' ? 'dark' : 'light';
  }
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('geoTheme', this.theme);
  }
}
