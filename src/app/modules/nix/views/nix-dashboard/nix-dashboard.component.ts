import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NixService } from '../../services/nix.service';

@Component({
  selector: 'app-nix-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nix-dashboard.component.html',
  styleUrl: './nix-dashboard.component.scss'
})
export class NixDashboardComponent implements OnInit {
  titulo = 'Dashboard NIX';
  
  constructor(private nixService: NixService) {}

  ngOnInit(): void {
    // Inicialización del componente
  }
}
