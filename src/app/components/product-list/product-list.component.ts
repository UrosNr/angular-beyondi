import { Component, inject } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  products: Product[] = [];
  private productService = inject(ProductService);
  private router = inject(Router);

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.products = products;
    });
  }

  addProduct(): void{
    this.router.navigate(['/products/new']);
  }
}
