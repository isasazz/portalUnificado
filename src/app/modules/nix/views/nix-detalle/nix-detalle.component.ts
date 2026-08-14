import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NixService, NixItem } from '../../services/nix.service';

@Component({
  selector: 'app-nix-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nix-detalle.component.html',
  styleUrl: './nix-detalle.component.scss'
})
export class NixDetalleComponent implements OnInit {
  formulario!: FormGroup;
  itemId: number | null = null;
  cargando = false;
  guardando = false;
  titulo = 'Nuevo Item';

  constructor(
    private fb: FormBuilder,
    private nixService: NixService,
    private route: ActivatedRoute
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.itemId = params['id'];
        this.cargarItem();
        this.titulo = 'Editar Item';
      }
    });
  }

  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      estado: ['activo', Validators.required]
    });
  }

  private cargarItem(): void {
    if (!this.itemId) return;

    this.cargando = true;
    this.nixService.obtenerPorId(this.itemId).subscribe({
      next: (item) => {
        this.formulario.patchValue(item);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar item:', error);
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) return;

    this.guardando = true;
    const itemData = this.formulario.value;

    if (this.itemId) {
      this.nixService.actualizar(this.itemId, itemData).subscribe({
        next: () => {
          alert('Item actualizado exitosamente');
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.guardando = false;
        }
      });
    } else {
      this.nixService.crear(itemData).subscribe({
        next: () => {
          alert('Item creado exitosamente');
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.guardando = false;
        }
      });
    }
  }
}
