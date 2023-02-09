import { NgModule } from "@angular/core";
import { Routes, RouterModule, CanActivate } from "@angular/router";
import { HomeComponent } from "./views/pages/home/home.component";
import { RegisterComponent } from "./auth/register/register.component";
import { CannedScenariosComponent } from "./views/dynamic/canned-scenarios/canned-scenarios.component";
import { CreateScenarioComponent } from "./views/dynamic/create-scenario/create-scenario.component";
import { OutputCatalogComponent } from "./views/dynamic/output-catalog/output-catalog.component";
import { ErrorComponent } from "./views/errors/error/error.component";
import { PolicyComponent } from "./views/pages/policy/policy.component";
import { HelpComponent } from "./views/pages/help/help.component";
import { PublicScenariosComponent } from "./views/dynamic/public-scenarios/public-scenarios.component";
import { PrivateScenariosComponent } from "./views/dynamic/private-scenarios/private-scenarios.component";
import { AuthGuard } from "./auth/auth.guard";
import { NoRecordsComponent } from "./views/errors/norecords/norecords.component";
import { UnauthorizedComponent } from "./views/errors/unauthorized/unauthorized.component";
import { ChangePasswordComponent } from "./auth/change-password/change-password.component";
import { WB2LandingComponent } from "./views/pages/wb2-landing/wb-landing.component";
import { FirstsplashComponent } from "./views/pages/firstsplash/firstsplash.component";
import { SecondsplashComponent } from "./views/pages/secondsplash/secondsplash.component";
import { TestComponent } from "./modules/hydroshare/test/test.component";
import { LoginComponent } from "./modules/hydroshare/components/login/login.component";
import { HsFormComponent } from "./modules/hydroshare/components/hs-form/hs-form.component";
import { HSGuard } from "./modules/hydroshare/hydroshare.guard";
import { OauthloginComponent } from "./modules/hydroshare/components/oauthlogin/oauthlogin.component";

const appRoutes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "wb2-intro", component: WB2LandingComponent },
  { path: "register", component: RegisterComponent },
  { path: "canned-scenarios", component: CannedScenariosComponent },
  { path: "create-scenario/:modelId", component: CreateScenarioComponent },
  { path: "can-scenario/:canId", component: CreateScenarioComponent },
  {
    path: "load-scenario/:runId/:roleName",
    component: CreateScenarioComponent,
  },
  { path: "load-scenario/:runId", component: CreateScenarioComponent },
  { path: "load-hs-scenario/:hsId", component: CreateScenarioComponent },
  { path: "output-catalog", component: OutputCatalogComponent },
  { path: "error-page/:errorMessage", component: ErrorComponent },
  { path: "norecords-page/:errorMessage", component: NoRecordsComponent },
  { path: "unauthorized-page/:errorMessage", component: UnauthorizedComponent },
  { path: "policy", component: PolicyComponent },
  { path: "help", component: HelpComponent },
  { path: "public", component: PublicScenariosComponent },
  { path: "first-splash", component: FirstsplashComponent },
  { path: "second-splash", component: SecondsplashComponent },
  { path: "hs-test", component: TestComponent },
  { path: "hs-login", component: LoginComponent, canActivate: [AuthGuard] },
  {
    path: "hs-oauthlogin",
    component: OauthloginComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "hs-oauthlogin/:token/:exp",
    component: OauthloginComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "hs-form/:scenarioID",
    component: HsFormComponent,
    canActivate: [HSGuard],
  },
  {
    path: "private",
    component: PrivateScenariosComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "changepass",
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
  },
  { path: "**", component: HomeComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      scrollPositionRestoration: "enabled",
      relativeLinkResolution: "legacy",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
