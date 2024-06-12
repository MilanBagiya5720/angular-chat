import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  constructor(private toastr: ToastrService) {}

  success(title: string, desc: string = '') {
    this.toastr.success(title, desc, {
      timeOut: 3000,
    });
  }

  error(title: string, desc: string = '') {
    this.toastr.error(title, desc, {
      timeOut: 3000,
    });
  }

  warn(title: string, desc: string = '') {
    this.toastr.warning(title, desc, {
      timeOut: 3000,
    });
  }

  info(title: string, desc: string = '') {
    this.toastr.info(title, desc, {
      timeOut: 3000,
    });
  }
}
