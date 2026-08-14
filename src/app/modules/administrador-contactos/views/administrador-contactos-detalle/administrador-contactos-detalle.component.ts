import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdministradorContactosService, Contacto } from '../../services/administrador-contactos.service';

@Component({
  selector: 'app-administrador-contactos-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './administrador-contactos-detalle.component.html',
  styleUrl: './administrador-contactos-detalle.component.scss'
})
export class AdministradorContactosDetalleComponent implements OnInit {
  formulario!: FormGroup;
  contactoId: number | null = null;
  cargando = false;
  guardando = false;
  titulo = 'Nuevo Contacto';

  constructor(
    private fb: FormBuilder,
    private administradorContactosService: AdministradorContactosService,
    private route: ActivatedRoute
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.contactoId = params['id'];
        this.cargarContacto();
        this.titulo = 'Editar Contacto';
      }
    });
  }

  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10,}$/)]],
      empresa: ['', Validators.required],
      estado: ['activo', Validators.required]
    });
  }

  private cargarContacto(): void {
    if (!this.contactoId) return;

    this.cargando = true;
    this.administradorContactosService.obtenerPorId(this.contactoId).subscribe({
      next: (contacto) => {
        this.formulario.patchValue(contacto);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar contacto:', error);
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) return;

    this.guardando = true;
    const contactoData = this.formulario.value;

    if (this.contactoId) {
      this.administradorContactosService.actualizar(this.contactoId, contactoData).subscribe({
        next: () => {
          alert('Contacto actualizado exitosamente');
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.guardando = false;
        }
      });
    } else {
      this.administradorContactosService.crear(contactoData).subscribe({
        next: () => {
          alert('Contacto creado exitosamente');
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
