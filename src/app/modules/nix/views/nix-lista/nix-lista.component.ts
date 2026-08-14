import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NixService, NixItem } from '../../services/nix.service';

@Component({
  selector: 'app-nix-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nix-lista.component.html',
  styleUrl: './nix-lista.component.scss'
})
export class NixListaComponent implements OnInit {
  items: NixItem[] = [];
  cargando = false;

  constructor(private nixService: NixService) {}

  ngOnInit(): void {
    this.cargarItems();
  }

  private cargarItems(): void {
    this.cargando = true;
    this.nixService.obtenerTodos().subscribe({
      next: (data) => {
        this.items = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        this.cargando = false;
      }
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
      this.nixService.eliminar(id).subscribe({
        next: () => {
          this.items = this.items.filter(item => item.id !== id);
        },
        error: (error) => console.error('Error al eliminar:', error)
      });
    }
  }
}
