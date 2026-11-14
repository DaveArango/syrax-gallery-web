import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {}