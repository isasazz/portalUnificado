import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartelaraStandbyService } from '../../services/cartelera-standby.service';

@Component({
  selector: 'app-cartelera-standby-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cartelera-standby-dashboard.component.html',
  styleUrl: './cartelera-standby-dashboard.component.scss'
})
export class CartelaraStandbyDashboardComponent implements OnInit {
  titulo = 'Dashboard Cartelera de Standby';
  
  constructor(private cartelaraStandbyService: CartelaraStandbyService) {}

  ngOnInit(): void {
    // Inicialización del componente
  }
}
