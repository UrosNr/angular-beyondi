import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  product: Product = { id: '', name: '', price: 0, description: '' };
  isNewProduct: boolean = true; // Flag to determine if it's a new product or editing existing

  private toastr = inject(ToastrService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (productId) {
        this.isNewProduct = false;
        this.productService.getProductById(productId).subscribe((product) => {
          if (product) {
            this.product = product;
          } else {
            this.router.navigate(['/products']);
          }
        });
      }
    });
  }

  submitForm(): void {
    if (this.isNewProduct) {
      this.productService
        .addProduct(this.product)
        .then(() => {
          this.toastr.success('Successfully added product');
          this.router.navigate(['/products']);
        })
        .catch((error) => {
          this.toastr.error(error.message);
        });
    } else {
      this.productService
        .updateProduct(this.product.id, this.product)
        .then(() => {
          this.toastr.success('Successfully updated product');
          this.router.navigate(['/products', this.product.id]);
        })
        .catch((error) => {
          this.toastr.error(error.message);
        });
    }
  }

  cancel(): void {
    if (this.isNewProduct) {
      this.router.navigate(['/products']);
    }else{
      this.router.navigate(['/products', this.product.id]);
    }
  }
}
