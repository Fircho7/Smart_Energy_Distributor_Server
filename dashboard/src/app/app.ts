import { Component } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MockDataService } from './services/mock-data.service';

@Component({

  selector: 'app-root',

  standalone: true,

  imports: [RouterOutlet, RouterLink, RouterLinkActive],

  templateUrl: './app.html',

  styleUrl: './app.css'

})

export class App {

  constructor(public mockData: MockDataService) {}

}
