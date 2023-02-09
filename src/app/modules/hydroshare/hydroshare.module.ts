import {  NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TestComponent } from "./test/test.component";
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from "@angular/forms";
import { HSGuard } from "./hydroshare.guard";
import { OauthloginComponent } from './components/oauthlogin/oauthlogin.component';

@NgModule({
  declarations: [TestComponent, LoginComponent, OauthloginComponent],
  imports: [CommonModule, FormsModule],
  exports: [TestComponent, LoginComponent],
  providers: [HSGuard]
})

export class HydroshareModule {}
