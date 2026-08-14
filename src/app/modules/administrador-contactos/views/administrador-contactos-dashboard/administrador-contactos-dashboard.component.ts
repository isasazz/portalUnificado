import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdministradorContactosService } from '../../services/administrador-contactos.service';

@Component({
  selector: 'app-administrador-contactos-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './administrador-contactos-dashboard.component.html',
  styleUrl: './administrador-contactos-dashboard.component.scss'
})
export class AdministradorContactosDashboardComponent implements OnInit {
  titulo = 'Dashboard Administrador de Contactos';
  
  constructor(private administradorContactosService: AdministradorContactosService) {}

  ngOnInit(): void {
    // Inicialización del componente
  }
}
