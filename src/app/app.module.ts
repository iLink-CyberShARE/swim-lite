/** Angular Components */
import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AngularMaterialModule } from "./angular-material.module";

/** SWIM Modules */
import { NlngModule } from "./modules/nlng/nlng.module";
import { HydroshareModule } from "./modules/hydroshare/hydroshare.module";

/** SWIM Components */

// Dynamic Pages
import { HeaderComponent } from "./views/templates/header/header.component";
import { FooterComponent } from "./views/templates/footer/footer.component";
import { SidenavListComponent } from "./views/templates/sidenav-list/sidenav-list.component";
import { HomeComponent } from "./views/pages/home/home.component";
import { WB2LandingComponent } from "./views/pages/wb2-landing/wb-landing.component";
import { PolicyComponent } from "./views/pages/policy/policy.component";
import { HelpComponent } from "./views/pages/help/help.component";
import { FirstsplashComponent } from "./views/pages/firstsplash/firstsplash.component";
import { SecondsplashComponent } from "./views/pages/secondsplash/secondsplash.component";

// Auth
import { RegisterComponent } from "./auth/register/register.component";
import { ChangePasswordComponent } from "./auth/change-password/change-password.component";

// Hydroshare
import { HsFormComponent } from './modules/hydroshare/components/hs-form/hs-form.component';

// Non-Static Views
import { CreateScenarioComponent } from "./views/dynamic/create-scenario/create-scenario.component";
import { CannedScenariosComponent } from "./views/dynamic/canned-scenarios/canned-scenarios.component";
import { OutputCatalogComponent } from "./views/dynamic/output-catalog/output-catalog.component";
import { OutputDetailComponent } from "./views/dynamic/output-detail/output-detail.component";
import { ScenarioThemeComponent } from "./views/dynamic/scenario-theme/scenario-theme.component";
import { ThemeDetailComponent } from "./views/dynamic/theme-detail/theme-detail.component";
import { InputDetailComponent } from "./views/dynamic/input-detail/input-detail.component";
import { InputCatalogComponent } from "./views/dynamic/input-catalog/input-catalog.component";
import { PublicScenariosComponent } from "./views/dynamic/public-scenarios/public-scenarios.component";
import { PrivateScenariosComponent } from "./views/dynamic/private-scenarios/private-scenarios.component";
import { CrossCompareComponent } from "./views/dynamic/cross-compare/cross-compare.component";

// Widgets
import { RunDialogComponent } from "./views/dynamic/run-dialog/run-dialog.component";
import { StarRateComponent } from "./widgets/star-rate/star-rate.component";
import { StarRatingComponent } from "./widgets/star-rating/star-rating.component";
import { MetadataDialogComponent } from "./widgets/metadata-dialog/metadata-dialog.component";
import { LinkDialogComponent } from "./widgets/link-dialog/link-dialog.component";
import { MetadataBoxComponent } from "./widgets/metadata-box/metadata-box.component";
import { SummaryBoxComponent } from "./widgets/summary-box/summary-box.component";
import { CanDialogComponent } from "./widgets/can-dialog/can-dialog.component";
import { CompareDialogComponent } from "./widgets/compare-dialog/compare-dialog.component";
import { RoleDialogComponent } from "./widgets/role-dialog/role-dialog.component";
import { TimeRangeDialogComponent } from "./widgets/time-range-dialog/time-range-dialog.component";

// Error views
import { ErrorComponent } from "./views/errors/error/error.component";
import { NoRecordsComponent } from "./views/errors/norecords/norecords.component";
import { UnauthorizedComponent } from "./views/errors/unauthorized/unauthorized.component";

// authentication components
import { AuthComponent } from "./auth/auth.component";
import { AuthService } from "./auth/auth.service";
import { AuthGuard } from "./auth/auth.guard";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthInterceptorService } from "./auth/auth-interceptor.service";

// service components
import { ModelCatalogService } from "./services/model-catalog.service";
import { ParameterService } from "./services/parameter.service";
import { OutputService } from "./services/output.service";
import { ThemeCatalogService } from "./services/theme-catalog.service";
import { SetCatalogService } from "./services/set-catalog.service";
import { ModelRunService } from "./services/model-run.service";
import { AcronymCatalogService } from "./services/acronym-catalog.service";
import { RecommenderService } from "./services/recommender.service";
import { CannedScenariosService } from "./services/canned-scenarios.service";
import { LoggerService } from "./services/logger.service";
import { CustomScenariosService } from "./services/custom-scenarios.service";
import { SummaryCatalogService } from "./services/summary-catalog.service";
import { ErrorHandlerService } from "./services/error-handler.service";
import { OptionCatalogService } from "./services/option-catalog.service";

// pipes
import { DotToDatePipe } from "./pipes/dot-to-date.pipe";

/**  Third-party Components */
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FlexLayoutModule } from "@angular/flex-layout";
import { AgGridModule } from "ag-grid-angular";
import { ChartsModule } from "ng2-charts";
import { GaugeChartModule } from "angular-gauge-chart";
import {
  NgcCookieConsentModule,
  NgcCookieConsentConfig,
} from "ngx-cookieconsent";

/** Cookie consent settings */
const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: window.location.hostname,
  },
  palette: {
    popup: {
      background: "#000",
    },
    button: {
      background: "#ff4081",
      text: "#ffffff",
    },
  },
  position: "top-right",
  theme: "edgeless",
  type: "opt-in",
  content: {
    message:
      "SWIM uses cookies to manage user credentials and to access modeling features. If you select deny, you will not be able to access some of the platform's features. Please select an option to continue.",
    dismiss: "Accept",
    allow: "Allow",
    deny: "Deny",
    link: "Learn more...",
    href: "https://swim.cybershare.utep.edu/en/policy",
    policy: "Cookie Agreement",
  },
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidenavListComponent,
    HomeComponent,
    WB2LandingComponent,
    AuthComponent,
    RegisterComponent,
    CannedScenariosComponent,
    CreateScenarioComponent,
    OutputCatalogComponent,
    InputCatalogComponent,
    InputDetailComponent,
    RunDialogComponent,
    OutputDetailComponent,
    StarRateComponent,
    ScenarioThemeComponent,
    ThemeDetailComponent,
    StarRatingComponent,
    ErrorComponent,
    PolicyComponent,
    HelpComponent,
    PublicScenariosComponent,
    MetadataDialogComponent,
    DotToDatePipe,
    LinkDialogComponent,
    MetadataBoxComponent,
    SummaryBoxComponent,
    PrivateScenariosComponent,
    NoRecordsComponent,
    CanDialogComponent,
    UnauthorizedComponent,
    CompareDialogComponent,
    CrossCompareComponent,
    ChangePasswordComponent,
    RoleDialogComponent,
    TimeRangeDialogComponent,
    FirstsplashComponent,
    SecondsplashComponent,
    HsFormComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FontAwesomeModule,
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
    ChartsModule,
    GaugeChartModule,
    NgcCookieConsentModule.forRoot(cookieConfig),
    NlngModule,
    HydroshareModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    ModelCatalogService,
    ParameterService,
    OutputService,
    ModelRunService,
    AcronymCatalogService,
    RecommenderService,
    ThemeCatalogService,
    SetCatalogService,
    CannedScenariosService,
    LoggerService,
    CustomScenariosService,
    SummaryCatalogService,
    ErrorHandlerService,
    OptionCatalogService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
