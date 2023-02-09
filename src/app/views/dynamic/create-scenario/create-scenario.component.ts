import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Subscription, pipe, from, zip, of } from "rxjs";
import { groupBy, mergeMap, filter } from "rxjs/operators";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatStepper } from "@angular/material/stepper";
import * as uuid from "uuid";
import { Router } from "@angular/router";

// Data Models
import { ModelCatalog } from "../../../models/model-catalog.model";
import { Parameter } from "../../../models/parameter.model";
import { ModelOutput } from "../../../models/output.model";
import { Theme } from "../../../models/theme.model";
import { Set } from "../../../models/set.model";

// Services
import { ModelCatalogService } from "src/app/services/model-catalog.service";
import { ParameterService } from "../../../services/parameter.service";
import { OutputService } from "../../../services/output.service";
import { UserScenario } from "src/app/models/user-scenario";
import { ModelRunService } from "../../../services/model-run.service";
import { ThemeCatalogService } from "../../../services/theme-catalog.service";
import { AcronymCatalogService } from "src/app/services/acronym-catalog.service";
import { SetCatalogService } from "../../../services/set-catalog.service";
import { CannedScenariosService } from "../../../services/canned-scenarios.service";
import { SummaryCatalogService } from "../../../services/summary-catalog.service";

// Dialogs
import { RunDialogComponent } from "../run-dialog/run-dialog.component";
import { CannedScenario } from "src/app/models/canned-scenario.model";
import { CustomScenariosService } from "src/app/services/custom-scenarios.service";
import { Overview } from "src/app/models/overview.model";
import { ErrorHandlerService } from "src/app/services/error-handler.service";
import { RecommenderService } from "src/app/services/recommender.service";
import { TimeRangeDialogComponent } from "src/app/widgets/time-range-dialog/time-range-dialog.component";

/**
 * Parent component for the creation of model scenarios, execution and visualization.
 * Takes care of manageing the user workflow and communication within other child components.
 */
@Component({
  selector: "app-create-scenario",
  templateUrl: "./create-scenario.component.html",
  styleUrls: ["./create-scenario.component.css"],
})
export class CreateScenarioComponent implements OnInit, OnDestroy {
  /**
   * Scenario Component Class Constructor
   * @param modelCatalogService model catalog service
   * @param parameterService parameter/model input service
   * @param outputService output catalog service
   * @param route routing
   * @param modelRunService model execution services
   * @param acronymCatalogService acronym catalog service
   * @param themeCatalogService theme catalog service
   * @param setCatalogService set catalog service
   * @param dialog dialog windows
   * @param cannedScenariosService service for canned scenario filters
   * @param summaryCatalogService service for result summary specification
   * @param errorHandlerService service for error handling and logs
   */
  constructor(
    public modelCatalogService: ModelCatalogService,
    public parameterService: ParameterService,
    public outputService: OutputService,
    public route: ActivatedRoute,
    public modelRunService: ModelRunService,
    public acronymCatalogService: AcronymCatalogService,
    public themeCatalogService: ThemeCatalogService,
    public setCatalogService: SetCatalogService,
    public dialog: MatDialog,
    public cannedScenariosService: CannedScenariosService,
    private router: Router,
    private customScenariosService: CustomScenariosService,
    private summaryCatalogService: SummaryCatalogService,
    private errorHandlerService: ErrorHandlerService,
    private recommenderService: RecommenderService
  ) {}

  /** Optional attribute when loading a canned scenario */
  cannedScenario: CannedScenario;
  isCannedScenario = false;

  /** Show Navigation Bar */
  showNavigation = true;
  showNavigationInput = true;

  /** Flag to show or not the input catalog */
  showInputCatalog = false;

  /** Activate linear angular-material stepper type */
  isLinear = true;

  /** Loading screen activation flag */
  isLoading = false;

  /** Loading screen notification label */
  loadingLabel = "";

  /* Minutes labels on model run loading screen (hardcoded) */
  private minutesLabel = [
    "Execution will take a couple of minutes...",
    "Ejecución tomará un par de minutos...",
  ];

  /** Seconds labels on model run loading screen (hardcoded) */
  private secondsLabel = [
    "Execution will take a few seconds...",
    "Ejecución tomará algunos segundos...",
  ];

  /** Language presentation index (english/spanish) */
  lanIndex = 0;

  /** load recommender roles and items */
  loadRecommenderDone = false;
  /** load sets monitor */
  loadSetsDone = false;
  /** load scenario themes monitor */
  loadThemesDone = false;
  /** load input catalog monitor */
  loadParametersDone = false;
  /** load output catalog monitor */
  loadOutputsDone = false;
  /** load summary catalog monitor */
  loadSummariesDone = false;
  /** model execution monitor */
  executionDone = false;

  /** Currently used model id */
  private modelId: string;

  /** Empty initial sctructure of user scenario specification */
  userScenario: UserScenario = {
    id: "",
    name: "",
    description: "",
    status: "ready",
    timestep: "year",
    isPublic: true,
  };

  /** Catalog of available models in SWIM */
  modelCatalog: ModelCatalog[] = [];
  /** Metadata for selected model to interact with  */
  model: ModelCatalog = null;

  /** Paramater catalog of the currently selected model */
  parameterCatalog: Parameter[] = [];
  /** Monitor changes in the parameter catalog */
  private parameterCatSub: Subscription;

  /** Set catalog of the currently selected model (GAMS only) */
  setCatalog: Set[] = [];
  /** Monitor changes in the set catalog */
  private setCatSub: Subscription;

  /** Model output catalog  */
  outputCatalog: ModelOutput[] = [];
  /** Monitor changes in the model output catalog */
  private outputCatSub: Subscription;

  /** Currently selected scenario category */
  selectedScenarioCat = "";
  /** Scenario themes catalog */
  themeCatalog: Theme[] = [];
  /** Monitor changes in the scenario themes catalog */
  private themeCatSub: Subscription;

  /** result summary catalog */
  summaryCatalog: Overview[] = [];
  /** monitor changes in result summary catalog */
  private summaryCatSub: Subscription;

  /** Currently selected custom input category */
  selectedInputCat = "";
  /** Categories for user changeable inputs */
  inputUserCategories: string[] = [];
  /** Categories for scenario themes */
  inputScenarioCategories: string[] = [];

  /** List of scenario themes from a selected category */
  themesCustomizeList: Theme[] = [];

  /** List of parameters that are user changeable from a selected category */
  inputCustomizeList: Parameter[] = [];

  /** Subscription to scenario run response */
  private runSub: Subscription;

  /** Access to the workflow stepper widget on the view */
  @ViewChild("stepper") workFlow: MatStepper;

  /**
   *  Component initialization function.
   *  Will load target model metadata, parameter, outputs, sets and settings.
   */
  ngOnInit() {
    try {
      this.route.paramMap.subscribe((paramMap: ParamMap) => {
        if (
          paramMap.has("modelId") ||
          paramMap.has("canId") ||
          paramMap.has("runId") ||
          paramMap.has("hsId")
        ) {
          this.isLoading = true;
          this.outputService.resetFilter(); // very important to place this here
          this.modelRunService.setToolStatus(false); // reset hide tools option
          this.recommenderService.getOutputList();
          this.recommenderService.getRoleList();

          // load for creating new user scenario
          if (paramMap.has("modelId")) {
            console.log("Preparing for New Scenario...");
            this.modelId = paramMap.get("modelId");
            this.modelRunService.modelServicePing(this.modelId);
            this.loadModel();
            this.modelRunService.resetScenarioDescription();
            // load canned scenario
          } else if (paramMap.has("canId")) {
            // get canned scenario
            console.log("Loading canned scenario...");
            this.cannedScenariosService
              .getCannedScenario(paramMap.get("canId"))
              .subscribe(
                (data) => {
                  this.cannedScenario = data.result[0];
                  this.modelId = this.cannedScenario.modelID;
                  this.isCannedScenario = true;
                  this.modelRunService.setToolStatus(
                    this.cannedScenario.hideTools
                  );
                  this.modelRunService.setScenarioDescription("");
                  this.loadHistoricModel(this.cannedScenario.scenarioID);
                },
                (error) => {
                  this.errorHandlerService.handleHttpError(error);
                }
              );
          } else if (paramMap.has("runId")) {
              console.log("Loading historic run...");
              this.modelRunService.setScenarioDescription("");
              this.loadHistoricModel(paramMap.get("runId"));
              this.modelRunService.setUserRole(paramMap.get("roleName"));
          } else if (paramMap.has("hsId")){
            console.log("Loading historic run from hydroshare id...");
            this.modelRunService.setScenarioDescription("");
            // Subscribe to this call
            this.customScenariosService.GetScenarioId(paramMap.get("hsId"))
            .subscribe(
              (data) => {
                this.loadHistoricModel(data.result[0]['scenario_id']);
              },
              (error) => {
                this.errorHandlerService.handleHttpError(error);
              }
            );
          }
        } else {
          this.router.navigate(["/error-page", "No page parameters received."]);
        }
      });
    } catch (error) {
      this.errorHandlerService.handleAngularError(error);
      this.router.navigate(["/error-page", "Something weird happened =("]);
    }
  }

  /**
   * Loads data from a previously executed model
   */
  private loadHistoricModel(runId: string) {
    // load full scenario from the database
    this.customScenariosService.GetScenario(runId).subscribe(
      (response) => {
        const id = response.result._id;
        delete response.result._id;
        this.userScenario = response.result;
        this.userScenario.id = id;
        this.modelId = this.userScenario.modelSettings[0].modelID;

        // subscription to summaries catalog
        this.SummaryCatalogSubscribe();

        // filter out the output catalog if it is a canned scenario
        if (typeof this.cannedScenario !== "undefined") {
          console.log("Filtering Canned Outputs");
          const auxOutputs = [];
          response.result.modelOutputs.forEach((item: ModelOutput) => {
            if (this.cannedScenario.outputFilter.includes(item.varName, 0)) {
              auxOutputs.push(item);
            }
          });
          this.userScenario.modelOutputs = auxOutputs;
          this.summaryCatalogService.GetSummaryCatalog(this.modelId);
        }

        // get recommended outputs for this user role
        this.loadTop10Recommendations();

        // load model metadata
        this.LoadModelMeta();

        this.acronymCatalogService.getAcronymCatalog(this.modelId, "en-us");

        // update the scenario on model runner service
        this.modelRunService.updateModelScenario(this.userScenario);

        // define model sets
        this.SetSubscribe();
        this.setCatalogService.setSetCatalog(this.userScenario.modelSets);

        // get the scenario theme catalogs
        this.ThemeCatalogSubscribe();
        console.log(this.modelId);
        this.themeCatalogService.getThemeCatalog(this.modelId);

        // define the parameter catalog
        this.ParametersSubscribe();
        this.parameterService.setParameterCatalog(
          this.userScenario.modelInputs
        );

        //  define the output catalog
        this.loadOutputsDone = false;
        this.SubscribeOutputs();
        this.outputService.setOutputCatalog(this.userScenario.modelOutputs);

        this.executionDone = true;
      },
      (error) => {
        this.errorHandlerService.handleHttpError(error);
      }
    );
  }

  /**
   * Load the model metadata
   */
  private LoadModelMeta() {
    this.modelCatalogService.getModel(this.modelId).subscribe(
      (modelData) => {
        this.model = {
          id: modelData.result[0]._id,
          modelName: modelData.result[0].modelName,
          modelDescription: modelData.result[0].modelDescription,
          info: modelData.result[0].info,
          dateCreated: new Date(modelData.result[0].dateCreated),
          dateModified: new Date(modelData.result[0].dateModified),
          softwareAgent: modelData.result[0].softwareAgent,
          license: modelData.result[0].license,
          version: modelData.result[0].version,
          sponsor: modelData.result[0].sponsor,
          creators: modelData.result[0].creators,
          hostServer: modelData.result[0].hostServer,
          serviceInfo: modelData.result[0].serviceInfo,
        };
      },
      (error) => {
        this.errorHandlerService.handleHttpError(error);
      }
    );
  }

  /**
   * Subscribe to changes in set catalog
   */
  private SetSubscribe() {
    this.setCatSub = this.setCatalogService
      .getSetUpdateListener()
      .subscribe((setCatalog: Set[]) => {
        if (setCatalog === null) {
          // workaround for set bug
          setCatalog = [];
        }
        this.setCatalog = setCatalog;
        this.loadSetsDone = true;
        this.afterDataLoad();
      });
  }

  /**
   * Subscribtion handler with theme catalog
   */
  private ThemeCatalogSubscribe() {
    try {
      this.themeCatSub = this.themeCatalogService
        .getThemeUpdateListener()
        .subscribe((themeCatalog: Theme[]) => {
          this.lanIndex = this.themeCatalogService.lanIndex;
          this.themeCatalog = themeCatalog;
          const tSource = from(this.themeCatalog);

          tSource
            .pipe(
              groupBy(
                (themes) =>
                  themes.info[this.themeCatalogService.lanIndex].category
              ),
              mergeMap((group) => zip(of(group.key)))
            )
            .subscribe((category) =>
              this.inputScenarioCategories.push(category[0])
            );
          this.loadThemesDone = true;
          this.afterDataLoad();
        });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Mark the themes used on a loaded scenario
   */
  private SetSelectedThemes() {
    try {
      if (typeof this.userScenario.modelSettings !== "undefined") {
        this.themeCatalogService.resetAllSelections();
        this.userScenario.modelSettings.forEach((object) => {
          Object.keys(object).forEach((k) => {
            if (k === "theme") {
              // console.log(object[k]);
              this.themeCatalogService.setSelected2(object[k]);
            }
          });
        });
      }
    } catch (error) {
      this.errorHandlerService.handleAngularError(error);
    }
  }

  /**
   * Subscription handler with summary catalog
   */
  private SummaryCatalogSubscribe() {
    this.summaryCatSub = this.summaryCatalogService
      .GetSummaryUpdateListener()
      .subscribe((summaryCatalog: Overview[]) => {
        this.summaryCatalog = summaryCatalog;
        const names = [];
        const recommenderList = this.recommenderService.getRecommendationList();
        recommenderList.forEach((x) => {
          names.push(x["item_name"]);
        });
        if (
          typeof recommenderList !== "undefined" &&
          recommenderList.length > 0
        ) {
          // set all widgets to false
          this.summaryCatalog.forEach((x) => {
            x.visible = false;
            if (x.data.targets.some((r) => names.includes(r))) {
              console.log("something got pushed with recommender");
              x.visible = true;
            }
          });
        }
        this.loadSummariesDone = true;
        this.afterDataLoad();
      });
  }

  /**
   * Subscription to changes in the parameter catalog
   */
  private ParametersSubscribe() {
    try {
      this.parameterCatSub = this.parameterService
        .getParameterUpdateListener()
        .subscribe((parameterCatalog: Parameter[]) => {
          this.parameterCatalog = parameterCatalog;

          const pSource = from(this.parameterCatalog);

          // Get list of all unique input categories that are user changeable (for customize section)
          pSource
            .pipe(
              filter((params) => params.definitionType === "user"),
              groupBy((params) => params.paraminfo[0].paramCategory),
              mergeMap((group) => zip(of(group.key)))
            )
            .subscribe((category) => {
              this.inputUserCategories.push(category[0]);
            });

          this.loadParametersDone = true;
          this.afterDataLoad();
        });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Load model specification from database
   */
  private loadModel() {
    // load model acronym catalog
    // TODO: remove second parameter, it is now dynamic
    this.acronymCatalogService.getAcronymCatalog(this.modelId, "en-us");

    // summaries catalog
    this.SummaryCatalogSubscribe();
    // this.summaryCatalogService.GetSummaryCatalog(this.modelId);

    // get the set catalog
    this.SetSubscribe();
    this.setCatalogService.getSetCatalog(this.modelId);

    // get the theme catalog
    this.ThemeCatalogSubscribe();
    this.themeCatalogService.getThemeCatalog(this.modelId);

    // get the model metadata by id (optional for now)
    this.modelCatalogService.getModel(this.modelId).subscribe(
      (modelData) => {
        this.model = {
          id: modelData.result[0]._id,
          modelName: modelData.result[0].modelName,
          modelDescription: modelData.result[0].modelDescription,
          info: modelData.result[0].info,
          dateCreated: new Date(modelData.result[0].dateCreated),
          dateModified: new Date(modelData.result[0].dateModified),
          softwareAgent: modelData.result[0].softwareAgent,
          license: modelData.result[0].license,
          version: modelData.result[0].version,
          sponsor: modelData.result[0].sponsor,
          creators: modelData.result[0].creators,
          hostServer: modelData.result[0].hostServer,
          serviceInfo: modelData.result[0].serviceInfo,
        };
        // console.log(this.model); // for development, comment this eventually

        // get parameter catalog by model id
        this.ParametersSubscribe();
        this.parameterService.getParameterCatalog(this.modelId);

        this.loadOutputCatalog();
      },
      (error) => {
        this.errorHandlerService.handleHttpError(error);
      }
    );
  }

  /**
   * Loads output catalog from the database for the current model
   */
  private loadOutputCatalog() {
    // reset the load outputs done flag
    this.loadOutputsDone = false;
    // get output catalog by model id (runs in parallel with gettting parameters)
    this.outputService.getOutputCatalog(this.modelId);
    this.SubscribeOutputs();
  }

  private SubscribeOutputs() {
    this.outputCatSub = this.outputService.getOutputUpdateListener().subscribe(
      (outputCatalog: ModelOutput[]) => {
        // filter outputs if canned scenario is set
        // if (typeof this.cannedScenario !== 'undefined') {
        //  this.outputService.setIncludes(this.cannedScenario.outputFilter);
        // }

        this.outputCatalog = outputCatalog;
        // console.log(this.outputCatalog);
        this.loadOutputsDone = true;
        this.afterDataLoad();

        // only need to listen one at a time
        this.outputCatSub.unsubscribe();
      },
      (error) => {
        this.errorHandlerService.handleHttpError(error);
      }
    );
  }

  /**
   * Reset the user scenario object
   */
  private resetUserScenario() {
    this.userScenario = {
      id: "",
      name: "",
      description: "",
      status: "ready",
      isPublic: true,
    };
  }

  /**
   * Resets the output catalog and calls model for execution
   * Used when the model has already run once on the workflow.
   */
  private resetOutputAndRun() {
    // reset the load outputs done flag
    this.loadOutputsDone = false;
    this.outputService.getOutputCatalog(this.modelId);
    this.outputCatSub = this.outputService.getOutputUpdateListener().subscribe(
      (outputCatalog: ModelOutput[]) => {
        this.outputCatalog = outputCatalog;
        // console.log(this.outputCatalog);
        this.loadOutputsDone = true;
        // refresh the user scenario model outputs
        this.userScenario.modelOutputs = this.outputCatalog;
        // unsubscribe now, only need this once
        this.outputCatSub.unsubscribe();
        // run again
        this.modelRunService.submitModelScenario(this.userScenario);
      },
      (error) => {
        this.errorHandlerService.handleHttpError(error);
      }
    );
  }

  /**
   * Get top 10 recommendations for the selected user role or perspective
   */
  private loadTop10Recommendations() {
    this.recommenderService
      .getRoleID(this.modelRunService.getUserRole())
      .subscribe(
        (response) => {
          const roleid = response["id"];
          this.recommenderService.getRoleRecommendation2(
            roleid,
            this.modelId,
            10
          );
          this.summaryCatalogService.GetSummaryCatalog(this.modelId);
        },
        (error) => {
          // console.log("No recommendations retrived");
          this.summaryCatalogService.GetSummaryCatalog(this.modelId);
          this.errorHandlerService.handleAngularError(error);
        }
      );
  }

  /**
   * Loads the user changeable inputs according to the selected category
   * @param category selected cutomize category
   */
  onInputCategoryPicked(category: string) {
    this.selectedInputCat = category;

    // clear the selected category of inputs
    this.inputCustomizeList = [];

    const pSource = from(this.parameterCatalog);

    // get the user changeable inputs from the selected category
    pSource
      .pipe(
        filter((params) => params.definitionType === "user"),
        filter((params) => params.paraminfo[0].paramCategory === category)
      )
      .subscribe((input) => this.inputCustomizeList.push(input));
  }

  /**
   * Loads the scenario themes according to the selected category on scenarios
   * @param category selected scenario category
   */
  onScenarioCategoryPicked(category: string) {
    // set selected scenario category
    this.selectedScenarioCat = category;

    // clear the selected scenario category
    this.themesCustomizeList = [];

    const tSource = from(this.themeCatalog);

    // get the themes from the selected category
    tSource
      .pipe(
        filter(
          (themes) =>
            themes.info[this.themeCatalogService.lanIndex].category === category
        )
      )
      .subscribe((theme) => {
        this.themesCustomizeList.push(theme);

        // sort theme by order property
        this.themesCustomizeList.sort((obj1, obj2) => {
          return obj1.order - obj2.order;
        });
      });
  }

  /**
   *  Destroy any left over subscriptions
   */
  ngOnDestroy() {
    if (
      typeof this.runSub !== "undefined" && // subscriptiuon to model runs
      typeof this.parameterCatSub !== "undefined" && // subscription to parameter catalog
      typeof this.outputCatSub !== "undefined"
    ) {
      this.outputCatSub.unsubscribe();
      this.parameterCatSub.unsubscribe();
      this.runSub.unsubscribe();
      this.setCatSub.unsubscribe();
    }

    if (typeof this.summaryCatSub !== "undefined") {
      this.summaryCatSub.unsubscribe();
    }

    if (typeof this.themeCatSub !== "undefined") {
      this.themeCatSub.unsubscribe();
    }
  }

  /**
   * Initializes the user scenario JSON object to be submitted for model execution.
   */
  initializeUserScenario() {
    // name and description empty
    this.userScenario.name = "";
    this.userScenario.description = "";
    // assign the user id if available (TODO: need to hash this eventually)
    this.userScenario.userid = null;
    // define model settings : tentative options -> unit system
    this.userScenario.modelSettings = new Array();
    this.userScenario.modelSettings.push({ modelID: this.modelId });
    // create array for model sets
    this.userScenario.modelSets = this.setCatalog;
    // assign parameter catalog
    this.userScenario.modelInputs = this.parameterCatalog;
    // assign output catalog
    this.userScenario.modelOutputs = this.outputCatalog;
  }

  /**
   *  Will initialize the user scenario after all model init data has finished loading.
   */
  afterDataLoad() {
    // debug printout
    // console.log('after data load');

    if (
      this.loadOutputsDone &&
      this.loadParametersDone &&
      this.loadThemesDone &&
      this.loadSetsDone
    ) {
      // sort categories alphabetically
      this.inputUserCategories.sort();
      this.inputScenarioCategories.sort();

      // set selected them
      this.SetSelectedThemes();

      // select the first scenario of each category
      this.loadFirstScenarioCategory();

      // subscribe to model runs
      if (typeof this.runSub === "undefined") {
        this.runSub = this.modelRunService
          .getScenarioUpdateListener()
          .subscribe((result: UserScenario) => {
            this.userScenario = result;
            this.outputCatalog = result.modelOutputs;
            this.outputService.setOutputCatalog(this.outputCatalog);
            this.loadTop10Recommendations();
            this.executionDone = true;
            this.isLoading = false;
            this.loadingLabel = "";
            setTimeout(() => {
              // move to view results step after outputs retrieved
              this.workFlow.selectedIndex = 2;
            }, 100);
            // console.log('Received scenario results:');
            // console.log(this.userScenario);
          });
      }

      // clear all flags - test code
      this.loadOutputsDone = false;
      this.loadParametersDone = false;
      this.loadThemesDone = false;
      this.loadSetsDone = false;
      this.loadSummariesDone = false;

      // hardcoded timeout
      this.isLoading = false;
      this.loadingLabel = "";

      // only when loading historicals move to final step
      if (this.executionDone === true) {
        setTimeout(() => {
          this.workFlow.selectedIndex = 2;
        }, 100);
      }
    }
  }

  /**
   * Step change event handler.
   */
  onStepChange(event: any) {
    if (event.selectedIndex === 0) {
      this.loadFirstScenarioCategory();
    } else if (event.selectedIndex === 1) {
      if(this.isCannedScenario){
        alert("Scenario executions are not permitted from a Canned Scenario View. For new executions navigate to Models, choose a Model, and select Create Scenario.");
        // Change step back to view results
        setTimeout(() => {
          this.workFlow.selectedIndex = 2;
        }, 100);
        return;
      }
      this.onRunScenario();
    } else {
      return;
    }
  }

  /**
   * Loads the first category of the scenarios section.
   */
  loadFirstScenarioCategory() {
    this.themesCustomizeList = [];

    setTimeout(() => {
      setTimeout(() =>
        this.onScenarioCategoryPicked(this.inputScenarioCategories[0])
      );
    });
  }

  /**
   * Show the input catalog and hide the stepper menu
   */
  onInputCatalog() {
    this.showInputCatalog = true;
  }

  /**
   * Close the input catalog and hide the stepper menu
   */
  onInputCatalogExit() {
    this.showInputCatalog = false;
  }

  /**
   * Showing output or input details event handler. Hides the navigation bar to go back.
   * @param event onDetail clicked event (input or output)
   */
  onDetails(event) {
    this.showNavigation = !event;
  }

  onInputDetails(event) {
    this.showNavigationInput = !event;
  }

  onTimeRange() {
    const dialogRef = this.dialog.open(TimeRangeDialogComponent, {
      width: "500px",
      data: this.modelId,
    });
  }

  /**
   * On selecting run scenario, open up popup to capture scenario name and description.
   * Subscribe to popup close and submit scenario if not cancelled.
   */
  onRunScenario() {
    // reset the scenario document
    this.resetUserScenario();
    this.modelRunService.scenarioThemes = null;
    this.modelRunService.scenarioThemes = new Array();
    this.initializeUserScenario();
    // Pre-Load scenario description according to selected themes.
    this.modelRunService.setScenarioDescription("");
    for (const theme of this.themeCatalog) {
      if (theme.isSelected) {
        this.modelRunService.appendScenarioTheme(theme._id);
        this.modelRunService.setScenarioDescription(
          this.modelRunService.getScenarioDescription() +
            theme.info[this.themeCatalogService.lanIndex].category +
            ": " +
            theme.info[this.themeCatalogService.lanIndex].title +
            " "
        );
      }
    }

    const dialogRef = this.dialog.open(RunDialogComponent, {
      width: "500px",
      data: this.userScenario,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // when the popup window is cancelled the result is undefined
      if (result == null) {
        console.log("Submit scenario was cancelled");
        // go back to input catalog
        this.workFlow.previous();
        return;
      }

      // validate scenario name and description
      if (result.name === "" || result.description === "") {
        console.log("Name or description is empty string");
        return;
      }

      // re-assign user scenario
      this.userScenario = result;

      // add notification of average execution time
      if (this.modelId === "5d76cc181328534d8cb7d17c") {
        this.loadingLabel = this.secondsLabel[this.lanIndex];
      } else {
        this.loadingLabel = this.minutesLabel[this.lanIndex];
      }

      // show the loading widget
      this.isLoading = true;

      // assign new unique id for user scenario
      this.userScenario.id = uuid.v4();

      // set the scenario themes
      for (const id in this.modelRunService.scenarioThemes) {
        if (typeof id !== "undefined" && id !== null) {
          this.userScenario.modelSettings.push({
            theme: this.modelRunService.scenarioThemes[id],
          });
        }
      }

      // check if the model was previously executed so the output catalog is reset
      if (this.executionDone === true) {
        this.executionDone = false;
        this.resetOutputAndRun();
        return;
      }

      // check what is been sent to the backend (debug)
      // console.log('Sending the following JSON for execution:');
      // console.log(this.userScenario);

      // submit scenario here
      this.modelRunService.submitModelScenario(this.userScenario);
    });
  }
}
