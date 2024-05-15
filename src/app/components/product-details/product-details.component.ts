import { Component, OnDestroy, inject } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnDestroy {


  product: Product | undefined;
  private productService =inject(ProductService);
  private route = inject(ActivatedRoute);
  private router =inject(Router);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  user: User |null| undefined = undefined;
  private userSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.productService.getProductById(productId).subscribe(product => {
        this.product = product;
      });
    });
    this.userSubscription = this.authService.getUser().subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  deleteProduct(): void {
    if (this.product) {
      this.productService.deleteProduct(this.product.id).then(() => {
        // Navigate back to the product list after deletion
        this.toastr.success('Successfully deleted product');
        this.router.navigate(['/products']);
      }).catch(error => {
        this.toastr.error('Error deleting product');
      });
    }
  }
}
